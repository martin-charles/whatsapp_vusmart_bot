# 📘 WhatsApp + VuSmartMaps Node.js Bot

This project is a WhatsApp automation bot built using **Node.js**, **Express**, **Meta WhatsApp Cloud API**, and **VuSmartMaps APIs**.  
It allows users to interact with system metrics like **CPU, Memory, Disk**, and banking KPIs directly through WhatsApp, fetched securely from VuSmartMaps.

The bot supports:

- 📩 Receiving WhatsApp messages  
- 🔘 Sending interactive buttons  
- 📊 Fetching CPU metrics from VuSmartMaps  
- 🔐 Secure authentication via JWT  
- 🚀 Deployable on Linux, Docker, or Kubernetes  

---

## 🚀 Features

### ✅ WhatsApp Integration
- Uses **Meta WhatsApp Cloud API**  
- Fully supports **interactive button menus**  
- Automatic replies with guided user flows  

### ✅ VuSmartMaps Integration
- Logs in using VuSmartMaps authentication API  
- Fetches metrics via **VuSmartMaps REST APIs**  
- Currently supports **CPU Utilization**  
- Easily extendable to:
  - Memory usage  
  - Disk utilization  
  - UPI failures  
  - TD/BD decline counts  
  - IMPS success rate  
  - Finacle latency  

### ✅ Configurable & Secure
- `.env` file stores all secrets (never committed)  
- HTTPS agent bypass supported for internal deployments  
- Easily configurable endpoints for new metrics  

### ✅ Lightweight Architecture
- Express-based  
- Minimal dependencies  
- Runs on any Node.js server, container, or k8s pod  

---

## 🔧 Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/martin-charles/whatsapp_vusmart_bot.git
cd whatsapp_vusmart_bot

### 2️⃣ Install Dependencies
```bash
npm install

### 3️⃣ Create a .env File

# WhatsApp Credentials
VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_TOKEN=your_whatsapp_api_token
PHONE_NUMBER_ID=your_phone_number_id

# VuSmartMaps Credentials
VSM_LOGIN_URL=https://<vsm-host>/vuSmartMaps/api/1/bu/1/auth/users/login/
VSM_CPU_URL=https://<vsm-host>/api/metrics/Linux_CPU_Util/
VSM_USERNAME=your_username
VSM_PASSWORD=your_password

### ▶️ Running the Bot

 node app.js

The bot runs at:

http://localhost:3030

🔄 WhatsApp Webhook Setup (Meta Cloud API)

---

📩 Supported WhatsApp Interactions
👋 User sends: hi

Bot responds with buttons:

CPU Usage
Memory
Disk

🔘 User clicks: CPU Usage

Bot fetches the last 1 hour CPU load from VuSmartMaps and sends:

🔥 CPU Utilization (1h): 42.58%

📡 VuSmartMaps API Flow (How It Works)

1️⃣ Login to VuSmartMaps → Retrieve access_token
2️⃣ Call metrics API → /Linux_CPU_Util?relative_time=1h
3️⃣ Parse numeric CPU percentage
4️⃣ Send formatted reply via WhatsApp

🧱 Extending This Bot

To add more metrics, simply:

Add the API endpoint in .env
Create a new handler in app.js
Add a WhatsApp interactive button for the new metric

Possible extensions:

Memory consumption
Disk usage
Network throughput
UPI TPS
TD/BD decline percentages
IMPS success rate
Finacle latency / CBS KPIs

The design is fully pluggable — no architectural changes needed.

Configure the following in your Meta Developer Dashboard:

Callback URL: https://<your-server>/webhook
Verify Token: <your VERIFY_TOKEN>

Webhook verification must match the VERIFY_TOKEN in .env.
