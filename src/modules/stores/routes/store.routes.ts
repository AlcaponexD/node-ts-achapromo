import { Segments, celebrate } from 'celebrate';
import { Router } from 'express';
import Joi from 'joi';
import StoreController from '../controllers/StoreController';

const storeController = new StoreController();

const storeRouter = Router();

storeRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      title: Joi.string().required(),
      avatar: Joi.string().required(),
    },
  }),
  storeController.create,
);
export default storeRouter;
