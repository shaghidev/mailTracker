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
from bson import ObjectId
import threading

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

BATCH_SIZE = 3
BATCH_DELAY = 30

# --- Funkcija koja injektira tracking pixel i trackable linkove ---
def inject_tracking(html_template: str, recipient_email: str, campaign_id: str) -> str:
    email_enc = quote_plus(recipient_email)
    campaign_enc = quote_plus(campaign_id)

    # --- Trackable links ---
    def replace_link(match):
        url = match.group(1)
        return f'href="https://mailtracker-7jvy.onrender.com/api/campaigns/track_click?email={email_enc}&campaign_id={campaign_enc}&link={quote_plus(url)}"'
    
    html_template = re.sub(r'href="([^"]+)"', replace_link, html_template)

    # --- Tracking pixel ---
    tracking_pixel_tag = f'<img src="https://mailtracker-7jvy.onrender.com/api/campaigns/track_open?email={email_enc}&campaign_id={campaign_enc}" width="1" height="1" style="display:none;">'
    
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

def send_email_batch(user_id: str, recipients: list, subject: str, html_content: str) -> bool:
    try:
        user_info = USERS[user_id]
        account_info = EMAIL_ACCOUNTS[user_info["account"]]

        print(f"[BATCH-DEBUG] Pripremam batch: user={user_info['email']}, smtp_host={account_info['smtp_host']}, smtp_port={account_info['smtp_port']}, broj primatelja={len(recipients)}")
        print(f"[BATCH-DEBUG] BCC lista: {recipients}")

        msg = MIMEMultipart()
        msg['From'] = user_info["email"]
        msg['To'] = user_info["email"]
        msg['Subject'] = subject
        msg.attach(MIMEText(html_content, 'html'))
        msg['Bcc'] = ", ".join(recipients)

        print(f"[BATCH-DEBUG] Spajam se na SMTP server...")
        with smtplib.SMTP_SSL(account_info["smtp_host"], account_info["smtp_port"]) as server:
            print(f"[BATCH-DEBUG] Login na SMTP kao {user_info['email']}")
            server.login(user_info["email"], account_info["password"])
            print(f"[BATCH-DEBUG] Šaljem batch poruku...")
            server.send_message(msg)
        print(f"[SENT] Batch poslan na: {recipients}")
        return True
    except Exception as e:
        print(f"[ERROR] Slanje batcha nije uspjelo: {e}")
        import traceback
        traceback.print_exc()
        return False

# --- Funkcija za batch slanje mailova s trackingom ---
def send_emails_in_batches(user_id, contacts, subject, html_template, campaign_id):
    sent_count = 0
    campaign_obj_id = ObjectId(campaign_id)
    total = len(contacts)
    print(f"[BATCH] Počinjem slanje {total} mailova, batch_size={BATCH_SIZE}, delay={BATCH_DELAY}s")
    for i in range(0, total, BATCH_SIZE):
        print(f"[BATCH-DEBUG] Batch {i//BATCH_SIZE+1}: indexi {i} do {i+BATCH_SIZE-1}")
        batch_contacts = contacts[i:i+BATCH_SIZE]
        batch_emails = [c.get("email") for c in batch_contacts if c.get("email")]
        print(f"[BATCH-DEBUG] Batch emails: {batch_emails}")
        if not batch_emails:
            print(f"[SKIP] Batch bez emaila: {batch_contacts}")
            continue
        tracked_html = inject_tracking(html_template, batch_emails[0], campaign_id)
        print(f"[SEND] Pokušavam poslati batch na: {batch_emails}")
        if send_email_batch(user_id, batch_emails, subject, tracked_html):
            sent_count += len(batch_emails)
            for recipient in batch_emails:
                mails_collection.insert_one({
                    "campaign_id": campaign_obj_id,
                    "recipient": recipient,
                    "subject": subject,
                    "html_content": tracked_html,
                    "sent_at": datetime.utcnow(),
                    "click_count": 0
                })
        else:
            print(f"[FAIL] Batch NIJE poslan: {batch_emails}")
        print(f"[BATCH] Batch {i//BATCH_SIZE+1} gotov, čekam {BATCH_DELAY}s")
        if i + BATCH_SIZE < total:
            print(f"[BATCH-DEBUG] Spavam {BATCH_DELAY}s prije sljedećeg batcha...")
            time.sleep(BATCH_DELAY)
    print(f"[BATCH] Slanje batcha završeno, ukupno poslanih: {sent_count}/{total}")
    return sent_count

