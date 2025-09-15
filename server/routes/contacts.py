# routes/contacts.py
from flask import Blueprint, request, jsonify
from config import contact_lists_collection
from utils.helpers import str_to_objectid
from pymongo.errors import DuplicateKeyError
import csv
import io

bp = Blueprint("contacts", __name__)

# --- Contact Lists ---

# GET all contact lists
@bp.route("/", methods=["GET"])
def get_contact_lists():
    lists = list(contact_lists_collection.find())
    result = []
    for l in lists:
        result.append({
            "id": str(l["_id"]),
            "name": l["name"],
            "contacts": l.get("contacts", [])
        })
    return jsonify(result)

# POST create new contact list
@bp.route("/", methods=["POST"])
def create_contact_list():
    data = request.json
    name = data.get("name")
    if not name:
        return jsonify({"status": "error", "message": "Missing name"}), 400

    new_list = {"name": name, "contacts": []}
    result = contact_lists_collection.insert_one(new_list)
    return jsonify({"status": "ok", "id": str(result.inserted_id)})

# DELETE a contact list
@bp.route("/<list_id>", methods=["DELETE"])
def delete_contact_list(list_id):
    list_obj_id = str_to_objectid(list_id)
    if not list_obj_id:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400

    contact_lists_collection.delete_one({"_id": list_obj_id})
    return jsonify({"status": "ok"})


# --- Contacts inside a list ---

# GET contacts of a list
@bp.route("/<list_id>/contacts", methods=["GET"])
def get_contacts(list_id):
    list_obj_id = str_to_objectid(list_id)
    if not list_obj_id:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400

    contact_list = contact_lists_collection.find_one({"_id": list_obj_id})
    if not contact_list:
        return jsonify({"status": "error", "message": "List not found"}), 404

    return jsonify(contact_list.get("contacts", []))

# POST add contact to a list
@bp.route("/<list_id>/contacts", methods=["POST"])
def add_contact(list_id):
    list_obj_id = str_to_objectid(list_id)
    if not list_obj_id:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400

    contact = request.json
    if not contact.get("email"):
        return jsonify({"status": "error", "message": "Missing email"}), 400

    # Add contact if email doesn't exist
    contact_lists_collection.update_one(
        {"_id": list_obj_id, "contacts.email": {"$ne": contact["email"]}},
        {"$push": {"contacts": contact}}
    )
    return jsonify({"status": "ok"})

# DELETE contact from a list
@bp.route("/<list_id>/contacts/<email>", methods=["DELETE"])
def delete_contact(list_id, email):
    list_obj_id = str_to_objectid(list_id)
    if not list_obj_id:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400

    contact_lists_collection.update_one(
        {"_id": list_obj_id},
        {"$pull": {"contacts": {"email": email}}}
    )
    return jsonify({"status": "ok"})


# --- Import contacts from CSV ---
@bp.route("/<list_id>/contacts/import", methods=["POST"])
def import_contacts(list_id):
    list_obj_id = str_to_objectid(list_id)
    if not list_obj_id:
        return jsonify({"status": "error", "message": "Invalid ID"}), 400

    if "file" not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400

    file = request.files["file"]
    stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
    reader = csv.DictReader(stream)
    imported_contacts = []
    for row in reader:
        if "email" in row and row["email"]:
            contact = {"email": row["email"], "name": row.get("name", "")}
            imported_contacts.append(contact)

    if imported_contacts:
        contact_lists_collection.update_one(
            {"_id": list_obj_id},
            {"$push": {"contacts": {"$each": imported_contacts}}}
        )

    return jsonify({"status": "ok", "imported": len(imported_contacts)})
