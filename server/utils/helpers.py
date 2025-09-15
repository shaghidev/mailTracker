from bson import ObjectId

def str_to_objectid(id_str):
    try:
        return ObjectId(id_str)
    except:
        return None
