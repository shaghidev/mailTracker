# campaigns.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import time
from typing import List
from urllib.parse import quote_plus
import re

from config import campaigns_collection, mails_collection
from routes.contacts import contact_lists_collection
from utils.helpers import str_to_objectid

# --- Load .env ---
load_dotenv()

bp = Blueprint('campaigns', __name__)

# --- Define multiple email accounts ---
EMAIL_ACCOUNTS = {
    "baltazargrad": {
        "emails": ["stream@baltazargrad.com"],
        "password": os.getenv("BALT_PASS"),
        "smtp_host": os.getenv("BALT_SMTP_HOST"),
        "smtp_port": int(os.getenv("BALT_SMTP_PORT") or 465)
    },
    "git": {
        "emails": ["laser@git.hr", "trgovina@git.hr", "newsletter@git.hr"],
        "password": os.getenv("GIT_PASS"),
        "smtp_host": os.getenv("GIT_SMTP_HOST"),
        "smtp_port": int(os.getenv("GIT_SMTP_PORT") or 465)
    }
}

USERS = {
    "stream": {"email": "stream@baltazargrad.com", "account": "baltazargrad"},
    "laser": {"email": "laser@git.hr", "account": "git"},
    "trgovina": {"email": "trgovina@git.hr", "account": "git"},
    "newsletter": {"email": "newsletter@git.hr", "account": "git"}
}

BATCH_SIZE = 20
BATCH_DELAY = 2  # sec

# --- Funkcija koja injektira tracking pixel i trackable linkove ---
def inject_tracking(html_template: str, recipient_email: str, campaign_id: str) -> str:
    """
    1. Automatski dodaje tracking pixel na kraj <body> ako ga nema.
    2. Zamjenjuje sve <a href="..."> linkove da idu preko track_click endpointa.
    """
    email_enc = quote_plus(recipient_email)
    campaign_enc = quote_plus(campaign_id)

    # --- Trackable links ---
    def replace_link(match):
        url = match.group(1)
        return f'href="https://mailtracker-7jvy.onrender.com/track_click?email={email_enc}&campaign_id={campaign_enc}&link={quote_plus(url)}"'
    
    html_template = re.sub(r'href="([^"]+)"', replace_link, html_template)

    # --- Tracking pixel ---
    tracking_pixel_tag = f'<img src="https://mailtracker-7jvy.onrender.com/track_open?email={email_enc}&campaign_id={campaign_enc}" width="1" height="1" style="display:none;">'
    
    # Dodaj na kraj <body> ili na kraj HTML-a
    if "</body>" in html_template:
        html_template = html_template.replace("</body>", tracking_pixel_tag + "</body>")
    else:
        html_template += tracking_pixel_tag

    return html_template


# --- Funkcija koja šalje pojedinačne mailove ---
def send_email_to_recipient(user_id: str, recipient: str, subject: str, html_content: str) -> bool:
    try:
        user_info = USERS[user_id]
        account_info = EMAIL_ACCOUNTS[user_info["account"]]

        msg = MIMEMultipart()
        msg['From'] = user_info["email"]
        msg['To'] = recipient
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP_SSL(account_info["smtp_host"], account_info["smtp_port"]) as server:
            server.login(user_info["email"], account_info["password"])
            server.send_message(msg)
        print(f"[SENT] Mail poslan: {recipient}")
        return True
    except Exception as e:
        print(f"[ERROR] Slanje na {recipient} nije uspjelo: {e}")
        return False

