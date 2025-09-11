import pandas as pd
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

# --- Config ---
excel_file = "test.xlsx"
sheet_name = "Sheet1"
email_column = "Email"

sender_email = "stream@baltazargrad.com"
sender_password = "7Q.-rdD@KMU$"
subject = "Pretvorite svoj grad u Baltazargrad!"

smtp_server = "mail.baltazargrad.com"
smtp_port = 465
pause_seconds = 180

# --- URL ngrok tunela ili lokalni test ---
tracking_server_url = "https://4760b7921eea.ngrok-free.app"  # ili "http://127.0.0.1:5000" za lokalno testiranje

# --- Učitaj HTML template ---
html_file = "newsletter.html"
with open(html_file, 'r', encoding='utf-8') as f:
    html_template = f.read()

# --- Učitavanje Excel liste ---
df = pd.read_excel(excel_file, sheet_name=sheet_name)
emails = df[email_column].dropna().tolist()

# --- Logiranje poslanih mailova ---
log_file = "sent_emails.csv"
sent_emails = set()
if os.path.exists(log_file):
    sent_df = pd.read_csv(log_file)
    if "Email" in sent_df.columns:
        sent_emails = set(sent_df['Email'].tolist())

# --- Slanje maila ---
def send_email(to_email, mail_id=0):
    html_content = html_template.replace(
        "{{tracking_pixel}}",
        f'<img src="{tracking_server_url}/track_open?email={to_email}&mail_id={mail_id}" width="1" height="1" style="display:none;">'
    )
    html_content = html_content.replace(
        "{{trackable_link}}",
        f"{tracking_server_url}/track_click?email={to_email}&link_id=1&target=https://www.baltazargrad.com"
    )

    msg = MIMEMultipart("alternative")
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

    print(f"[SENT] Mail poslan: {to_email}")

# --- Glavna petlja ---
for idx, email in enumerate(emails, start=1):
    if email in sent_emails:
        continue
    try:
        send_email(email, mail_id=idx)
        with open(log_file, 'a') as f:
            f.write(f"{email}\n")
        sent_emails.add(email)
    except Exception as e:
        print(f"[ERROR] Neuspjelo slanje na {email}: {e}")
    time.sleep(pause_seconds)
