import requests
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from app import create_app
from app import db
from app.models import Website, Metric, Alert, User
from datetime import datetime
from app.utils import email

app = create_app()
scheduler = BackgroundScheduler()

# Function to check Website status
def check_websites():
    with app.app_context():
        websites = Website.query.all()
        for website in websites:
            try:
                start_time = datetime.utcnow()
                response = requests.get(website.url, timeout=5)
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                uptime = 1 if response.status_code == 200 else 0

                # Save metric
                new_metric = Metric(
                    website_id=website.id,
                    response_time=response_time,
                    uptime=uptime,
                    timestamp=datetime.utcnow(),
                )
                db.session.add(new_metric)
                db.session.commit()

                # Check if site is down (3 consecutive failures)
                check_for_alert(website.id, "Website Down")
                print(f"{website.url} is UP - {response_time}ms")

            except requests.RequestException:
                # Site DOWN
                new_metric = Metric(
                    website_id=website.id,
                    response_time=0,
                    uptime=0,
                    timestamp=datetime.utcnow(),
                )
                db.session.add(new_metric)
                db.session.commit()

                # Trigger Alert
                check_for_alert(website.id, "Website Down")
                print(f"{website.url} is DOWN!")

# Function to check alert conditions
def check_for_alert(website_id, alert_type):
    with app.app_context():
        website = db.session.get(Website, website_id)
        if not website:
            print(f"Website ID {website_id} not found.")
            return

        user = db.session.get(User, website.user_id)
        if not user:
            print(f"User for Website ID {website_id} not found.")
            return

        existing_alert = Alert.query.filter_by(
            website_id=website_id,
            alert_type=alert_type,
            status="unresolved"
        ).first()

        if existing_alert:
            print(f"Alert already exists for Website ID {website_id} - Type: {alert_type}")
            return  # Do NOT create a duplicate alert

        # If no unresolved alert exists, create a new one
        new_alert = Alert(
            website_id=website_id,
            alert_type=alert_type,
            status="unresolved",
            timestamp=datetime.utcnow(),
        )
        db.session.add(new_alert)
        db.session.commit()
        print(f"Alert triggered for {website.url} - Type: {alert_type}")

        #Send Email Alert
        subject = f"Alert: {website.url} is DOWN!"
        content = f"Watchly has detected that website: {website.url} is down. Please Verify Immediately!"
        email.send_email(user.email, subject, content)


# Start monitoring in a background thread
def start_monitoring():
    scheduler.add_job(check_websites, "interval", minutes=5)
    scheduler.start()
    print("✅Monitoring Services Started...")

    # Ensure APScheduler stops when app exits
    atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    start_monitoring()