# --- Funkcija za batch slanje mailova s trackingom ---
def send_emails_in_batches(user_id: str, contacts: List[dict], subject: str, html_template: str, campaign_id: str) -> int:
    sent_count = 0
    for i in range(0, len(contacts), BATCH_SIZE):
        batch = contacts[i:i+BATCH_SIZE]
        for c in batch:
            recipient = c.get("email")
            if not recipient:
                continue
            
            # --- Inject tracking pixel i trackable linkove ---
            tracked_html = inject_tracking(html_template, recipient, campaign_id)

            if send_email_to_recipient(user_id, recipient, subject, tracked_html):
                sent_count += 1

                # --- Pohrana maila u DB s trackiranim HTML-om ---
                mails_collection.insert_one({
                    "campaign_id": str_to_objectid(campaign_id),
                    "recipient": recipient,
                    "subject": subject,
                    "html_content": tracked_html,
                    "sent_at": datetime.utcnow()
                })
        if i + BATCH_SIZE < len(contacts):
            time.sleep(BATCH_DELAY)
    return sent_count

# --- CREATE CAMPAIGN AND SEND MAILS ---
@bp.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")
    user = data.get("user", "stream")
    contact_list_id = data.get("contact_list")

    if not name or not subject or not html_template or not contact_list_id:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    # --- Spremi kampanju ---
    campaign = {
        "name": name,
        "subject": subject,
        "html_template": html_template,
        "user": user,
        "contact_list": contact_list_id,
        "created_at": datetime.utcnow()
    }
    result = campaigns_collection.insert_one(campaign)
    campaign_id = str(result.inserted_id)

    # --- Dohvati kontakte ---
    contact_list_obj = contact_lists_collection.find_one({"_id": str_to_objectid(contact_list_id)})
    if not contact_list_obj or "contacts" not in contact_list_obj:
        return jsonify({"status": "error", "message": "Contact list not found"}), 404

    contacts = contact_list_obj["contacts"]

    # --- Slanje mailova s trackingom ---
    emails_sent = send_emails_in_batches(user, contacts, subject, html_template, campaign_id)

    return jsonify({
        "status": "ok",
        "campaign_id": campaign_id,
        "emails_sent": emails_sent
    })

# --- GET ALL CAMPAIGNS ---
@bp.route("/", methods=["GET"])
def get_all_campaigns():
    campaigns = list(campaigns_collection.find())
    result = []
    for c in campaigns:
        campaign_id = c["_id"]
        sent_count = mails_collection.count_documents({"campaign_id": campaign_id})
        opened_count = mails_collection.count_documents({"campaign_id": campaign_id, "opened_at": {"$exists": True}})
        clicked_count = sum([m.get("click_count", 0) for m in mails_collection.find({"campaign_id": campaign_id})])

        result.append({
            "id": str(campaign_id),
            "name": c["name"],
            "subject": c.get("subject", ""),
            "html_template": c.get("html_template", ""),
            "user": c.get("user", "stream"),
            "contact_list": c.get("contact_list", "newsletter"),
            "createdAt": c.get("created_at").isoformat(),
            "sent": sent_count,
            "opened": opened_count,
            "clicked": clicked_count
        })
    return jsonify(result)

    campaigns = list(campaigns_collection.find())
    result = []
    for c in campaigns:
        result.append({
            "id": str(c["_id"]),
            "name": c["name"],
            "subject": c.get("subject", ""),
            "html_template": c.get("html_template", ""),
            "user": c.get("user", "stream"),
            "contact_list": c.get("contact_list", "newsletter"),
            "createdAt": c.get("created_at").isoformat()
        })
    return jsonify(result)


@bp.route("/track_open")
def track_open():
    email = request.args.get("email")
    campaign_id = request.args.get("campaign_id")
    mail = mails_collection.find_one({"campaign_id": str_to_objectid(campaign_id), "recipient": email})
    if mail:
        mails_collection.update_one(
            {"_id": mail["_id"]},
            {"$set": {"opened_at": datetime.utcnow()}}
        )
    return "", 200


# track_click.py
@bp.route("/track_click")
def track_click():
    email = request.args.get("email")
    campaign_id = request.args.get("campaign_id")
    link = request.args.get("link")
    mail = mails_collection.find_one({"campaign_id": str_to_objectid(campaign_id), "recipient": email})
    if mail:
        mails_collection.update_one(
            {"_id": mail["_id"]},
            {"$inc": {"click_count": 1}}
        )
    return "", 200
