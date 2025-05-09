import { Request, Response } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';
import ListCategoryService from '../services/ListCategoryService';

class CategoryController {
  public async create(request: Request, response: Response): Promise<Response> {
    const categorysService = new CreateCategoryService();
    const category = await categorysService.create(request.body);
    return response.json(category);
  }

  public async list(request: Request, response: Response): Promise<Response> {
    const categorysService = new ListCategoryService();
    const categories = await categorysService.list();
    return response.json(categories);
  }
  public async show(request: Request, response: Response): Promise<Response> {
    const { page = 1, per_page = 20 } = request.query;
    const categorysService = new ListCategoryService();
    const products = await categorysService.show(
      request.params.id,
      Number(page),
      Number(per_page),
    );
    return response.json(products);
  }
}

export default CategoryController;
