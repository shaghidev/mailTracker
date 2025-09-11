import os
from flask import Flask, request, redirect

app = Flask(__name__)

@app.route("/")
def home():
    return "Flask app radi! 🚀"

# Open tracking
@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    print(f"[OPEN] {email}")
    return "", 200  # transparentni pixel bi tu mogao ići, ali za test dosta je 200

# Click tracking
@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    link = request.args.get("link", "https://baltazargrad.com")  # fallback link
    print(f"[CLICK] {email}")
    return redirect(link, code=302)  # normalno redirekta korisnika

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # koristi PORT iz okoline
    app.run(host="0.0.0.0", port=port)
