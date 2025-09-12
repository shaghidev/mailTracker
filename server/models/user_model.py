#user_model.py

from config import users_collection
import bcrypt
from datetime import datetime

def create_user(email: str, password: str):
    # Hashiramo i spremamo kao string
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode('utf-8')
    user = {
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.utcnow()
    }
    return users_collection.insert_one(user)

def find_user_by_email(email: str):
    return users_collection.find_one({"email": email})

def verify_password(password, hashed_pw):
    # hashed_pw iz baze je bytes, ne treba encode
    if isinstance(hashed_pw, str):
        hashed_pw = hashed_pw.encode('utf-8')
    return bcrypt.checkpw(password.encode(), hashed_pw)
