import { Router } from 'express';
import CacheController from '../controllers/CacheController';

const cacheRouter = Router();
const cacheController = CacheController;

// Apply authentication middleware to all cache routes

// Route to invalidate specific cache key
cacheRouter.get('/:key', cacheController.invalidateKey);

// Route to invalidate all cache
cacheRouter.get('/', cacheController.invalidateAll);

export default cacheRouter;
