import pandas as pd
import smtplib
import time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import requests
from urllib.parse import quote_plus

# --- CONFIG ---
excel_file = "excel/test.xlsx"        # Excel s emailovima
sheet_name = "Sheet1"
email_column = "Email"

sender_email = "stream@baltazargrad.com"
sender_password = os.environ.get("SMTP_PASSWORD")  # sigurnije, koristi env var
subject = "Pretvorite svoj grad u Baltazargrad!"

smtp_server = "mail.baltazargrad.com"
smtp_port = 465
pause_seconds = 180  # pauza između mailova

tracking_server_url = "https://mailtracker-7jvy.onrender.com"
campaign_id = "1"  # ID kampanje koju šalješ, može biti string ili ObjectId

# --- Učitaj HTML template ---
html_file = "mail/newsletter.html"
with open(html_file, 'r', encoding='utf-8') as f:
    html_template = f.read()

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
    
    html_content = html_template
    # Tracking pixel
    html_content = html_content.replace(
        "{{tracking_pixel}}",
        f'{tracking_server_url}/track_open?email={email_enc}&mail_id={mail_id_enc}'
    )
    # Trackable linkovi
    html_content = html_content.replace(
        "{{trackable_link_hero}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com/hero'
    )
    html_content = html_content.replace(
        "{{trackable_link_main}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com'
    )
    html_content = html_content.replace(
        "{{trackable_link_cta}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com/cta'
    )
    # Trackable slike
    html_content = html_content.replace(
        "{{trackable_link_image1}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com/image1'
    )
    html_content = html_content.replace(
        "{{trackable_link_image2}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com/image2'
    )
    html_content = html_content.replace(
        "{{trackable_link_image3}}",
        f'{tracking_server_url}/track_click?email={email_enc}&mail_id={mail_id_enc}&link=https://baltazargrad.com/image3'
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

    with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
        server.login(sender_email, sender_password)
        server.send_message(msg)

    print(f"[SENT] Mail poslan: {to_email}")

    # pošalji event "sent" u backend
    try:
        requests.get(f"{tracking_server_url}/track_sent",
                     params={"email": to_email, "mail_id": mail_id})
    except Exception as e:
        print(f"[WARN] Ne mogu logirati send u backend: {e}")

# --- Glavna petlja slanja ---
for email in emails:
    if email in sent_emails:
        continue

    mail_id = create_mail_in_backend(email)
    if not mail_id:
        continue

    try:
        send_email(email, mail_id)
        with open(log_file, 'a') as f:
            f.write(f"{email},{mail_id}\n")
        sent_emails.add(email)
    except Exception as e:
        print(f"[ERROR] Neuspjelo slanje na {email}: {e}")

    time.sleep(pause_seconds)
