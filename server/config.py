from pymongo import MongoClient
import os

client = MongoClient(os.environ["MONGO_URI"])
db = client.get_database("mailTracker")

campaigns_collection = db.campaigns
mails_collection = db.mails
events_collection = db.events
