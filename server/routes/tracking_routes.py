from flask import Blueprint
from controllers.tracking_controller import track_open, track_click, track_sent

tracking_bp = Blueprint("tracking", __name__)

tracking_bp.route("/track_open")(track_open)
tracking_bp.route("/track_click")(track_click)
tracking_bp.route("/track_sent")(track_sent)
