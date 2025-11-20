import axios from "axios";

const NEXTEL_BASE = "https://api.nextel.io/API_V2/Whatsapp";

export default class NextelWhatsapp {
  constructor() {
    this.apiKey = process.env.NEXTEL_API_KEY; // if needed
    this.sender = process.env.NEXTEL_SENDER_PHONE; // 91xxxxxxxx
    this.namespace = process.env.NEXTEL_NAMESPACE;
  }

  async sendTemplate({ to, templateId, args = [], fileName = "" }) {
    try {
      const payload = {
        type: "template",
        templateId,
        templateArgs: args,
        sender_phone: this.sender,
        file_name: fileName,
        namespace: this.namespace,
        templateLanguage: "en",
      };

      const url = `${NEXTEL_BASE}/send_template/${to}`;

      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    }
  }

  async sendText({ to, message }) {
    try {
      const payload = {
        type: "text",
        message,
        sender_phone: this.sender,
      };

      const url = `${NEXTEL_BASE}/send_session/${to}`;

      const res = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err?.response?.data || err.message };
    }
  }
}
