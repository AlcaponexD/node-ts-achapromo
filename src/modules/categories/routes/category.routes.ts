import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import isAuthenticated from '@shared/http/middlewares/isAuthenticated';
import CategoryController from '../controllers/CategoryController';

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
