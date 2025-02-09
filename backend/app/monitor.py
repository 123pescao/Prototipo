import requests
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from app import db, create_app
from app.models import Website, Metric, Alert
from datetime import datetime

app = create_app()
scheduler = BackgroundScheduler()

#Function to check Website status
def check_websites():
    with app.app_context():
        websites = Website.query.all()
        for website in websites:
            try:
                start_time = datetime.utcnow()
                response = requests.get(website.url, timeout=5)
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                uptime  = 1 if response.status_code == 200 else 0

                #save metric
                new_metric = Metric(
                    website_id=website.id,
                    response_time=response_time,
                    uptime=uptime,
                    timestamp=datetime.utcnow()
                )
                db.session.add(new_metric)
                db.session.commit()

                #Check if site is down  (3 consecutive failures)
                check_for_alert(website.id, "Website Down")
                print(f"{website.url} is UP - {response_time}ms")

            except requests.RequestException:
                #Site DOWN
                new_metric = Metric(
                    website_id=website.id,
                    response_time=0,
                    uptime=0,
                    timestamp=datetime.utcnow()
                )
                db.session.add(new_metric)
                db.session.commit()

                #Trigger Alert
                check_for_alert(website.id, "Website Down")
                print(f"{website.url} is DOWN!")


#Function to check alert conditions
def check_for_alert(website_id, alert_type):
    with app.app_context():
        #Check for existing unresolved alert of same type
        existing_alert = Alert.query.filter_by(
            website_id=website_id,
            alert_type=alert_type,
            status="unresolved"
        ).first()

    if existing_alert:
        print(f"🛑 Alert already exists for Website ID {website_id} - Type: {alert_type}")
        return #Do NOT create a duplicate alert

    #If no unresolved alert exists, create a new one
    new_alert = Alert(
        website_id=website_id,
        alert_type="Website Down",
        status="unresolved",
        timestamp=datetime.utcnow()
    )
    db.session.add(new_alert)
    db.session.commit()
    print(f"Alert triggered for Website ID {website_id} - Type: {alert_type}")

#Start monitoring in a background thread
def start_monitoring():
    scheduler.add_job(check_websites, "interval", minutes=5)
    scheduler.start()
    print("Monitoring Services Started...")

    #EnsureAPScheduler stops when app exits
    atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    start_monitoring()
