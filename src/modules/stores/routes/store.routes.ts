import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import StoreController from '../controllers/StoreController';
import isAuthenticated from '@shared/http/middlewares/isAuthenticated';

const storeController = new StoreController();

const storeRouter = Router();

storeRouter.post(
  '/',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      title: Joi.string().required(),
      avatar: Joi.string().required(),
      url: Joi.string().required(),
      description: Joi.string(),
    },
  }),
  storeController.create,
);
export default storeRouter;
