#Entry point for server
from app import create_app, db
from app.models import User, Website, Metric, Alert
from app.monitor import start_monitoring

app = create_app()


if __name__== '__main__':
    with app.app_context():
        db.create_all()
        print("Database created successfully!")
        start_monitoring()
        app.run(debug=True)
