from pymongo import MongoClient
import os

client = MongoClient(os.environ["MONGO_URI"])
db = client.get_database("mailTracker")  # ime baze

events_collection = db.events        # logovi: sent, open, click
mails_collection  = db.mails         # poslane email adrese, statusi itd.
