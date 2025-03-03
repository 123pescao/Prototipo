#Entry point for server
import os
from flask_migrate import Migrate
from flask_cors import CORS
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring
import threading

app = create_app()
frontend_origin = os.getenv("FRONTEND_URL", "http://localhost:3000")
CORS(app, resources={r"/*": {"origins": frontend_origin}}, supports_credentials=True),
migrate = Migrate(app, db)


if __name__ == '__main__':
    import os
    with app.app_context():
        db.create_all()
        print("✅ Database created successfully!")

    # Start monitoring in a separate thread
    monitoring_thread = threading.Thread(target=start_monitoring, args=(app,), daemon=True)
    monitoring_thread.start()

    print("⚡ Starting Flask server...")
    if os.getenv("FLASK_ENV") != "production":
        app.run(host="0.0.0.0", port=5000, debug=True)