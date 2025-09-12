import smtplib

smtp_server = "mail.baltazargrad.com"
smtp_port = 465  # SSL port
username = "stream@baltazargrad.com"
password = "7Q.-rdD@KMU$"

with smtplib.SMTP_SSL(smtp_server, smtp_port) as server:
    server.login(username, password)
    print("Auth OK!")
