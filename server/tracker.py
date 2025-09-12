from flask import Flask, request, send_file, redirect, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from bson import ObjectId
import bcrypt
import jwt
import io
from config import (
    campaigns_collection,
    mails_collection,
    events_collection,
    users_collection,
    JWT_SECRET,
    JWT_EXP_DELTA_SECONDS
)
from middleware.auth_middleware import auth_required

# --- Flask app ---
app = Flask(__name__)
CORS(app)

# --- Auth routes ---
@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400
    if users_collection.find_one({"email": email}):
        return jsonify({"status": "error", "message": "User already exists"}), 400

    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {"email": email, "password": hashed_pw, "created_at": datetime.utcnow()}
    result = users_collection.insert_one(user)

    token = jwt.encode(
        {"user_id": str(result.inserted_id), "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)},
        JWT_SECRET,
        algorithm="HS256"
    )
    return jsonify({"status": "ok", "token": token})


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    token = jwt.encode(
        {"user_id": str(user["_id"]), "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)},
        JWT_SECRET,
        algorithm="HS256"
    )
    return jsonify({"status": "ok", "token": token})


# --- Campaign routes ---
@app.route("/create_campaign", methods=["POST"])
@auth_required
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


@app.route("/add_mail", methods=["POST"])
@auth_required
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

    # Provjera ownershipa
    campaign = campaigns_collection.find_one({"_id": campaign_obj_id, "owner_id": ObjectId(user_id)})
    if not campaign:
        return jsonify({"status": "error", "message": "Campaign not found or access denied"}), 404

    mail_doc = {"campaign_id": campaign_obj_id, "email": email, "status": "pending", "sent_at": None}
    result = mails_collection.insert_one(mail_doc)
    return jsonify({"status": "ok", "mail_id": str(result.inserted_id)})


@app.route("/api/campaigns", methods=["GET"])
@auth_required
def get_all_campaigns(user_id):
    campaigns = list(campaigns_collection.find({"owner_id": ObjectId(user_id)}))
    return jsonify([
        {
            "id": str(c["_id"]),
            "name": c["name"],
            "subject": c.get("subject", ""),
            "html_template": c.get("html_template", ""),
            "createdAt": c.get("created_at").isoformat()
        }
        for c in campaigns
    ])


@app.route("/campaign_stats/<campaign_id>")
@auth_required
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


# --- Tracking routes (bez auth) ---
@app.route("/track_open")
def track_open():
    mail_id = request.args.get("mail_id")
    if not mail_id:
        return "", 400
    try:
        mail_obj_id = ObjectId(mail_id)
    except:
        return "", 400
    events_collection.insert_one({"mail_id": mail_obj_id, "type": "open", "timestamp": datetime.utcnow()})
    transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' \
                        b'\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06' \
                        b'\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00' \
                        b'\x0bIDATx\xdac\x00\x01\x00\x00\x05\x00' \
                        b'\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return send_file(io.BytesIO(transparent_pixel), mimetype="image/png")


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
    events_collection.insert_one({"mail_id": mail_obj_id, "type": "click", "link": link, "timestamp": datetime.utcnow()})
    return redirect(link)


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
        mails_collection.update_one({"_id": mail_obj_id}, {"$set": {"status": "sent", "sent_at": datetime.utcnow()}})
        return jsonify({"status": "ok"})
    return jsonify({"status": "error", "message": "Mail not found"}), 404


# --- Main ---
if __name__ == "__main__":
    app.run(debug=True)
