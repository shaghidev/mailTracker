from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

# --- MongoDB ---
MONGO_URI = os.environ.get("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.get_database("mailTracker")

campaigns_collection = db.campaigns
mails_collection = db.mails
events_collection = db.events
users_collection = db.users
contact_lists_collection = db["contact_lists"]

# --- JWT ---
JWT_SECRET = os.environ.get("JWT_SECRET", "supersecretkey")
JWT_EXP_DELTA_SECONDS = 3600  # 1 sat
