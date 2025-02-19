import asyncio
import httpx
import atexit
from apscheduler.schedulers.background import BackgroundScheduler
from app import create_app, db
from app.models import Website, Metric, Alert, User
from datetime import datetime
from app.utils.email_utils import send_email_async
from sqlalchemy.orm import sessionmaker

scheduler = BackgroundScheduler()

# Function to check Website status
async def check_websites(website):
    async with httpx.AsyncClient() as client:
            try:
                start_time = datetime.utcnow()
                response = await client.get(website.url, timeout=5)
                response_time = (datetime.utcnow() - start_time).total_seconds() * 1000
                uptime = 1 if response.status_code == 200 else 0
            except httpx.RequestError:
                response_time = 0
                uptime = 0

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

        #Run alerts concurrently
        alert_tasks = [
            check_for_alert(result["website"], "Website Down")
            for result in results if result["uptime"] == 0
        ]
        await asyncio.gather(*alert_tasks)

#Function to check alert conditions
async def check_for_alert(website_id, alert_type, app):
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
        await send_email_async(user.email, subject, content)


# Start monitoring in a background thread
def start_monitoring(app):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    scheduler.add_job(lambda: loop.run_until_complete(check_all_websites(app)), "interval", minutes=5)
    scheduler.start()
    print("✅Monitoring Services Started...")

    # Ensure APScheduler stops when app exits
    atexit.register(lambda: scheduler.shutdown())

if __name__ == "__main__":
    from app import create_app
    app = create_app()
    start_monitoring(app)
