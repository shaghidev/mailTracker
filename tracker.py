from flask import Flask, request, redirect

app = Flask(__name__)

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    print(f"[OPEN] {email}")  # ispisuje samo email
    # vraća 1x1 transparent pixel
    return b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00\xFF\xFF\xFF\x21\xF9\x04\x01\x00\x00\x00\x00\x2C\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3B', 200, {'Content-Type': 'image/gif'}

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    link = request.args.get("link")
    print(f"[CLICK] {email}")  # ispisuje samo email
    return redirect(link or "https://baltazargrad.com")

if __name__ == "__main__":
    app.run(debug=True)
