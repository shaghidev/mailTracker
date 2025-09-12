from flask import request, jsonify
from config import campaigns_collection, mails_collection, events_collection
from bson import ObjectId
from datetime import datetime

def create_campaign(user_id):
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
        "created_at": datetime.utcnow(),
        "owner_id": ObjectId(user_id)
    }
    result = campaigns_collection.insert_one(campaign)
    return jsonify({"status": "ok", "campaign_id": str(result.inserted_id)})

def add_mail(user_id):
    data = request.json
    campaign_id = data.get("campaign_id")
    email = data.get("email")
    if not campaign_id or not email:
        return jsonify({"status": "error", "message": "Missing fields"}), 400
    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    campaign = campaigns_collection.find_one({"_id": campaign_obj_id, "owner_id": ObjectId(user_id)})
    if not campaign:
        return jsonify({"status": "error", "message": "Campaign not found or access denied"}), 404

    mail_doc = {"campaign_id": campaign_obj_id, "email": email, "status": "pending", "sent_at": None}
    result = mails_collection.insert_one(mail_doc)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})

def get_all_campaigns(user_id):
    campaigns = list(campaigns_collection.find({"owner_id": ObjectId(user_id)}))
    return jsonify([
        {
            "id": str(c["_id"]),
            "name": c["name"],
            "subject": c.get("subject", ""),
            "html_template": c.get("html_template", ""),
            "createdAt": c.get("created_at").isoformat()
        } for c in campaigns
    ])

def campaign_stats(user_id, campaign_id):
    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    campaign = campaigns_collection.find_one({"_id": campaign_obj_id, "owner_id": ObjectId(user_id)})
    if not campaign:
        return jsonify({"status": "error", "message": "Campaign not found or access denied"}), 404

    mails = list(mails_collection.find({"campaign_id": campaign_obj_id}))
    mail_ids = [m["_id"] for m in mails]
    opens = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "open"})
    clicks = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "click"})

    return jsonify({"total_mails": len(mails), "opens": opens, "clicks": clicks})
