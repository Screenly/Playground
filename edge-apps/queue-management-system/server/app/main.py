import os
from flask import Flask, jsonify, request, make_response
import redis
from functools import wraps

app = Flask(__name__)

# Redis connection
redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    decode_responses=True
)

# Redis key prefix
TILL_KEY_PREFIX = "till:"

# Get tills from environment variable
default_tills = ["1", "2", "3", "4"]
TILLS = os.getenv("TILLS", ",".join(default_tills)).split(",")

def add_cors_headers(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        resp = make_response(f(*args, **kwargs))
        resp.headers['Access-Control-Allow-Origin'] = '*'
        resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
        resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return resp
    return decorated_function

@app.route("/")
@add_cors_headers
def root():
    return jsonify({"message": "Till Management System API"})

@app.route("/health")
@add_cors_headers
def health_check():
    try:
        redis_client.ping()
        return jsonify({"status": "healthy", "redis": "connected"})
    except redis.ConnectionError:
        return jsonify({"status": "unhealthy", "redis": "disconnected"})

@app.route("/display")
@add_cors_headers
def get_display_status():
    """
    Endpoint for Call-Forward Screen to display available and busy tills
    """
    available_tills = []
    busy_tills = []

    for till_id in TILLS:
        key = f"{TILL_KEY_PREFIX}{till_id}"
        if redis_client.get(key) == "busy":
            busy_tills.append(till_id)
        else:
            available_tills.append(till_id)

    return jsonify({
        "available_tills": available_tills,
        "busy_tills": busy_tills
    })

@app.route("/till/<till_id>/busy", methods=["POST"])
@add_cors_headers
def set_till_busy(till_id):
    """
    Endpoint for POS to mark a till as busy
    """
    if till_id not in TILLS:
        return jsonify({"error": "Till not found"}), 404

    key = f"{TILL_KEY_PREFIX}{till_id}"
    redis_client.set(key, "busy")

    return jsonify({
        "till_id": till_id,
        "is_available": False,
        "status": "busy"
    })

@app.route("/till/<till_id>/available", methods=["POST"])
@add_cors_headers
def set_till_available(till_id):
    """
    Endpoint for POS to mark a till as available
    """
    if till_id not in TILLS:
        return jsonify({"error": "Till not found"}), 404

    key = f"{TILL_KEY_PREFIX}{till_id}"
    redis_client.delete(key)

    return jsonify({
        "till_id": till_id,
        "is_available": True,
        "status": "available"
    })

@app.route("/till/<till_id>")
@add_cors_headers
def get_till_status(till_id):
    """
    Get status of a specific till
    """
    if till_id not in TILLS:
        return jsonify({"error": "Till not found"}), 404

    key = f"{TILL_KEY_PREFIX}{till_id}"
    is_busy = redis_client.get(key) == "busy"

    return jsonify({
        "till_id": till_id,
        "is_available": not is_busy,
        "status": "busy" if is_busy else "available"
    })

# Handle OPTIONS requests for CORS
@app.route('/', methods=['OPTIONS'])
@app.route('/<path:path>', methods=['OPTIONS'])
@add_cors_headers
def options_handler():
    return jsonify({})
