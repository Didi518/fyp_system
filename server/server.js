import app from './app.js';
import { connectDB } from './config/db.js';

process.on('uncaughtException', (err) => {
  console.error(`Exception non capturée: ${err.message}`);
  process.exit(1);
});

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 4000;
    const server = app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
    });

    process.on('unhandledRejection', (err) => {
      console.error(`Rejet non géré: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.error(`Impossible de démarrer le serveur: ${err.message}`);
    process.exit(1);
  }
};

startServer();
