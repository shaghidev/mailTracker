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
        return True
    except Exception as e:
        print(f"[ERROR] Slanje na {recipient} nije uspjelo: {e}")
        return False


# --- Funkcija za batch slanje mailova ---
def send_emails_in_batches(user_id: str, recipients: List[str], subject: str, html_content: str) -> int:
    sent_count = 0
    for i in range(0, len(recipients), BATCH_SIZE):
        batch = recipients[i:i+BATCH_SIZE]
        for recipient in batch:
            if send_email_to_recipient(user_id, recipient, subject, html_content):
                sent_count += 1
        if i + BATCH_SIZE < len(recipients):
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
    recipients = [c["email"] for c in contacts if c.get("email")]

    # --- Slanje mailova ---
    emails_sent = send_emails_in_batches(user, recipients, subject, html_template)

    # --- Pohrana mailova ---
    for c in contacts:
        if c.get("email") in recipients:
            mails_collection.insert_one({
                "campaign_id": str_to_objectid(campaign_id),
                "recipient": c["email"],
                "subject": subject,
                "html_content": html_template,
                "sent_at": datetime.utcnow()
            })

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
