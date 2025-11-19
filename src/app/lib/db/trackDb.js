import { getDbConnection, getSubdomain } from "../tenantDb.js";
import dbConnect from "../../connection/dbConnect.js";

export async function getTrackDb(req, timeoutMs = 8000) {
  let subdomain = null;
  if (req && req.headers && typeof req.headers.get === "function") {
    subdomain = getSubdomain(req);
  }
  // Use static URI for tracking DB, same as tenantDb.js
  const staticUri =
    "mongodb+srv://anshul:anshul149@clusterdatabase.24furrx.mongodb.net/tenant_bharat?retryWrites=true&w=majority";
  // Add timeout for DB connection
  return await Promise.race([
    dbConnect(staticUri),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DB connection timed out")), timeoutMs)
    ),
  ]);
}
