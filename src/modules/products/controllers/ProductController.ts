import { Request, Response } from 'express';

export default class ProductControlller {
  public async create(request: Request, response: Response): Promise<Response> {
    const { name, url, price } = request.body;
    return response.json({
      name,
      url,
      price,
    });
  }
}
