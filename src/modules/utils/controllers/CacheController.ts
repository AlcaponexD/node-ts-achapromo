import { Request, Response } from 'express';
import cacheService from '../cache';
import logger from '../../../../logger';

class CacheController {
  public async invalidateKey(
    request: Request,
    response: Response,
  ): Promise<Response> {
    try {
      const { key } = request.params;

      if (!key) {
        return response.status(400).json({ error: 'Cache key is required' });
      }

      await cacheService.invalidate(key);
      logger.info(`Cache invalidated for key: ${key}`);

      return response.json({ message: 'Cache invalidated successfully' });
    } catch (error) {
      logger.error(`Error invalidating cache: ${error}`);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }

  public async invalidateAll(
    request: Request,
    response: Response,
  ): Promise<Response> {
    try {
      await cacheService.invalidateAll();
      logger.info('All cache invalidated');

      return response.json({ message: 'All cache invalidated successfully' });
    } catch (error) {
      logger.error(`Error invalidating all cache: ${error}`);
      return response.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new CacheController();
