from flask import Flask
from flask_cors import CORS
from routes import campaigns, mails, contacts

app = Flask(__name__)

# Ovo dopušta sve domene, sve metode i Authorization header
CORS(
    app,
    origins="*",  # sve domene
    supports_credentials=True,
    methods=["GET","POST","DELETE","PUT","PATCH","OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

app.register_blueprint(campaigns.bp, url_prefix="/api/campaigns")
app.register_blueprint(mails.bp, url_prefix="/api/mails")
app.register_blueprint(contacts.bp, url_prefix="/api/contact_lists")

if __name__ == "__main__":
    app.run(debug=True)
