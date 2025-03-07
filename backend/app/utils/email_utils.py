import os
import asyncio
import sendgrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv
import logging
from app.utils.logger import logger


load_dotenv()


SENDGRID_API_KEY = os.getenv("SENDGRID_DEV_API_KEY")
FROM_EMAIL = os.getenv("SENDGRID_FROM_EMAIL")

if not SENDGRID_API_KEY:
    print("❌ ERROR: SendGrid API Key not found! Check .env file.")
else:
    print("✅ SendGrid API Key loaded successfully.")

if not FROM_EMAIL:
    print("❌ ERROR: FROM_EMAIL is missing in .env! Make sure it's a verified sender in SendGrid.")

async def send_email_async(to_email, subject, message):
    if not SENDGRID_API_KEY:
        logger.error("❌ ERROR: SendGrid API Key is missing! Email cannot be sent.")
        return False
    if not FROM_EMAIL:
        logger.error("❌ ERROR: FROM_EMAIL is missing! Email cannot be sent.")
        return False

    sg = sendgrid.SendGridAPIClient(SENDGRID_API_KEY)
    email = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=message
    )

    loop = asyncio.get_event_loop()
    max_retries = 3  # ✅ Retry up to 3 times

    for attempt in range(max_retries):
        try:
            response = await loop.run_in_executor(None, sg.send, email)
            logger.info(f"✅ Email Sent! Status Code: {response.status_code}")
            return True
        except Exception as e:
            logger.error(f"❌ Email Sending Failed (Attempt {attempt + 1}/{max_retries}): {str(e)}")
            if attempt < max_retries - 1:
                await asyncio.sleep(2 ** attempt)  # ✅ Exponential backoff (wait 2s, then 4s)
            else:
                logger.error("❌ Email sending permanently failed after retries.")
    return False

# Test if SendGrid works
if __name__ == "__main__":
    test_email = "watchly.monitor@gmail.com"
    test_subject = "Test Email from Watchly"
    test_message = "This is a test email from Watchly using SendGrid."

    asyncio.run(send_email_async(test_email, test_subject, test_message))
