const env = require("../config/env");
const { connectToDatabase } = require("../config/db");
const { createUser } = require("../modules/users/user.service");
const { User } = require("../models/User");
const { FinancialRecord } = require("../models/FinancialRecord");

const DEFAULT_PASSWORD = "Password@123";

async function ensureUser({ name, email, role }) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return existing;

  return createUser({
    name,
    email,
    password: DEFAULT_PASSWORD,
    role,
    status: "active",
  });
}

async function seedRecords(adminId) {
  const currentCount = await FinancialRecord.countDocuments();
  if (currentCount > 0 && process.env.FORCE_SEED !== "true") {
    return { inserted: 0, skipped: true };
  }

  if (process.env.FORCE_SEED === "true") {
    await FinancialRecord.deleteMany({});
  }

  const now = new Date();
  const records = [
    { amount: 12500, type: "income", category: "Sales", date: new Date(now.getFullYear(), now.getMonth(), 2), note: "Invoice #A-102" },
    { amount: 1800, type: "expense", category: "Utilities", date: new Date(now.getFullYear(), now.getMonth(), 3), note: "Office electricity" },
    { amount: 9200, type: "income", category: "Consulting", date: new Date(now.getFullYear(), now.getMonth(), 7), note: "Advisory project" },
    { amount: 2200, type: "expense", category: "Payroll", date: new Date(now.getFullYear(), now.getMonth(), 10), note: "Contractor payout" },
    { amount: 760, type: "expense", category: "Software", date: new Date(now.getFullYear(), now.getMonth(), 11), note: "SaaS subscriptions" },
    { amount: 4500, type: "income", category: "Sales", date: new Date(now.getFullYear(), now.getMonth(), 14), note: "Invoice #A-115" },
    { amount: 980, type: "expense", category: "Travel", date: new Date(now.getFullYear(), now.getMonth(), 15), note: "Client travel" },
    { amount: 3900, type: "income", category: "Training", date: new Date(now.getFullYear(), now.getMonth(), 18), note: "Workshop revenue" },
    { amount: 1400, type: "expense", category: "Marketing", date: new Date(now.getFullYear(), now.getMonth(), 20), note: "Campaign spend" },
    { amount: 6400, type: "income", category: "Sales", date: new Date(now.getFullYear(), now.getMonth(), 22), note: "Invoice #A-121" },
    { amount: 3100, type: "expense", category: "Payroll", date: new Date(now.getFullYear(), now.getMonth(), 24), note: "Payroll cycle" },
    { amount: 850, type: "expense", category: "Maintenance", date: new Date(now.getFullYear(), now.getMonth(), 26), note: "Equipment repair" },
  ].map((item) => ({ ...item, createdBy: adminId }));

  await FinancialRecord.insertMany(records);
  return { inserted: records.length, skipped: false };
}

async function runSeed() {
  await connectToDatabase(env.MONGO_URI);

  const admin = await ensureUser({
    name: "System Admin",
    email: "admin@zovryn.local",
    role: "admin",
  });
  const analyst = await ensureUser({
    name: "Data Analyst",
    email: "analyst@zovryn.local",
    role: "analyst",
  });
  const viewer = await ensureUser({
    name: "Dashboard Viewer",
    email: "viewer@zovryn.local",
    role: "viewer",
  });

  const seeded = await seedRecords(admin.id);

  // eslint-disable-next-line no-console
  console.log("Seed complete:");
  // eslint-disable-next-line no-console
  console.log({
    users: [
      { email: admin.email, role: admin.role },
      { email: analyst.email, role: analyst.role },
      { email: viewer.email, role: viewer.role },
    ],
    password: DEFAULT_PASSWORD,
    records: seeded,
  });
}

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error("Seed failed:", error.message);
    process.exit(1);
  });
