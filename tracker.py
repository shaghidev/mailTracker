from flask import Flask, request, send_file, redirect
from io import BytesIO
import pandas as pd

app = Flask(__name__)

# Učitaj Excel s emailovima jednom pri startu (ako je potrebno)
excel_file = "excel/test.xlsx"
df = pd.read_excel(excel_file)
emails = df['Email'].tolist()

@app.route("/track_open")
def track_open():
    email = request.args.get("email")
    if email and email in emails:
        print(f"📬 Otvoreno: {email}")
    # Vraćamo 1x1 transparentni PNG
    png = BytesIO(
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
        b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
        b"\x00\x00\x00\nIDATx\xdacd\xf8\xff\xff?\x00\x05\xfe\x02"
        b"\xfeA^\x0b\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    return send_file(png, mimetype="image/png")

@app.route("/track_click")
def track_click():
    email = request.args.get("email")
    link = request.args.get("link")
    if email and link and email in emails:
        print(f"🖱 Klik: {email} -> {link}")
    return redirect(link or "#")

if __name__ == "__main__":
    # Render sam automatski koristi PORT varijablu
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
