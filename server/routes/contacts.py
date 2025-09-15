from flask import Blueprint, jsonify, request
from config import contact_lists_collection
from datetime import datetime
from bson import ObjectId
import pandas as pd

bp = Blueprint('contacts', __name__)

# --- GET svih lista ---
@bp.route("/", methods=["GET"])
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

# --- POST nova lista ---
@bp.route("/", methods=["POST"])
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

# --- DELETE lista ---
@bp.route("/<list_id>", methods=["DELETE"])
def delete_contact_list(list_id):
    try:
        result = contact_lists_collection.delete_one({"_id": ObjectId(list_id)})
        if result.deleted_count == 0:
            return jsonify({"status": "error", "message": "List not found"}), 404
        return jsonify({"status": "ok"}), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- GET kontakata po listi ---
@bp.route("/<list_id>/contacts", methods=["GET"])
def get_contacts(list_id):
    lst = contact_lists_collection.find_one({"_id": ObjectId(list_id)})
    if not lst:
        return jsonify({"status": "error", "message": "List not found"}), 404
    return jsonify(lst.get("emails", []))

# --- POST dodavanje kontakta ---
@bp.route("/<list_id>/contacts", methods=["POST"])
def add_contact(list_id):
    lst = contact_lists_collection.find_one({"_id": ObjectId(list_id)})
    if not lst:
        return jsonify({"status": "error", "message": "List not found"}), 404

    contact = request.json
    if not contact.get("email"):
        return jsonify({"status": "error", "message": "Missing email"}), 400

    emails = lst.get("emails", [])
    if any(c["email"] == contact["email"] for c in emails):
        return jsonify({"status": "error", "message": "Email already exists"}), 400

    emails.append(contact)
    contact_lists_collection.update_one({"_id": ObjectId(list_id)}, {"$set": {"emails": emails}})
    return jsonify(contact), 201

# --- POST import kontakata iz CSV/Excel ---
@bp.route("/<list_id>/contacts/import", methods=["POST"])
def import_contacts(list_id):
    lst = contact_lists_collection.find_one({"_id": ObjectId(list_id)})
    if not lst:
        return jsonify({"status": "error", "message": "List not found"}), 404

    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Missing file"}), 400

    file = request.files['file']
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(file)
        else:
            df = pd.read_excel(file)

        emails = lst.get("emails", [])
        existing_emails = {c["email"] for c in emails}

        new_contacts = []
        for _, row in df.iterrows():
            if "email" not in row or pd.isna(row["email"]):
                continue
            if row["email"] in existing_emails:
                continue
            contact = {"email": row["email"], "name": row.get("name", "")}
            new_contacts.append(contact)
            emails.append(contact)

        contact_lists_collection.update_one({"_id": ObjectId(list_id)}, {"$set": {"emails": emails}})
        return jsonify({"imported": new_contacts}), 201

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- DELETE kontakta ---
@bp.route("/<list_id>/contacts/<email>", methods=["DELETE"])
def delete_contact(list_id, email):
    lst = contact_lists_collection.find_one({"_id": ObjectId(list_id)})
    if not lst:
        return jsonify({"status": "error", "message": "List not found"}), 404

    emails = lst.get("emails", [])
    emails = [c for c in emails if c["email"] != email]
    contact_lists_collection.update_one({"_id": ObjectId(list_id)}, {"$set": {"emails": emails}})
    return jsonify({"status": "ok"}), 200
