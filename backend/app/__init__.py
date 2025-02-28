import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_restx import Api
from dotenv import load_dotenv
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from sqlalchemy.orm import sessionmaker


load_dotenv() #Loading env
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Define Bearer Authentication for Swagger UI
authorizations = {
    "BearerAuth": {
        "type": "apiKey",
        "name": "Authorization",
        "in": "header",
        "bearerFormat": "JWT",
    }
}

# Initialize API with Bearer Authentication
api = Api(
    title="Watchly API",
    description="API documentation for Watchly",
    authorizations=authorizations,  # Adds Bearer Authentication
    security="BearerAuth",  # Applies authentication globally
    doc="/docs"
)

#Create App
def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///watchly.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")

    db.init_app(app)  # Bind SQLAlchemy to Flask app
    api.init_app(app)  # Initialize Flask-RESTx API
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ✅ Initialize SessionLocal AFTER app & db are set up
    with app.app_context():
        from app.models import User, Website, Metric, Alert  # ✅ Ensure models are registered
        global SessionLocal
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db.engine)  # ✅ Fix: Initialize inside app context

    from app.routes.alerts import alerts_ns
    from app.routes.websites import websites_ns
    from app.routes.metrics import metrics_ns
    from app.routes.auth import auth_ns

    api.add_namespace(alerts_ns, path="/api/alerts")  # Register namespaces
    api.add_namespace(websites_ns, path="/api/websites")
    api.add_namespace(metrics_ns, path="/api/metrics")
    api.add_namespace(auth_ns, path="/api/auth")

    @app.route("/api/status", methods=['GET'])
    def status():
        return jsonify({"message": "Server is running"}), 200

    return app
