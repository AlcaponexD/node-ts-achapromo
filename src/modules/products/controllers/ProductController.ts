import { Request, Response } from 'express';
import CreateProductService from '../services/CreateProductService';
import { getCustomRepository } from 'typeorm';
import ListProductService from '../services/ListProductsService';
import UsersRepository from '../../users/typeorm/repositories/UsersRepository';
import UpdateProductService from '../services/UpdateProductService';
import UpdateAvatarProductServce from '../services/UpdateAvatarProductService';
import StarService from '../../stars/services/StarService';
import AppError from '../../../shared/errors/AppError';

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

  public async listTops(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();
    const products = await productService.topProducts();
    return response.json(products);
  }

  public async listNews(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();
    const products = await productService.newsProducts();
    return response.json(products);
  }

  public async listInReview(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();
    const products = await productService.productInReview();
    return response.json(products);
  }

  public async moderateProduct(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();

    const { id, action } = request.body;

    const products = await productService.moderateProduct(id, action);
    return response.json(products);
  }
  public async showProduct(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();
    const product = await productService.productById(request.params.id);
    return response.json(product);
  }

  public async showMyProducts(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();

    const product = await productService.productByUserLogged(request.user.id);
    return response.json(product);
  }
  public async searchProducts(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const productService = new ListProductService();

    const product = await productService.search(request.query);
    return response.json(product);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const productService = new UpdateProductService();
    const product = await productService.execute(
      request.body,
      request.params.id,
      request.user.id,
    );

    return response.json(product);
  }

  public async updateAvatar(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const updateAvatar = new UpdateAvatarProductServce();
    const product = await updateAvatar.execute({
      id: request.params.id,
      avatarFileName: request.file?.filename as string,
    });

    return response.json(product);
  }

  public async updateClassification(
    request: Request,
    response: Response,
  ): Promise<Response> {
    if (!request.params.id) {
      throw new AppError('Uuid not sended', 422);
    }
    const uuid = request.params.id;

    const starService = new StarService();
    const productService = new UpdateProductService();

    const action = await starService.syncStarByProductId(uuid, request.user.id);

    const isChanged = await productService.changeStarsCount(uuid, action);

    return response.json(isChanged);
  }
}
