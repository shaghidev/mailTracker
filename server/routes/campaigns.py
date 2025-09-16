from flask import Blueprint, request, jsonify
from datetime import datetime
from config import campaigns_collection
from utils.helpers import str_to_objectid

bp = Blueprint('campaigns', __name__)

# --- CREATE CAMPAIGN ---
@bp.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")
    user = data.get("user", "main")             # account od frontend-a
    contact_list = data.get("contact_list", "newsletter") # lista od frontend-a

    if not name or not subject or not html_template:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    campaign = {
        "name": name,
        "subject": subject,
        "html_template": html_template,
        "user": user,
        "contact_list": contact_list,
        "created_at": datetime.utcnow()
    }

    result = campaigns_collection.insert_one(campaign)
    return jsonify({"status": "ok", "campaign_id": str(result.inserted_id)})

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
            "user": c.get("user", "main"),
            "contact_list": c.get("contact_list", "newsletter"),
            "createdAt": c.get("created_at").isoformat()
        })
    return jsonify(result)
