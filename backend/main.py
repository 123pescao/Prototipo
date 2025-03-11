# Entry point for server
import os
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring
import threading

app = create_app()

# ✅ FIX: Ensure allowed_origins is a properly formatted list
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")]

CORS(app, supports_credentials=True, origins=allowed_origins,
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

migrate = Migrate(app, db)

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "GET":
        return jsonify({"message": "Watchly API is running!"}), 200
    elif request.method == "POST":
        data = request.get_json()
        return jsonify({"received": data}), 200  # Echo back received JSON

@app.route("/<path:path>", methods=["OPTIONS"])
def handle_cors_preflight(path):
    """
    ✅ FIX: Handle CORS preflight correctly and avoid 500 errors.
    """
    origin = request.headers.get("Origin", "")

    if origin in allowed_origins:
        response = jsonify({"message": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 204  # ✅ 204 No Content

    # 🚨 If origin is NOT allowed, return a 403 error with CORS headers
    response = jsonify({"error": "CORS origin not allowed"})
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response, 403  # 🔥 Prevents crashing with 500 error

@app.after_request
def apply_cors_headers(response):
    """
    Ensure CORS headers are applied to all responses, including errors.
    """
    origin = request.headers.get("Origin", "")

    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response

if __name__ == '__main__':
    import os
    with app.app_context():
        db.create_all()
        print("✅ Database created successfully!")

    # Start monitoring in a separate thread
    monitoring_thread = threading.Thread(target=start_monitoring, args=(app,), daemon=True)
    monitoring_thread.start()

    print("⚡ Starting Flask server...")
    port = int(os.getenv("PORT", 5000))  # Railway provides PORT env variable
    app.run(host="0.0.0.0", port=port, debug=True)
