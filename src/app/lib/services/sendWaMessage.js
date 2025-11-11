import generateWhatsAppTemplate from "@/app/utils/genrateTemplate";

const sendWaMessage = async (phone, options = {}) => {
  if (!phone) throw new Error("Recipient phone number is required");

  const {
    templateName,
    languageCode = "en_US",
    variables = [],
    type,
    message,
    data,
  } = options;

  // Allow either a template send (templateName + variables) or a plain text send (message)
  if (!templateName && (message === undefined || message === null))
    throw new Error(
      "Either templateName or message is required to send WhatsApp message"
    );

  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const fetchImpl = typeof fetch !== "undefined" && fetch;

  if (!token) throw new Error("Missing WHATSAPP_TOKEN environment variable");
  if (!phoneId)
    throw new Error("Missing WHATSAPP_PHONE_ID environment variable");
  if (!fetchImpl) throw new Error("No global fetch implementation found");

  const url = `https://graph.facebook.com/v20.0/${phoneId}/messages`;

  // Construct payload for template or text
  let payload;
  if (type === "template") {
    payload = {
      messaging_product: "whatsapp",
      to: phone.replace(/^\+/, ""), // remove leading +
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components: [
          {
            type: "body",
            parameters: variables.map((val) => ({
              type: "text",
              text: String(val),
            })),
          },
        ],
      },
    };
  } else {
    // plain text send
    payload = {
      messaging_product: "whatsapp",
      to: phone.replace(/^\+/, ""),
      type: "text",
      text: {
        body: String(generateWhatsAppTemplate({ templateName, data })),
      },
    };
  }

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const datas = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error("Failed to send WhatsApp message");
    error.status = response.status;
    error.response = datas;
    throw error;
  }

  return data;
};

export default sendWaMessage;
export { sendWaMessage };
