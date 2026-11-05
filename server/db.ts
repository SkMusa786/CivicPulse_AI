import mongoose from 'mongoose';
import { config } from './config';

export const connectDatabase = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
