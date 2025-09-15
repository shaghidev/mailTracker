from flask import Blueprint, request, jsonify
from datetime import datetime
from config import campaigns_collection, mails_collection
from utils.helpers import str_to_objectid

bp = Blueprint('campaigns', __name__)

@bp.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")

    if not name or not subject or not html_template:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    campaign = {
        "name": name,
        "subject": subject,
        "html_template": html_template,
        "created_at": datetime.utcnow()
    }

    result = campaigns_collection.insert_one(campaign)
    return jsonify({"status": "ok", "campaign_id": str(result.inserted_id)})

@bp.route("/api/campaigns", methods=["GET"])
def get_all_campaigns():
    campaigns = list(campaigns_collection.find())
    result = []
    for c in campaigns:
        result.append({
            "id": str(c["_id"]),
            "name": c["name"],
            "subject": c.get("subject", ""),
            "html_template": c.get("html_template", ""),
            "createdAt": c.get("created_at").isoformat()
        })
    return jsonify(result)

@bp.route("/campaign_stats/<campaign_id>")
def campaign_stats(campaign_id):
    campaign_obj_id = str_to_objectid(campaign_id)
    if not campaign_obj_id:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    mails = list(mails_collection.find({"campaign_id": campaign_obj_id}))
    mail_ids = [m["_id"] for m in mails]

    from config import events_collection
    opens = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "open"})
    clicks = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "click"})
    total_mails = len(mails)

    return jsonify({
        "total_mails": total_mails,
        "opens": opens,
        "clicks": clicks
    })
