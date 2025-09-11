import os
from flask import Flask, request

app = Flask(__name__)

# --- LOG FUNCTION ---
def log_action(action: str, email: str):
    print(f"[{action.upper()}] {email}")

# --- ROUTES ---
@app.route("/")
def home():
    return "Flask app radi! 🚀"

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    if email:
        log_action("open", email)
    return "", 200

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    if email:
        log_action("click", email)
    return "", 302

# --- Note: ne treba app.run za produkciju ---
# Gunicorn će preuzeti hosting i port

