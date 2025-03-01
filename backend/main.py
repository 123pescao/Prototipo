#Entry point for server
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring

app = create_app()
CORS(app, resources={r"/*": {"origins": "*"}})
migrate = Migrate(app, db)


if __name__ == '__main__':
    import os
    with app.app_context():
        db.create_all()
        print("Database created successfully!")
        start_monitoring(app)
    if os.getenv("FLASK_ENV") != "production":
        app.run(host="0.0.0.0", port=5000, debug=True)
