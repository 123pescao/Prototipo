import os
import threading
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring

#  Gunicorn expects a callable `app` instance
app = create_app()

#  Ensure allowed_origins is correctly formatted
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_URL", "http://localhost:3000,https://prototipo-70.pages.dev").split(",")]

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
        return jsonify({"received": data}), 200

@app.route("/<path:path>", methods=["OPTIONS"])
def handle_cors_preflight(path):
    """
    Fix: Handle OPTIONS preflight request properly.
    """
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        response = jsonify({"message": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200  # Return 200 OK instead of 204 No Content

    response = jsonify({"error": "CORS origin not allowed"})
    return response, 403

@app.after_request
def apply_cors_headers(response):
    """Ensure CORS headers are applied to all responses."""
    origin = request.headers.get("Origin", "")
    if origin in allowed_origins:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"

    return response

# Ensure Gunicorn can recognize the app
if __name__ != '__main__':
    with app.app_context():
        db.create_all()
        print("✅ Database created successfully!")

    # Start monitoring in a separate thread
    monitoring_thread = threading.Thread(target=start_monitoring, args=(app,), daemon=True)
    monitoring_thread.start()

    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
