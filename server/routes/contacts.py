from flask import Blueprint, jsonify
from config import contact_lists_collection

bp = Blueprint('contacts', __name__)

@bp.route("/api/contact_lists", methods=["GET"])
def get_contact_lists():
    lists = list(contact_lists_collection.find())
    result = []
    for l in lists:
        result.append({
            "id": str(l["_id"]),
            "name": l["name"],
            "emails": l.get("emails", [])
        })
    return jsonify(result)
