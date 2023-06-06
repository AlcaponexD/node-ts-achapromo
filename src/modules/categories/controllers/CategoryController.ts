import { Request, Response } from 'express';
import CreateCategoryService from '../services/CreateCategoryService';

class CategoryController {
  public async create(request: Request, response: Response): Promise<Response> {
    const categorysService = new CreateCategoryService();
    const category = await categorysService.create(request.body);
    return response.json(category);
  }
}

export default CategoryController;
