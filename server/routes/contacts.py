from flask import Blueprint, jsonify, request
from config import contact_lists_collection
from datetime import datetime

bp = Blueprint('contacts', __name__)

# --- GET kontakt lista ---
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


# --- POST nova kontakt lista ---
@bp.route("/api/contact_lists", methods=["POST"])
def create_contact_list():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"status": "error", "message": "Missing name"}), 400

    new_list = {
        "name": name,
        "emails": [],
        "created_at": datetime.utcnow()
    }

    result = contact_lists_collection.insert_one(new_list)
    return jsonify({
        "status": "ok",
        "list_id": str(result.inserted_id),
        "name": name,
        "emails": []
    }), 201
