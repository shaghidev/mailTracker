from flask import Flask
from flask_cors import CORS
from routes import campaigns, mails, contacts  # pretpostavljam da campaigns i mails već postoje

app = Flask(__name__)
CORS(app)

# Registracija blueprints s url_prefixom
app.register_blueprint(campaigns.bp, url_prefix="/api/campaigns")
app.register_blueprint(mails.bp, url_prefix="/api/mails")
app.register_blueprint(contacts.bp, url_prefix="/api/contact_lists")  # <--- kontakt liste

if __name__ == "__main__":
    app.run(debug=True)
