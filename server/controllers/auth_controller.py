from flask import request, jsonify
from models.user_model import create_user, find_user_by_email, verify_password
import jwt
from config import JWT_SECRET, JWT_EXP_DELTA_SECONDS
from datetime import datetime, timedelta
from bson import ObjectId

def generate_jwt(user_id: str):
    payload = {
        "user_id": str(user_id),
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_DELTA_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
    return token

def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    if find_user_by_email(email):
        return jsonify({"status": "error", "message": "User already exists"}), 400

    result = create_user(email, password)
    token = generate_jwt(str(result.inserted_id))
    return jsonify({"status": "ok", "token": token})

def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"status": "error", "message": "Missing fields"}), 400

    user = find_user_by_email(email)
    if not user or not verify_password(password, user["password"]):
        return jsonify({"status": "error", "message": "Invalid credentials"}), 401

    token = generate_jwt(str(user["_id"]))
    return jsonify({"status": "ok", "token": token})
