from flask import Flask, request, send_file, redirect, jsonify
from datetime import datetime
from bson import ObjectId
from config import campaigns_collection, mails_collection, events_collection
import io

app = Flask(__name__)

# --- Kreiranje nove kampanje ---
@app.route("/create_campaign", methods=["POST"])
def create_campaign():
    data = request.json
    name = data.get("name")
    subject = data.get("subject")
    html_template = data.get("html_template")

    campaign = {
        "name": name,
        "subject": subject,
        "html_template": html_template,
        "created_at": datetime.utcnow()
    }

    result = campaigns_collection.insert_one(campaign)
    return jsonify({"status": "ok", "campaign_id": str(result.inserted_id)})

# --- Slanje maila (dodajemo u mails kolekciju) ---
@app.route("/add_mail", methods=["POST"])
def add_mail():
    data = request.json
    campaign_id = data.get("campaign_id")
    email = data.get("email")
    mail_doc = {
        "campaign_id": ObjectId(campaign_id),
        "email": email,
        "status": "sent",
        "sent_at": datetime.utcnow()
    }
    result = mails_collection.insert_one(mail_doc)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})

# --- Praćenje otvaranja ---
@app.route("/track_open")
def track_open():
    mail_id = request.args.get("mail_id")
    events_collection.insert_one({
        "mail_id": ObjectId(mail_id),
        "type": "open",
        "timestamp": datetime.utcnow()
    })

    # 1x1 transparentna PNG
    transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' \
                        b'\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06' \
                        b'\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00' \
                        b'\x0bIDATx\xdac\x00\x01\x00\x00\x05\x00' \
                        b'\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return send_file(io.BytesIO(transparent_pixel), mimetype="image/png")

# --- Praćenje klikova ---
@app.route("/track_click")
def track_click():
    mail_id = request.args.get("mail_id")
    link = request.args.get("link")

    events_collection.insert_one({
        "mail_id": ObjectId(mail_id),
        "type": "click",
        "link": link,
        "timestamp": datetime.utcnow()
    })

    return redirect(link)

# --- Praćenje poslanih mailova ---
@app.route("/track_sent")
def track_sent():
    mail_id = request.args.get("mail_id")
    mail = mails_collection.find_one({"_id": ObjectId(mail_id)})
    if mail:
        mails_collection.update_one(
            {"_id": ObjectId(mail_id)},
            {"$set": {"status": "sent", "sent_at": datetime.utcnow()}}
        )
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "mail not found"}), 404

# --- Endpoint za statistiku kampanje ---
@app.route("/campaign_stats/<campaign_id>")
def campaign_stats(campaign_id):
    mails = list(mails_collection.find({"campaign_id": ObjectId(campaign_id)}))
    mail_ids = [m["_id"] for m in mails]

    opens = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "open"})
    clicks = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "click"})
    total_mails = len(mails)

    return jsonify({
        "total_mails": total_mails,
        "opens": opens,
        "clicks": clicks
    })

if __name__ == "__main__":
    app.run(debug=True)
