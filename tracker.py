from flask import Flask, request, send_file, redirect
from datetime import datetime
from bson import ObjectId
from config import events_collection
import io

app = Flask(__name__)

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id")

    events_collection.insert_one({
        "type": "open",
        "email": email,
        "mail_id": mail_id,
        "timestamp": datetime.utcnow()
    })

    # Vrati 1x1 transparentnu PNG sliku
    transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR' \
                        b'\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06' \
                        b'\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00' \
                        b'\x0bIDATx\xdac\x00\x01\x00\x00\x05\x00' \
                        b'\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
    return send_file(io.BytesIO(transparent_pixel), mimetype="image/png")

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id")
    link = request.args.get("link")

    events_collection.insert_one({
        "type": "click",
        "email": email,
        "mail_id": mail_id,
        "link": link,
        "timestamp": datetime.utcnow()
    })

    return redirect(link)  # korisnika preusmjeri na originalni link

@app.route("/track_sent")
def track_sent():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id")

    events_collection.insert_one({
        "type": "sent",
        "email": email,
        "mail_id": mail_id,
        "timestamp": datetime.utcnow()
    })

    return {"status": "ok"}
