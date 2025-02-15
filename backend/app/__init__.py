import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from dotenv import load_dotenv

load_dotenv() #Loading env
db = SQLAlchemy()
api = Api(title="Watchly API", description="API documentation for Watchly", doc="/docs")

#Create App
def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///watchly.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)  # Bind SQLAlchemy to Flask app
    api.init_app(app)  # Initialize Flask-RESTx API

    from app.routes.alerts import alerts_ns
    from app.routes.websites import websites_ns
    from app.routes.metrics import metrics_ns
    from app.routes.auth import auth_ns

    api.add_namespace(alerts_ns)  # Register namespaces
    api.add_namespace(websites_ns)
    api.add_namespace(metrics_ns)
    api.add_namespace(auth_ns)

    # Health check route
    @app.route("/status", methods=["GET"])
    def status():
        return jsonify({"message": "Server is running"}), 200

    return app