def send_emails_background(user_id, contacts, subject, html_template, campaign_id):
    try:
        print(f"[BG] Pokrećem slanje mailova u pozadini za kampanju {campaign_id}, broj kontakata: {len(contacts)}")
        send_emails_in_batches(user_id, contacts, subject, html_template, campaign_id)
        print(f"[BG] Slanje mailova u pozadini završeno za kampanju {campaign_id}")
    except Exception as e:
        print(f"[BG ERROR] Greška u background slanju: {e}")

# --- CREATE CAMPAIGN AND SEND MAILS ---
@bp.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")
    user = data.get("user", "stream")
    contact_list_id = data.get("contact_list")

    print(f"[CREATE] Primljen zahtjev za kreiranje kampanje: {name}, korisnik: {user}, lista: {contact_list_id}")

    if not name or not subject or not html_template or not contact_list_id:
        print("[CREATE] Greška: Nedostaju polja")
        return jsonify({"status": "error", "message": "Missing fields"}), 400

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
    print(f"[CREATE] Kampanja spremljena u bazu, id: {campaign_id}")

    contact_list_obj = contact_lists_collection.find_one({"_id": str_to_objectid(contact_list_id)})
    if not contact_list_obj or "contacts" not in contact_list_obj:
        print("[CREATE] Greška: Lista kontakata nije pronađena ili nema kontakata")
        return jsonify({"status": "error", "message": "Contact list not found"}), 404

    contacts = contact_list_obj["contacts"]
    print(f"[CREATE] Broj kontakata u listi: {len(contacts)}")

    # Pokreni slanje mailova u pozadini (thread)
    threading.Thread(
        target=send_emails_background,
        args=(user, contacts, subject, html_template, campaign_id),
        daemon=True
    ).start()

    print(f"[CREATE] Pokrenuto slanje mailova u pozadini za kampanju {campaign_id}")

    return jsonify({
        "status": "ok",
        "campaign_id": campaign_id,
        "emails_sent": 0,
        "message": "Slanje mailova je pokrenuto u pozadini."
    })

# --- GET ALL CAMPAIGNS ---
@bp.route("/", methods=["GET"])
def get_all_campaigns():
    campaigns = list(campaigns_collection.find())
    result = []
    for c in campaigns:
        campaign_id = c["_id"]
        sent_count = mails_collection.count_documents({"campaign_id": campaign_id})
        opened_count = mails_collection.count_documents({
            "campaign_id": campaign_id,
            "opened_at": {"$exists": True}
        })
        clicked_count = sum([
            m.get("click_count", 0)
            for m in mails_collection.find({"campaign_id": campaign_id})
        ])

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

@bp.route("/track_open")
def track_open():
    email = request.args.get("email")
    campaign_id = request.args.get("campaign_id")
    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        campaign_obj_id = campaign_id  # fallback ako nije validan ObjectId
    mail = mails_collection.find_one({"campaign_id": campaign_obj_id, "recipient": email})
    if mail:
        mails_collection.update_one(
            {"_id": mail["_id"]},
            {"$set": {"opened_at": datetime.utcnow()}}
        )
        print(f"[OPEN] Email otvoren od strane: {email}, kampanja: {campaign_id}")
    else:
        print(f"[OPEN] Mail nije pronađen za {email} i kampanju {campaign_id}")
    return "", 200

@bp.route("/track_click")
def track_click():
    email = request.args.get("email")
    campaign_id = request.args.get("campaign_id")
    link = request.args.get("link")
    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        campaign_obj_id = campaign_id
    mail = mails_collection.find_one({"campaign_id": campaign_obj_id, "recipient": email})
    if mail:
        mails_collection.update_one(
            {"_id": mail["_id"]},
            {"$inc": {"click_count": 1}}
        )
    return "", 200
