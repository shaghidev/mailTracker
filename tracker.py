import os
from flask import Flask, request, redirect, send_file
from config import events_collection
from io import BytesIO

app = Flask(__name__)


# Logging event u MongoDB
def log_event(email, mail_id, event_type, url=None):
    doc = {
        "email": email,
        "mail_id": mail_id,
        "event_type": event_type,
        "url": url
    }
    events_collection.insert_one(doc)

# Tracking otvaranja maila
@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id")
    if email and mail_id:
        log_event(email, mail_id, "open")
    # Vrati 1x1 transparentnu sliku
    img = BytesIO(b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b')
    return send_file(img, mimetype='image/gif')

# Tracking klikova
@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id")
    url = request.args.get("url")
    if email and mail_id and url:
        log_event(email, mail_id, "click", url)
        return redirect(url)
    return "Invalid", 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
