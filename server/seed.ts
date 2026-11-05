import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from './db';
import { UserModel } from './models/User';

const DEMO_ACCOUNTS = [
  { name: 'CivicPulse Citizen', email: 'citizen@civicai.com', password: 'Citizen@123', role: 'citizen' as const },
  { name: 'CivicPulse Admin', email: 'admin@civicai.com', password: 'Admin@123', role: 'admin' as const },
  {
    name: 'CivicPulse Department Officer',
    email: 'officer@civicai.com',
    password: 'Officer@123',
    role: 'officer' as const,
    department: 'Public Works Department',
  },
];

const seed = async (): Promise<void> => {
  await connectDatabase();
  for (const account of DEMO_ACCOUNTS) {
    const existing = await UserModel.findOne({ email: account.email }).select('+passwordHash');
    if (existing) {
      if (
        existing.role !== account.role ||
        existing.name !== account.name ||
        existing.department !== account.department
      ) {
        await UserModel.updateOne(
          { _id: existing._id },
          { $set: { role: account.role, name: account.name, department: account.department } },
        );
        console.log(`Corrected demo account identity and role; preserved password: ${account.email}`);
      } else {
        console.log(`Preserved existing demo account: ${account.email}`);
      }
      continue;
    }
    await UserModel.create({
      name: account.name,
      email: account.email,
      passwordHash: await bcrypt.hash(account.password, 12),
      role: account.role,
      isDemoAccount: true,
    });
    console.log(`Created demo account: ${account.email}`);
  }
  await disconnectDatabase();
};

seed().catch(async (error) => {
  console.error('Demo account seed failed', error);
  await disconnectDatabase();
  process.exitCode = 1;
});
