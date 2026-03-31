import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: 'management_system',
    });
    console.log(`Connecté à MongoDB: ${conn.connection.host}`);
  } catch (err) {
    console.error('Echec de la connexion.', err);
    process.exit(1);
  }
};
