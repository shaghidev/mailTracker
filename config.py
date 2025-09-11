import os
from pymongo import MongoClient

MONGO_URI = os.environ.get("MONGO_URI")  # Postavi u Render environment variable
client = MongoClient(MONGO_URI)
db = client.get_database()  # automatski uzima default bazu iz URI
events_collection = db["events"]
