from flask import Blueprint
from controllers.campaign_controller import create_campaign, add_mail, get_all_campaigns, campaign_stats
from middleware.auth_middleware import auth_required

campaign_bp = Blueprint("campaign", __name__)

campaign_bp.route("/create_campaign", methods=["POST"])(auth_required(create_campaign))
campaign_bp.route("/add_mail", methods=["POST"])(auth_required(add_mail))
campaign_bp.route("/api/campaigns", methods=["GET"])(auth_required(get_all_campaigns))
campaign_bp.route("/campaign_stats/<campaign_id>")(auth_required(campaign_stats))
