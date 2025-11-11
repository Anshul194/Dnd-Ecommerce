import sendWaMessage from "../../lib/services/sendWaMessage";

// Built-in templates with simple {{placeholder}} values
const templates = {
  order_confirmation:
    "Hi {{name}}, your order {{orderId}} has been confirmed. Total: {{total}}. We will notify you when it ships.",
  order_completion:
    "Hi {{name}}, your order {{orderId}} is complete. Thank you for shopping with us!",
  wishlist_reminder:
    'Hi {{name}}, an item from your wishlist — "{{product}}" — is still available. It was added {{days}} days ago. Buy now to not miss out!',
};

function applyTemplate(template, vars = {}) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    // allow falsy but defined values (0 etc.)
    if (Object.prototype.hasOwnProperty.call(vars, key))
      return String(vars[key]);
    return "";
  });
}

// Build a WhatsApp Cloud API template payload from a local template string and messageVars.
// This maps placeholders in the template (in appearance order) to body parameters.
function buildTemplatePayload(templateName, templateStr, vars = {}) {
  const placeholders = [];
  const re = /\{\{(\w+)\}\}/g;
  let m;
  while ((m = re.exec(templateStr)) !== null) {
    placeholders.push(m[1]);
  }

  const parameters = placeholders.map((key) => ({
    type: "text",
    text: Object.prototype.hasOwnProperty.call(vars, key)
      ? String(vars[key])
      : "",
  }));

  const components = [];
  if (parameters.length) {
    components.push({ type: "body", parameters });
  }

  return {
    name: templateName,
    language: "en_US",
    components,
  };
}

export async function GET() {
  const exampleCurl = `curl -X POST 'http://localhost:3000/api/sendMsg' -H "Content-Type: application/json" -d '{"phone":"+919876543210","template":"order_confirmation","messageVars":{"name":"Anshul","orderId":"#1234","total":"₹1234"}}'`;

  return new Response(
    JSON.stringify({
      ok: true,
      availableTemplates: Object.keys(templates),
      description:
        "POST to this endpoint with JSON { phone, template OR message, messageVars? }. Templates support {{placeholder}} replacements via messageVars.",
      exampleCurl: exampleCurl,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, type, templateName, messageVars, message } = body || {};

    if (!phone)
      return new Response(
        JSON.stringify({ ok: false, error: "phone is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );

    let result;

    if (type === "text") {
      if (!message)
        return new Response(
          JSON.stringify({
            ok: false,
            error: "message is required for type 'text'",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );

      // Send a plain text message
      result = await sendWaMessage(phone, { message });
    } else {
      if (!templateName)
        return new Response(
          JSON.stringify({ ok: false, error: "templateName is required" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );

      // Send pre-approved template via WhatsApp Business API
      result = await sendWaMessage(phone, {
        templateName,
        languageCode: "en_US", // You can change this if you use other languages
        variables: messageVars || [],
        data : body.data
      });
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const status =
      err && err.status && Number(err.status) >= 400 ? Number(err.status) : 500;

    const payload = {
      ok: false,
      message: err.message || "Failed to send WhatsApp message",
    };

    if (err.response) payload.response = err.response;

    return new Response(JSON.stringify(payload), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
