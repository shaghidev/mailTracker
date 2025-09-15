from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)

# Omogućavamo CORS za sve domene, sve metode i sve header-e
CORS(
    app,
    origins="*",  # dopušta sve domene
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"]  # dopušta sve header-e, uključujući Authorization
)

# Rješavamo OPTIONS preflight zahtjeve
@app.before_request
def handle_options():
    if request.method == "OPTIONS":
        return "", 200

# --- registracija blueprinta ---
from routes import campaigns, mails, contacts

app.register_blueprint(campaigns.bp, url_prefix="/api/campaigns")
app.register_blueprint(mails.bp, url_prefix="/api/mails")
app.register_blueprint(contacts.bp, url_prefix="/api/contact_lists")

if __name__ == "__main__":
    app.run(debug=True)
