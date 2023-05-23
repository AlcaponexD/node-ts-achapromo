import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import ProductControlller from '@modules/products/controllers/ProductController';

const productController = new ProductControlller();
const productRouter = Router();

productRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      price: Joi.number().required(),
      url: Joi.string().required(),
    },
  }),
  productController.create,
);

export default productRouter;
