#Entry point for server
import os
from flask import Flask, request, jsonify
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring
import threading

app = create_app()
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": frontend_origin}}, supports_credentials=True, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], allow_headers=["Content-Type", "Authorization"])
migrate = Migrate(app, db)


@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        response = jsonify({"message": "CORS Preflight OK"})
        response.headers.add("Access-Control-Allow-Origin", frontend_origin)
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 200

@app.route("/")
def home():
    return jsonify({"message": "Watchly API is running!"}), 200

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