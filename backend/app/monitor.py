import asyncio
import httpx
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from app import create_app, db
from app.models import Website, Metric, Alert, User
from datetime import datetime
from app.utils.email_utils import send_email_async
from sqlalchemy.orm import sessionmaker
from app.utils.logger import logger
import time
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))


scheduler = BackgroundScheduler()

# Function to check Website status
async def check_websites(website):
    logger.info(f"🔎 Checking website: {website.url}")
    async with httpx.AsyncClient() as client:
            try:
                start_time = datetime.utcnow()
                response = await client.get(website.url, timeout=5, follow_redirects=True)
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                uptime = 1 if response.status_code == 200 else 0
                logger.info(f"Checked website {website.url} - Status: {response.status_code}, Response Time: {response_time}ms, Uptime: {uptime}")

            except httpx.RequestError as e:
                response_time = 0
                uptime = 0
                logger.error(f"❌ {website.url} is DOWN - Error: {str(e)}")

    return {
        "website": website.id,
        "response_time": response_time,
        "uptime": uptime,
        "timestamp": datetime.utcnow()
    }

#Function to check all websites
async def check_all_websites(app):
    with app.app_context():
        websites = db.session.execute(db.select(Website)).scalars().all()
        semaphore = asyncio.Semaphore(10)

        async def limited_check(website):
            async with semaphore:
                return await check_websites(website)

        tasks = [limited_check(website) for website in websites]
        results = await asyncio.gather(*tasks)

        db.session.bulk_insert_mappings(Metric, [
            {
                "website_id": result["website"],
                "response_time": result["response_time"],
                "uptime": result["uptime"],
                "timestamp": result["timestamp"]
            }
            for result in results
        ])
        db.session.commit()
        print("✅Metrics saved successfully!")

        #Run alerts concurrently
        alert_tasks = [
            check_for_alert(result["website"], "Website Down", app)
            if result["uptime"] == 0
            else check_for_alert(result["website"], "Website Up", app)
            for result in results
        ]
        await asyncio.gather(*alert_tasks)

#Function to check alert conditions
async def check_for_alert(website_id, alert_type, app):
    with app.app_context():
        website = db.session.get(Website, website_id)
        if not website:
            logger.error(f"Alert triggered for non-existent website ID {website_id}")
            print(f"Website ID {website_id} not found.")
            return

        user = db.session.get(User, website.user_id)
        if not user:
            logger.error(f"User not found for alert on website {website.url}")
            print(f"User for Website ID {website_id} not found.")
            return

        existing_alert = Alert.query.filter_by(
            website_id=website_id,
            alert_type="Website Down",
            status="unresolved"
        ).first()

        if alert_type == "Website Down":
            if existing_alert:
                logger.error(f"Alert already exists for {website.url} - Type: {alert_type}")
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
            logger.info(f"New alert created for {website.url} - Type: {alert_type}")
            print(f"Alert triggered for {website.url} - Type: {alert_type}")

            #Send Email Alert
            subject = f"Alert: {website.url} is DOWN!"
            content = f"Watchly has detected that website: {website.url} is down. Please Verify Immediately!"
            await send_email_async(user.email, subject, content)

        elif alert_type == "Website Up":
            if existing_alert:
                existing_alert.status = "resolved"
                db.session.commit()
                logger.info(f"✅ Alert resolved for {website.url} - Site is back online.")

                subject = f"✅ Resolved: {website.url} is back UP!"
                content = f"Good news! {website.url} is back online and accessible."
                await send_email_async(user.email, subject, content)

def run_monitoring_task(app):
    """Runs the async check_all_websites() function in a synchronous context."""
    asyncio.run(check_all_websites(app))


def start_monitoring(app):
    """Starts the APScheduler job for monitoring websites at intervals."""
    print("✅ Starting monitoring service...")  # Debugging print
    logger.info("✅ Starting monitoring service...")  # Log startup

    scheduler.add_job(run_monitoring_task, "interval", seconds=30, args=[app])
    scheduler.start()


    print("✅ Scheduler is running. Keeping process alive...")

    while True:
        time.sleep(60)


if __name__ == "__main__":
    from app import create_app
    app = create_app()
    start_monitoring(app)
