import pandas as pd
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from urllib.parse import quote_plus
from datetime import datetime
from dotenv import load_dotenv
import os

# --- Load .env ---
load_dotenv()

# --- CONFIG ---
excel_file = "excel/test.xlsx"        # Excel s emailovima
sheet_name = "Sheet1"
email_column = "Email"

# SMTP podaci
smtp_server = os.getenv("SMTP_HOST") 
smtp_port = int(os.getenv("SMTP_PORT"))
sender_email = os.getenv("SMTP_USER") 
sender_password = os.getenv("SMTP_PASS") 

subject = "Pretvorite svoj grad u Baltazargrad!"
pause_seconds = 180  # pauza između mailova

tracking_server_url = "https://mailtracker-7jvy.onrender.com"

# --- Kampanja ---
campaign_name = "Newsletter rujan 2025"
campaign_html_file = "mail/newsletter.html"

with open(campaign_html_file, 'r', encoding='utf-8') as f:
    html_template_content = f.read()

# --- Kreiraj kampanju u backendu ---
try:
    resp = requests.post(f"{tracking_server_url}/create_campaign", json={
        "name": campaign_name,
        "subject": subject,
        "html_template": html_template_content
    })
    resp.raise_for_status()
    campaign_id = resp.json()["campaign_id"]
    print(f"[INFO] Kampanja kreirana s ID: {campaign_id}")
except Exception as e:
    print(f"[ERROR] Ne mogu kreirati kampanju: {e}")
    exit(1)

# --- Učitaj Excel listu ---
df = pd.read_excel(excel_file, sheet_name=sheet_name)
emails = df[email_column].dropna().tolist()

# --- Logiranje poslanih mailova ---
log_file = "sent_emails.csv"
sent_emails = set()
if os.path.exists(log_file):
    sent_df = pd.read_csv(log_file)
    if "Email" in sent_df.columns:
        sent_emails = set(sent_df['Email'].tolist())

# --- Funkcija za kreiranje maila u backendu ---
def create_mail_in_backend(email):
    try:
        resp = requests.post(f"{tracking_server_url}/add_mail", json={
            "campaign_id": campaign_id,
            "email": email
        })
        resp.raise_for_status()
        mail_id = resp.json().get("mail_id")
        return mail_id
    except Exception as e:
        print(f"[ERROR] Ne mogu kreirati mail u backendu: {e}")
        return None

# --- Funkcija za pripremu HTML-a ---
def prepare_html(email, mail_id):
    email_enc = quote_plus(email)
    mail_id_enc = quote_plus(str(mail_id))
    
    html_content = html_template_content
    # Tracking pixel
    html_content = html_content.replace(
        "{{tracking_pixel}}",
        f'{tracking_server_url}/track_open?email={email_enc}&mail_id={mail_id_enc}'
    )
    # Trackable linkovi i slike
    for name, url in {
        "{{trackable_link_hero}}": "https://baltazargrad.com/hero",
        "{{trackable_link_main}}": "https://baltazargrad.com",
        "{{trackable_link_cta}}": "https://baltazargrad.com/cta",
        "{{trackable_link_image1}}": "https://baltazargrad.com/image1",
        "{{trackable_link_image2}}": "https://baltazargrad.com/image2",
        "{{trackable_link_image3}}": "https://baltazargrad.com/image3",
    }.items():
        html_content = html_content.replace(
            name,
            f"{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link={url}"
        )
    return html_content

# --- Funkcija za slanje maila ---
def send_email(to_email, mail_id):
    html_content = prepare_html(to_email, mail_id)

    msg = MIMEMultipart("alternative")
    msg['From'] = sender_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(html_content, 'html'))

    try:
        with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"[SENT] Mail poslan: {to_email}")
    except smtplib.SMTPAuthenticationError:
        print(f"[ERROR] SMTP auth failed za {to_email}. Provjeri lozinku i username!")
        return False
    except Exception as e:
        print(f"[ERROR] Neuspjelo slanje na {to_email}: {e}")
        return False

    # pošalji event "sent" u backend
    try:
        requests.get(f"{tracking_server_url}/track_sent",
                     params={"email": to_email, "mail_id": mail_id})
    except Exception as e:
        print(f"[WARN] Ne mogu logirati send u backend: {e}")
    
    return True

# --- Glavna petlja slanja ---
for email in emails:
    if email in sent_emails:
        continue

    mail_id = create_mail_in_backend(email)
    if not mail_id:
        continue

    success = send_email(email, mail_id)
    if success:
        with open(log_file, 'a') as f:
            f.write(f"{email},{mail_id},{datetime.utcnow().isoformat()}\n")
        sent_emails.add(email)

    time.sleep(pause_seconds)
