import os
from flask import Flask, request, redirect
from datetime import datetime

app = Flask(__name__)

@app.route("/")
def home():
    return "Flask app radi! 🚀"

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    action = "[OPEN]"
    print(f"{action} {email}")  # čisti output
    return "", 200

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    link = request.args.get("link", "https://baltazargrad.com")
    action = "[CLICK]"
    print(f"{action} {email}")  # čisti output
    return redirect(link, code=302)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
