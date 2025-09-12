from flask import Flask
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.campaign_routes import campaign_bp
from routes.tracking_routes import tracking_bp

app = Flask(__name__)
CORS(app)

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/auth")
app.register_blueprint(campaign_bp)
app.register_blueprint(tracking_bp)

if __name__ == "__main__":
    app.run(debug=True)
