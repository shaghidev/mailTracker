from flask import Flask, request, send_file, redirect, jsonify
from datetime import datetime
from bson import ObjectId
from config import campaigns_collection, mails_collection, events_collection, contact_lists_collection
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Omogućava sve domene

# --- Kreiranje nove kampanje ---
@app.route("/create_campaign", methods=["POST"])
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

# --- Dodavanje maila u kampanju ---
@app.route("/add_mail", methods=["POST"])
def add_mail():
    data = request.json
    campaign_id = data.get("campaign_id")
    email = data.get("email")

    if not campaign_id or not email:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    # Provjera da li kampanja postoji
    if not campaigns_collection.find_one({"_id": campaign_obj_id}):
        return jsonify({"status": "error", "message": "Campaign not found"}), 404

    mail_doc = {
        "campaign_id": campaign_obj_id,
        "email": email,
        "status": "pending",  # ili 'sent' ako odmah šalješ
        "sent_at": None
    }
    result = mails_collection.insert_one(mail_doc)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})

# --- Praćenje otvaranja maila ---
@app.route("/track_open")
def track_open():
    mail_id = request.args.get("mail_id")
    if not mail_id:
        return "", 400

    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return "", 400

    events_collection.insert_one({
        "mail_id": mail_obj_id,
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
    if not mail_id or not link:
        return "", 400

    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return "", 400

    events_collection.insert_one({
        "mail_id": mail_obj_id,
        "type": "click",
        "link": link,
        "timestamp": datetime.utcnow()
    })

    return redirect(link)

# --- Dohvati sve kampanje ---
@app.route("/api/campaigns", methods=["GET"])
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


# --- Praćenje poslanih mailova ---
@app.route("/track_sent")
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
        mails_collection.update_one(
            {"_id": mail_obj_id},
            {"$set": {"status": "sent", "sent_at": datetime.utcnow()}}
        )
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Mail not found"}), 404

# --- Statistika kampanje ---
@app.route("/campaign_stats/<campaign_id>")
def campaign_stats(campaign_id):
    try:
        campaign_obj_id = ObjectId(campaign_id)
    except:
        return jsonify({"status": "error", "message": "Invalid campaign_id"}), 400

    mails = list(mails_collection.find({"campaign_id": campaign_obj_id}))
    mail_ids = [m["_id"] for m in mails]

    opens = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "open"})
    clicks = events_collection.count_documents({"mail_id": {"$in": mail_ids}, "type": "click"})
    total_mails = len(mails)

    return jsonify({
        "total_mails": total_mails,
        "opens": opens,
        "clicks": clicks
    })
    
@app.route("/api/contact_lists", methods=["GET"])
def get_contact_lists():
    lists = list(contact_lists_collection.find())
    result = []
    for l in lists:
        result.append({
            "id": str(l["_id"]),
            "name": l["name"],
            "emails": l.get("emails", [])
        })
    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
