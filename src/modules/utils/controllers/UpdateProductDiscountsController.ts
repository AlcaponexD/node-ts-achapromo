import { Request, Response } from 'express';
import UpdateProductDiscountsService from '../services/UpdateProductDiscountsService';

class UpdateProductDiscountsController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const updateProductDiscountsService = new UpdateProductDiscountsService();

    await updateProductDiscountsService.execute();

    return response.json({
      message: 'Descontos dos produtos atualizados com sucesso!',
    });
  }
}

export default UpdateProductDiscountsController;
