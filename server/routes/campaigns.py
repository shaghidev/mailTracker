# campaigns.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from dotenv import load_dotenv
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from config import campaigns_collection, mails_collection
from routes.contacts import contact_lists_collection  # za dohvat kontakata
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

# --- Funkcija za slanje maila ---
def send_email_to_recipient(user_id: str, recipient: str, subject: str, html_content: str):
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
        return True
    except Exception as e:
        print(f"[ERROR] Slanje na {recipient} nije uspjelo: {e}")
        return False

    try:
        user_info = USERS.get(user_id)
        if not user_info:
            print(f"[ERROR] User {user_id} not found")
            return False

        account_info = EMAIL_ACCOUNTS[user_info["account"]]

        msg = MIMEMultipart()
        msg['From'] = user_info["email"]
        msg['To'] = user_info["email"]  # kasnije se mijenja u stvarnog recipienta
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))

        with smtplib.SMTP_SSL(account_info["smtp_host"], account_info["smtp_port"]) as server:
            server.login(user_info["email"], account_info["password"])
            server.send_message(msg)
        return True
    except Exception as e:
        print(f"[ERROR] Slanje na {user_id} ({user_info['email']}) nije uspjelo: {e}")
        return False


# --- CREATE CAMPAIGN AND SEND MAILS ---
@bp.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")
    user = data.get("user", "stream")  # default na prvi user
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

    # --- Pošalji mailove i spremi u mails_collection ---
    sent_count = 0
    for c in contacts:
        recipient = c.get("email")
        if recipient:
            # Prilagodi send_email_smtp da koristi stvarnog recipienta
            success = send_email_to_recipient(user, recipient, subject, html_template)
            if success:
                sent_count += 1
                mails_collection.insert_one({
                    "campaign_id": str_to_objectid(campaign_id),
                    "recipient": recipient,
                    "subject": subject,
                    "html_content": html_template,
                    "sent_at": datetime.utcnow()
                })

    return jsonify({
        "status": "ok",
        "campaign_id": campaign_id,
        "emails_sent": sent_count
    })


# --- Funkcija koja zapravo šalje mail na recipienta ---
def send_email_to_recipient(user_id: str, recipient: str, subject: str, html_content: str):
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
        return True
    except Exception as e:
        print(f"[ERROR] Slanje na {recipient} nije uspjelo: {e}")
        return False


# --- GET ALL CAMPAIGNS ---
@bp.route("/", methods=["GET"])
def get_all_campaigns():
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
