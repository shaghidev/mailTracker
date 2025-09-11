from flask import Flask, request, send_file
import pandas as pd
from io import BytesIO

app = Flask(__name__)

# Učitaj Excel s email adresama
excel_file = "excel/test.xlsx"
df = pd.read_excel(excel_file)

# Pretpostavljamo da ima kolonu "email"
emails = df['email'].tolist()

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    if email:
        print(f"📬 Otvoreno: {email}")
    # vraćamo 1x1 transparentni PNG
    return send_file(
        BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
                b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
                b"\x00\x00\x00\nIDATx\xdacd\xf8\xff\xff?\x00\x05\xfe\x02"
                b"\xfeA^\x0b\x00\x00\x00\x00IEND\xaeB`\x82"),
        mimetype='image/png'
    )

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    link = request.args.get("link")
    if email and link:
        print(f"🖱 Klik: {email} -> {link}")
    return "Redirecting...", 302, {"Location": link or "#"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
