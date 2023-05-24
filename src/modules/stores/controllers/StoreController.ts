import { Request, Response } from 'express';
import CreateStoreService from '../services/CreateStoreService';

class StoreController {
  public async create(request: Request, response: Response): Promise<Response> {
    const storeService = new CreateStoreService();

    const stored = await storeService.execute(request.body);

    return response.json(stored);
  }
}
export default StoreController;
