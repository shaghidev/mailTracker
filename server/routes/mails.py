from flask import Blueprint, request, send_file, redirect, jsonify
from datetime import datetime
from config import mails_collection, campaigns_collection, events_collection
from utils.helpers import str_to_objectid
import io

bp = Blueprint('mails', __name__)

@bp.route("/add_mail", methods=["POST"])
def add_mail():
    data = request.json
    campaign_id = data.get("campaign_id")
    email = data.get("email")

    if not campaign_id or not email:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    campaign_obj_id = str_to_objectid(campaign_id)
    if not campaign_obj_id:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    if not campaigns_collection.find_one({"_id": campaign_obj_id}):
        return jsonify({"status": "error", "message": "Campaign not found"}), 404

    mail_doc = {
        "campaign_id": campaign_obj_id,
        "email": email,
        "status": "pending",
        "sent_at": None
    }
    result = mails_collection.insert_one(mail_doc)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})

@bp.route("/track_open")
def track_open():
    mail_id = request.args.get("mail_id")
    mail_obj_id = str_to_objectid(mail_id)
    if not mail_obj_id:
        return "", 400

    events_collection.insert_one({
        "mail_id": mail_obj_id,
        "type": "open",
        "timestamp": datetime.utcnow()
    })

    # 1x1 transparent PNG
    transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' \
                        b'\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06' \
                        b'\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00' \
                        b'\x0bIDATx\xdac\x00\x01\x00\x00\x05\x00' \
                        b'\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return send_file(io.BytesIO(transparent_pixel), mimetype="image/png")

@bp.route("/track_click")
def track_click():
    mail_id = request.args.get("mail_id")
    link = request.args.get("link")
    mail_obj_id = str_to_objectid(mail_id)
    if not mail_obj_id or not link:
        return "", 400

    events_collection.insert_one({
        "mail_id": mail_obj_id,
        "type": "click",
        "link": link,
        "timestamp": datetime.utcnow()
    })

    return redirect(link)

@bp.route("/track_sent")
def track_sent():
    mail_id = request.args.get("mail_id")
    mail_obj_id = str_to_objectid(mail_id)
    if not mail_obj_id:
        return jsonify({"status": "error", "message": "Invalid mail_id"}), 400

    mail = mails_collection.find_one({"_id": mail_obj_id})
    if mail:
        mails_collection.update_one(
            {"_id": mail_obj_id},
            {"$set": {"status": "sent", "sent_at": datetime.utcnow()}}
        )
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Mail not found"}), 404
