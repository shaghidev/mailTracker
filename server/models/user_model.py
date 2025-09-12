from config import users_collection
import bcrypt
from datetime import datetime

def create_user(email, password):
    hashed_pw = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    user = {"email": email, "password": hashed_pw, "created_at": datetime.utcnow()}
    return users_collection.insert_one(user)

def find_user_by_email(email):
    return users_collection.find_one({"email": email})

def verify_password(password, hashed_pw):
    return bcrypt.checkpw(password.encode(), hashed_pw)
