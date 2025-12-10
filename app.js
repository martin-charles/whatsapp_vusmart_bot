// 📌 Load environment variables
require("dotenv").config();

// 📦 Dependencies
const express = require("express");
const axios = require("axios");
const https = require("https");

// 🚀 Initialize Express app
const app = express();
app.use(express.json());

// 🔐 Config Variables (loaded from .env)
const {
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  PHONE_NUMBER_ID,
  VSM_LOGIN_URL,
  VSM_CPU_URL,
  VSM_USERNAME,
  VSM_PASSWORD
} = process.env;

// Create HTTPS Agent to bypass self-signed cert
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// ------------------------------------------------------
// 🔐 Function: Login to VuSmartMaps
// ------------------------------------------------------
async function loginToVuSmartMaps() {
  try {
    const response = await axios.post(
      VSM_LOGIN_URL,
      {
        username: VSM_USERNAME,
        password: VSM_PASSWORD,
      },
      { httpsAgent }
    );

    return response.data?.access_token;
  } catch (err) {
    console.error("❌ VuSmartMaps Login Failed:", err.response?.data || err);
    return null;
  }
}

// ------------------------------------------------------
// 📊 Function: Fetch CPU metric
// ------------------------------------------------------
async function fetchCpuMetric(duration) {
  try {
    const token = await loginToVuSmartMaps();
    if (!token) return null;

    const url = `${VSM_CPU_URL}?relative_time=${duration}`;

    const response = await axios.get(url, {
      httpsAgent,
      headers: { Authorization: `Bearer ${token}` },
    });

    const metricData = response.data.metricData?.[0]?.data?.[0];
    return metricData?.avg_cpu || null;
  } catch (err) {
    console.error("❌ CPU Fetch Error:", err.response?.data || err);
    return null;
  }
}

// ------------------------------------------------------
// 📤 Helper: Send WhatsApp message
// ------------------------------------------------------
async function sendWhatsAppMessage(to, text) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    text: { body: text },
  };

  await axios.post(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ------------------------------------------------------
// 📤 Helper: Send WhatsApp Buttons
// ------------------------------------------------------
async function sendMenuButtons(to) {
  const payload = {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: "👋 Hi! Please choose an option:" },
      action: {
        buttons: [
          { type: "reply", reply: { id: "cpu", title: "CPU Usage" } },
          { type: "reply", reply: { id: "mem", title: "Memory" } },
          { type: "reply", reply: { id: "disk", title: "Disk" } },
        ],
      },
    },
  };

  await axios.post(
    `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
}

// ------------------------------------------------------
// 🔄 Webhook Verification
// ------------------------------------------------------
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// ------------------------------------------------------
// 📩 Receive WhatsApp Messages
// ------------------------------------------------------
app.post("/webhook", async (req, res) => {
  const message =
    req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0] || null;

  if (!message) return res.sendStatus(200);

  const from = message.from;
  const text = message.text?.body;
  const buttonId = message.interactive?.button_reply?.id;

  console.log("📥 Incoming message:", text || buttonId);

  // 1️⃣ User sends "hi" → Show menu buttons
  if (text && text.toLowerCase() === "hi") {
    await sendMenuButtons(from);
    return res.sendStatus(200);
  }

  // 2️⃣ User clicks "CPU Usage"
  if (buttonId === "cpu") {
    const cpu = await fetchCpuMetric("1h");

    if (cpu !== null) {
      await sendWhatsAppMessage(
        from,
        `🔥 *CPU Utilization (1h)*: ${cpu.toFixed(2)}%`
      );
    } else {
      await sendWhatsAppMessage(
        from,
        "⚠️ Could not fetch CPU data from VuSmartMaps."
      );
    }

    return res.sendStatus(200);
  }

  // 3️⃣ Other menu options (placeholder)
  if (buttonId === "mem") {
    await sendWhatsAppMessage(from, "ℹ️ Memory monitoring coming soon.");
    return res.sendStatus(200);
  }

  if (buttonId === "disk") {
    await sendWhatsAppMessage(from, "ℹ️ Disk metrics coming soon.");
    return res.sendStatus(200);
  }

  // Default Echo Reply
  await sendWhatsAppMessage(from, `You said: ${text}`);
  res.sendStatus(200);
});

// ------------------------------------------------------
// 🟢 Start Server
// ------------------------------------------------------
app.listen(3030, () => console.log("🌐 WhatsApp Bot running on port 3030"));

