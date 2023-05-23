import { Request, Response } from 'express';

class StoreController {
  public async create(request: Request, response: Response): Promise<Response> {
    return response.json(request.body);
  }
}
export default StoreController;
