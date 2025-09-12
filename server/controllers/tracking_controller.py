from flask import request, redirect, send_file, jsonify
from config import events_collection, mails_collection
from bson import ObjectId
from datetime import datetime
import io

def track_open():
    mail_id = request.args.get("mail_id")
    if not mail_id:
        return "", 400
    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return "", 400
    events_collection.insert_one({"mail_id": mail_obj_id, "type": "open", "timestamp": datetime.utcnow()})
    pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' \
            b'\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06' \
            b'\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00' \
            b'\x0bIDATx\xdac\x00\x01\x00\x00\x05\x00' \
            b'\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return send_file(io.BytesIO(pixel), mimetype="image/png")

def track_click():
    mail_id = request.args.get("mail_id")
    link = request.args.get("link")
    if not mail_id or not link:
        return "", 400
    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return "", 400
    events_collection.insert_one({"mail_id": mail_obj_id, "type": "click", "link": link, "timestamp": datetime.utcnow()})
    return redirect(link)

def track_sent():
    mail_id = request.args.get("mail_id")
    if not mail_id:
        return jsonify({"status": "error", "message": "Missing mail_id"}), 400
    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return jsonify({"status": "error", "message": "Invalid mail_id"}), 400
    mail = mails_collection.find_one({"_id": mail_obj_id})
    if mail:
        mails_collection.update_one({"_id": mail_obj_id}, {"$set": {"status": "sent", "sent_at": datetime.utcnow()}})
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Mail not found"}), 404
