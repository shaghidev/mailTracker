from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Dopuštamo sve metode i HEAD, OPTIONS
CORS(
    app,
    origins=["http://localhost:3000", "https://mailtracker-7jvy.onrender.com"],
    supports_credentials=True,
    methods=["GET", "POST", "DELETE", "PUT", "PATCH", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# --- tvoji blueprinti ---
from routes import campaigns, mails, contacts
app.register_blueprint(campaigns.bp, url_prefix="/")
app.register_blueprint(mails.bp, url_prefix="/api/mails")
app.register_blueprint(contacts.bp, url_prefix="/api/contact_lists")

if __name__ == "__main__":
    app.run(debug=True)
