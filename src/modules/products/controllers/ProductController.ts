import { Request, Response } from 'express';
import CreateProductService from '../services/CreateProductService';
import UsersRepository from '@modules/users/typeorm/repositories/UsersRepository';
import { getCustomRepository } from 'typeorm';
import ListProductService from '../services/ListProductsService';

export default class ProductControlller {
  public async create(request: Request, response: Response): Promise<Response> {
    const body = request.body;
    const productService = new CreateProductService();

    const userService = getCustomRepository(UsersRepository);

    const user = await userService.findOne({
      where: {
        id: request.user.id,
      },
    });

    body.user = user;
    const product = await productService.execute(body);

    return response.json(product);
  }
  public async listRecommends(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();
    const products = await productService.recommends();
    return response.json(products);
  }
}
