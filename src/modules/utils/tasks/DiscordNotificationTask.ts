import { CronJob } from 'cron';
import DiscordNotificationService from '../services/DiscordNotificationService';
import { Connection } from 'typeorm';

export const initializeDiscordNotificationTask = (
  connection: Connection,
): void => {
  const discordNotificationService = new DiscordNotificationService();

  // Execute immediately upon startup
  console.log('Running initial Discord notification task...');
  discordNotificationService.execute().catch(error => {
    console.error('Error in initial Discord notification task:', error);
  });

  // Schedule the job to run at 7 AM daily
  const job = new CronJob('0 7 * * *', async () => {
    console.log('Running scheduled Discord notification task...');
    try {
      await discordNotificationService.execute();
    } catch (error) {
      console.error('Error in Discord notification task:', error);
    }
  });

  job.start();
  console.log('Discord notification task scheduled for 7 AM daily');
};
