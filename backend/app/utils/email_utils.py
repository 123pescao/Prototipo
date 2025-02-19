import os
import asyncio
import sendgrid
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from dotenv import load_dotenv


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
        print("❌ ERROR: SendGrid API Key is missing!")
        return False
    if not FROM_EMAIL:
        print("❌ ERROR: FROM_EMAIL is missing! Email cannot be sent.")
        return False
    sg = sendgrid.SendGridAPIClient(SENDGRID_API_KEY)
    email = Mail(
        from_email=FROM_EMAIL,
        to_emails=to_email,
        subject=subject,
        plain_text_content=message
    )

    loop = asyncio.get_event_loop()
    try:
        response = await loop.run_in_executor(None, sg.send, email)
        print(f"✅ Email Sent! Status Code: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ General Error Sending Email: {str(e)}")
    return False

# Test if SendGrid works
if __name__ == "__main__":
    test_email = "watchly.monitor@gmail.com"
    test_subject = "Test Email from Watchly"
    test_message = "This is a test email from Watchly using SendGrid."

    asyncio.run(send_email_async(test_email, test_subject, test_message))
