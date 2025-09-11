from pymongo import MongoClient
import os

client = MongoClient(os.environ["MONGO_URI"])
db = client.get_database("mailTracker")  # ime baze mora biti ovdje
events_collection = db.events
