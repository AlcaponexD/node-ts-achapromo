import { Connection } from 'typeorm';
import { initializeDiscordNotificationTask } from '../../modules/utils/tasks/DiscordNotificationTask';

export const initializeDiscord = async (
  connection: Connection,
): Promise<void> => {
  try {
    initializeDiscordNotificationTask(connection);
    console.log('Discord notification service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Discord notification service:', error);
  }
};
