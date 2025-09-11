from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from urllib.parse import unquote
import pandas as pd
import time
import re

# --- Postavke Seleniuma ---
chrome_options = Options()
chrome_options.add_argument("--headless")  # bez otvaranja browsera
chrome_options.add_argument("--disable-gpu")
driver = webdriver.Chrome(options=chrome_options)

BASE_LIST_URL = "https://www.htz.hr/hr-HR/opce-informacije/turisticke-zajednice?page={}"
BASE_DOMAIN = "https://www.htz.hr"

results = []

# --- Petlja kroz stranice TZ ---
for page in range(0, 15):
    print(f"➡ Obrada stranice {page}…")
    driver.get(BASE_LIST_URL.format(page))
    time.sleep(2)  # čekaj da se učita JS

    # Spremi sve URL-ove u listu da izbjegnemo StaleElementReferenceException
    tz_links = driver.find_elements(By.CSS_SELECTOR, "h3.block__title a")
    tz_urls = [link.get_attribute("href") for link in tz_links]
    print(f"– Nađeno linkova: {len(tz_urls)}")

    for tz_url in tz_urls:
        tz_url = tz_url if tz_url.startswith("http") else BASE_DOMAIN + tz_url
        driver.get(tz_url)
        time.sleep(2)  # čekaj da se stranica učita

        # --- Ime ---
        try:
            header = driver.find_element(By.CSS_SELECTOR, "h1.page-header span")
            tz_name = header.text.strip()
        except:
            tz_name = "N/A"

        # --- Telefon ---
        try:
            phone_elems = driver.find_elements(By.CSS_SELECTOR, 'div.field--name-field-ured-telefon a[href^="tel:"]')
            phones = [unquote(a.get_attribute("href").replace("tel:", "").strip()) for a in phone_elems]
            phone = ", ".join(phones) if phones else "N/A"
        except:
            phone = "N/A"

        # --- Email ---
        try:
            email_elem = driver.find_element(By.CSS_SELECTOR, 'div.field--name-field-ured-email a[href^="mailto:"]')
            email = email_elem.get_attribute("href").replace("mailto:", "").strip()
        except:
            page_text = driver.find_element(By.TAG_NAME, "body").text
            match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", page_text)
            email = match.group(0) if match else "N/A"

        # --- Web ---
        try:
            web_elems = driver.find_elements(By.CSS_SELECTOR, 'div.field--name-field-ured-web a[href^="http"]')
            website = ", ".join([a.get_attribute("href") for a in web_elems]) if web_elems else "N/A"
        except:
            website = "N/A"

        # --- Adresa ---
        try:
            addr_divs = driver.find_elements(By.CSS_SELECTOR, 'div.field--name-field-ured-adresa, div.field--name-field-address, div.field--item')
            addr_list = []
            for div in addr_divs:
                text = div.text.strip()
                if re.search(r"\d{5}", text):  # traži poštanski broj
                    addr_list.append(text)
            address = ", ".join(addr_list) if addr_list else "N/A"
        except:
            address = "N/A"

        # --- GPS koordinate (ako postoje u tekstu, npr. "Locate 45.116144, 18.538152") ---
        try:
            page_text = driver.find_element(By.TAG_NAME, "body").text
            match = re.search(r"Locate\s*([0-9\.\-]+),\s*([0-9\.\-]+)", page_text)
            lat, lon = (match.group(1), match.group(2)) if match else ("", "")
        except:
            lat, lon = "", ""

        results.append({
            "Ime TZ": tz_name,
            "Telefon": phone,
            "Email": email,
            "Web": website,
            "Adresa": address,
            "Latitude": lat,
            "Longitude": lon,
            "URL": tz_url
        })

        print(f"✅ {tz_name} | {phone} | {email} | {website} | {address} | {lat} | {lon}")

driver.quit()

# --- Spremi u Excel ---
df = pd.DataFrame(results).drop_duplicates(subset=["Ime TZ"])
df.to_excel("turisticke_zajednice_selenium.xlsx", index=False)
print("📂 Gotovo! Spremljeno u turisticke_zajednice_selenium.xlsx")
