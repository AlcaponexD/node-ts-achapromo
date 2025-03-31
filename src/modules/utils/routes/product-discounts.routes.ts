import { Router } from 'express';
import UpdateProductDiscountsController from '../controllers/UpdateProductDiscountsController';

const productDiscountsRouter = Router();
const updateProductDiscountsController = new UpdateProductDiscountsController();

productDiscountsRouter.post(
  '/update-discounts',
  updateProductDiscountsController.handle,
);

export default productDiscountsRouter;
