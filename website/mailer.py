import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

MAIL_USERNAME = os.getenv('MAIL_USERNAME')
MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')

def send_email(subject, to, content):
    try:
        smtp = smtplib.SMTP_SSL('smtp.gmail.com', 465)

        status_code, response = smtp.login(MAIL_USERNAME, MAIL_PASSWORD)
        print(f'[*] LOGGING IN: {status_code} {response.decode()}')
        
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = MAIL_USERNAME
        msg['To'] = to
        msg.attach(MIMEText(content, 'html'))

        smtp.send_message(msg)
        print(f"[*] Email sent successfully to {to}!")
    except Exception as e:
        print("[*] Error occurred while sending email:", e)
    finally:
        smtp.quit()