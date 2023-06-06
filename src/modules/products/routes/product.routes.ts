import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import ProductControlller from '@modules/products/controllers/ProductController';
import isAuthenticated from '@shared/http/middlewares/isAuthenticated';

const productController = new ProductControlller();
const productRouter = Router();

productRouter.post(
  '/',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      title: Joi.string(),
      price: Joi.number(),
      url: Joi.string().required(),
      avatar: Joi.string(),
      description: Joi.string(),
      category: Joi.string(),
      store_id: Joi.string(),
    },
  }),
  productController.create,
);

export default productRouter;
