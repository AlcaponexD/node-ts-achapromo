import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import CategoryController from '../controllers/CategoryController';
import isAuthenticated from '../../../shared/http/middlewares/isAuthenticated';

const categoryController = new CategoryController();

const categoryRouter = Router();

categoryRouter.post(
  '/',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      title: Joi.string().required(),
      avatar: Joi.string(),
    },
  }),
  categoryController.create,
);
export default categoryRouter;
