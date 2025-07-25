// tenantDb.js
import dbConnect from '../connection/dbConnect';
import mongoose from 'mongoose';

export function getSubdomain(request) {
  const xTenant = request.headers.get('x-tenant');
  if (xTenant) return xTenant;
  const host = request.headers.get('host') || '';
  const parts = host.split('.');
  if (parts.length > 2) return parts[0];
  if (parts.length === 2 && parts[0] !== 'localhost') return parts[0];
  return null;
}

export async function getDbConnection(subdomain) {
  if (!subdomain || subdomain === 'localhost') {
    return await dbConnect();
  } else {
    await dbConnect();
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', new mongoose.Schema({
      name: String,
      dbUri: String,
      subdomain: String
    }, { collection: 'tenants' }));
    const tenant = await Tenant.findOne({ subdomain });
    console.log('Tenant found:', tenant);
    if (!tenant?.dbUri) return null;
    return await dbConnect(tenant.dbUri);
  }
}
