import requests
import threading
import time
from app import db, create_app
from app.models import Website, Metric, Alert
from datetime import datetime

#Function to check Website status
def check_websites():
    app = create_app()
    with app.app_context():
        while True:
            websites = Website.query.all()
            for website in websites:
                try:
                    start_time = time.time()
                    response = requests.get(website.url, timeout=5)
                    response_time = round(time.time() - start_time, 3)
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
                    check_for_alert(website.id)

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
                    check_for_alert(website.id)

            time.sleep(60)

#Function to check alert conditions
def check_for_alert(website_id):
    last_3_metrics = Metric.query.filter_by(website_id=website_id).order_by(Metric.timestamp.desc()).limit(3).all()

    if len(last_3_metrics) < 3:
        return #Placeholder

    if all(metric.uptime == 0 for metric in last_3_metrics):
        #Create alert if last 3 checks failed
        new_alert = Alert(
            website_id=website_id,
            alert_type="Website Down",
            status="unresolved",
            timestamp=datetime.utcnow()
        )
        db.session.add(new_alert)
        db.session.commit()

#Start monitoring in a background thread
def start_monitoring():
    thread = threading.Thread(target=check_websites, daemon=True)
    thread.start()