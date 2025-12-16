import CallService from '../services/callService';
import { getDbConnection, getSubdomain } from '../tenantDb';


export async function initiateCallController(body, conn, tenant) {
  try {
    const { leadId } = body || {};
    if (!leadId) return NextResponse.json({ success: false, message: 'leadId is required' }, { status: 400 });
    console.log('initiateCallController called with leadId:', leadId);
    const svc = new CallService(conn);
    const result = await svc.initiateCall(leadId, tenant);
    return {body: { success: true, data: result }, status: 200 };
  } catch (err) {
    console.error('initiateCallController error:', err.message);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
}     
}

export async function webhookController(request) {
  try {
    const subdomain = getSubdomain(request);
    const conn = await getDbConnection(subdomain);
    if (!conn) return new Response('OK', { status: 200 }); // keep webhook idempotent

    const body = await request.json();
    const svc = new CallService(conn);
    await svc.handleWebhook(body);
    return new Response('OK', { status: 200 });
  } catch (err) {
    console.error('callController.webhook error:', err.message);
    return new Response('OK', { status: 200 });
  }
}
