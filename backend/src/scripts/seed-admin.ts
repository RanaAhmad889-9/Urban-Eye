import dotenv from 'dotenv'; dotenv.config();
import mongoose from 'mongoose';
import User from '../models/user.model';

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/urbaneye');
  const existing = await User.findOne({ email: 'admin@urbaneye.com' });
  if (existing) { console.log('Admin already exists'); process.exit(0); }
  await User.create({ name: 'Admin', email: 'admin@urbaneye.com', password: 'admin123', role: 'ADMIN' });
  console.log('✅ Admin created — email: admin@urbaneye.com  password: admin123');
  process.exit(0);
})();
