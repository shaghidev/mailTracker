from flask import Flask
from flask_cors import CORS
from routes import campaigns, mails, contacts

app = Flask(__name__)
CORS(app)

app.register_blueprint(campaigns.bp)
app.register_blueprint(mails.bp)
app.register_blueprint(contacts.bp)

if __name__ == "__main__":
    app.run(debug=True)
