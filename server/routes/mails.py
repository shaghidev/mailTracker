from flask import Blueprint, request, jsonify
from datetime import datetime
from config import mails_collection, campaigns_collection, events_collection
from utils.helpers import str_to_objectid

bp = Blueprint("mails", __name__, strict_slashes=False)

# --- CREATE MAIL ---
@bp.route("/create_mail", methods=["POST"])
def create_mail():
    data = request.json
    campaign_id = data.get("campaign_id")
    recipient = data.get("recipient")
    subject = data.get("subject")
    html_content = data.get("html_content")

    if not campaign_id or not recipient or not subject or not html_content:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    campaign_obj_id = str_to_objectid(campaign_id)
    if not campaign_obj_id:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    mail = {
        "campaign_id": campaign_obj_id,
        "recipient": recipient,
        "subject": subject,
        "html_content": html_content,
        "sent_at": datetime.utcnow()
    }

    result = mails_collection.insert_one(mail)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})

# --- GET ALL MAILS ---
@bp.route("/", methods=["GET"])
def get_all_mails():
    mails = list(mails_collection.find())
    result = []
    for m in mails:
        result.append({
            "id": str(m["_id"]),
            "campaign_id": str(m["campaign_id"]),
            "recipient": m["recipient"],
            "subject": m["subject"],
            "html_content": m.get("html_content", ""),
            "sent_at": m.get("sent_at").isoformat()
        })
    return jsonify(result)
