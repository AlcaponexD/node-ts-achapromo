import { promises as fs } from 'fs';
import path from 'path';
import logger from '../../../logger';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class CacheService {
  private cacheDir: string;
  private defaultExpirationMs: number;

  constructor() {
    // Use absolute path to ensure cross-platform compatibility
    this.cacheDir = path.resolve(process.cwd(), 'cache');
    // Default expiration time: 12 hours in milliseconds
    this.defaultExpirationMs = 12 * 60 * 60 * 1000;
    this.initCacheDir();
  }

  private async initCacheDir(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      // Verify the directory was created successfully
      await fs.access(this.cacheDir, fs.constants.W_OK);
      logger.info(`Cache directory initialized at: ${this.cacheDir}`);
    } catch (error) {
      logger.error(`Failed to create or access cache directory: ${error}`);
    }
  }

  private getCacheFilePath(key: string): string {
    return path.join(this.cacheDir, `${key}.json`);
  }

  public async set<T>(key: string, data: T, expiresIn?: number): Promise<void> {
    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiresIn: expiresIn || this.defaultExpirationMs,
      };

      await fs.writeFile(
        this.getCacheFilePath(key),
        JSON.stringify(cacheItem),
        'utf8',
      );
    } catch (error) {
      logger.error(`Failed to write cache for key ${key}: ${error}`);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = this.getCacheFilePath(key);
      const data = await fs.readFile(filePath, 'utf8');
      const cacheItem: CacheItem<T> = JSON.parse(data);

      // Check if cache is expired
      if (Date.now() - cacheItem.timestamp > cacheItem.expiresIn) {
        logger.info(`Cache expired for key: ${key}`);
        await this.invalidate(key); // Clean up expired cache
        return null;
      }

      return cacheItem.data;
    } catch (error) {
      // If file doesn't exist or any other error, return null
      return null;
    }
  }

  public async invalidate(key: string): Promise<void> {
    try {
      await fs.unlink(this.getCacheFilePath(key));
    } catch (error) {
      // Ignore if file doesn't exist
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(`Failed to invalidate cache for key ${key}: ${error}`);
      }
    }
  }

  public async invalidateAll(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file))),
      );
    } catch (error) {
      logger.error(`Failed to invalidate all cache: ${error}`);
    }
  }
}

export default new CacheService();
