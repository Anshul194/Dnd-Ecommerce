import NextelWhatsapp from "@/app/lib/services/WhatsappService";

export async function POST(req) {
  try {
    const body = await req.json();
    const { phone, type, templateId, args, message } = body;

    const whatsapp = new NextelWhatsapp();

    let response;

    if (type === "template") {
      response = await whatsapp.sendTemplate({
        to: phone,
        templateId,
        args: args || [],
      });
    } else {
      response = await whatsapp.sendText({
        to: phone,
        message,
      });
    }

    return Response.json({ ok: true, result: response });
  } catch (err) {
    return Response.json({ ok: false, error: err.message }, { status: 500 });
  }
}
