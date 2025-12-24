// tenantDb.js
import dbConnect from "../connection/dbConnect";
import mongoose from "mongoose";

export function getSubdomain(request) {
  const xTenant = request.headers.get("x-tenant");
  if (xTenant) return xTenant;
  const host = request.headers.get("host") || "";
  // If this specific domain is used, default tenant to 'bharat'
  if (host.includes("bharatgramudyogsangh.com")) return "bharat";
  const parts = host.split(".");
  if (parts.length > 2) return parts[0];
  if (parts.length === 2 && parts[0] !== "localhost") return parts[0];
  return null;
}

export async function getDbConnection(subdomain) {
  try {
    if (!subdomain || subdomain === "localhost") {
      //consolle?.log('Using default DB for subdomain29829:', subdomain);
      return await dbConnect();
    } else {
      // Use static URI for all subdomains except localhost/null
      //consolle?.log('Using static DB URI for subdomain:', subdomain);
      const staticUri =
        "mongodb+srv://anshul:anshul149@clusterdatabase.24furrx.mongodb.net/tenant_bharat?retryWrites=true&w=majority";
      return await dbConnect(staticUri);

      // If you want to keep the tenant lookup logic for future use, comment out below:
      /*
    await dbConnect();
    const tenantSchema = new mongoose.Schema({
      name: String,
      dbUri: String,
      subdomain: String
    }, { collection: 'tenants' });
    const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
    const tenant = await Tenant.findOne({ subdomain });
    if (!tenant?.dbUri) return null;
    return await dbConnect(tenant.dbUri);
    */
    }
  } catch (error) {
    console.log("error in connecting ==> ", error.message);
  }
}
