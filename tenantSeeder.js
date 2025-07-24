
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import TenantSchema from './src/app/lib/models/Tenant.js';

const globalDbUri = process.env.MONGODB_URI;

const globalModuleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null }
});
const globalRoleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  scope: { type: String, enum: ['global', 'tenant'], required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  modulePermissions: [{
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    permissions: [{ type: String }]
  }],
  createdAt: { type: Date, default: Date.now },
  deletedAt: { type: Date ,default: null },
});
const globalTenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true },
  companyName: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  dbUri: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  plan: { type: String, enum: ['free', 'basic', 'pro', 'enterprise'], default: 'free' },
  subscriptionStatus: { type: String, enum: ['trial', 'active', 'cancelled', 'expired'], default: 'trial' },
  trialEndsAt: { type: Date },
  renewalDate: { type: Date },
  lastAccessedAt: { type: Date },
  notes: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'SuperAdmin' },
  createdAt: { type: Date, default: Date.now },
});

async function seedTenantDBs() {
  // Connect to global DB
  const globalConn = await mongoose.createConnection(globalDbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const GlobalModule = globalConn.model('Module', globalModuleSchema);
  const GlobalRole = globalConn.model('Role', globalRoleSchema);
  const GlobalTenant = globalConn.model('Tenant', globalTenantSchema);

  // Fetch global modules and roles
  const globalModules = await GlobalModule.find({});
  const globalRoles = await GlobalRole.find({});

  // Get all tenants from global DB
  const tenants = await GlobalTenant.find();

  for (const tenant of tenants) {
    if (!tenant.dbUri) continue;
    const tenantConn = await mongoose.createConnection(tenant.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const Module = tenantConn.model('Module', globalModuleSchema);
    const Role = tenantConn.model('Role', globalRoleSchema);
    // Insert modules with same _id and data
    for (const mod of globalModules) {
      await Module.updateOne({ _id: mod._id }, mod.toObject(), { upsert: true });
    }
    // Insert roles with same _id and data
    for (const role of globalRoles) {
      await Role.updateOne({ _id: role._id }, { ...role.toObject(), tenantId: tenant._id }, { upsert: true });
    }
    await tenantConn.close();
    console.log(`Seeded tenant DB: ${tenant.companyName}`);
  }
  await globalConn.close();
  mongoose.disconnect();
}

seedTenantDBs().then(() => {
  console.log('Seeding complete.');
  process.exit(0);
}).catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
