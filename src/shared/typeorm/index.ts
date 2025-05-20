import { createConnection, Connection } from 'typeorm';
import { initializeDiscord } from '../http/discord';

async function startApp(): Promise<void> {
  try {
    const connection = await createConnection();
    console.log('Database connection established successfully!');

    // Initialize Discord notification service after database connection
    //await initializeDiscord(connection);
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}

export default startApp;

startApp();
