import axios from 'axios';

export default class WhatsappService {
    constructor() {
        this.apiBase = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com/v19.0';
        this.phoneId = process.env.WHATSAPP_PHONE_ID;
        this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    }

    async sendTemplateMessage(to, templateName, params = [], language = "en_US") {
        try {
            // normalize params to an array (handle string, null, object, etc.)
            let parameters = [];
            if (params == null) {
                parameters = [];
            } else if (Array.isArray(params)) {
                parameters = params;
            } else {
                // e.g. params passed as single string or number
                parameters = [params];
            }

            // build template payload
            const templateObj = {
                name: templateName,
                language: { code: language },
            };

            // only add body component if we actually have parameters
            if (parameters.length > 0) {
                templateObj.components = [{
                    type: "body",
                    parameters: parameters.map((p) => ({ type: "text", text: String(p) })),
                }, ];
            }

            const payload = {
                messaging_product: "whatsapp",
                to,
                type: "template",
                template: templateObj,
            };

            //console.log("Sending WhatsApp template message with payload:", JSON.stringify(payload));

            const res = await axios.post(`${this.apiBase}/${this.phoneId}/messages`, payload, {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            //console.log("✅ WhatsApp API response:", res.data);
            return { success: true, data: res.data };
        } catch (err) {
            // safer error extraction
            const errData = err ? .response ? .data || err ? .message || err;
            //console.error("❌ WhatsApp API Error:", errData);
            return { success: false, message: errData };
        }
    }
}