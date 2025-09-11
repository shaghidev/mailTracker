from flask import Flask, request, redirect, send_file, make_response
from datetime import datetime
import os

app = Flask(__name__)

OPEN_LOG = "opened_emails.csv"
CLICK_LOG = "clicked_links.csv"

# --- Ako pixel ne postoji, kreiraj bijeli 1x1 PNG ---
if not os.path.exists("pixel.png"):
    from PIL import Image
    img = Image.new('RGBA', (1, 1), (255, 255, 255, 0))
    img.save("pixel.png")

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    mail_id = request.args.get("mail_id", "0")
    if email:
        print(f"[OPEN] {email} otvorio mail {mail_id}")
        with open(OPEN_LOG, "a") as f:
            f.write(f"{datetime.now()},{email},{mail_id}\n")
    # Vratimo tracking pixel i uklonimo ngrok warning page
    resp = make_response(send_file("pixel.png", mimetype='image/png'))
    resp.headers["ngrok-skip-browser-warning"] = "true"
    return resp

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    target = request.args.get("target")
    link_id = request.args.get("link_id", "0")
    if email and target:
        print(f"[CLICK] {email} kliknuo link {link_id} -> {target}")
        with open(CLICK_LOG, "a") as f:
            f.write(f"{datetime.now()},{email},{link_id},{target}\n")
        resp = redirect(target)
        resp.headers["ngrok-skip-browser-warning"] = "true"
        return resp
    return "Invalid request", 400

if __name__ == "__main__":
    app.run(port=5000, debug=True)
