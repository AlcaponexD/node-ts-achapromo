import { Router } from 'express';
import CommentsController from '../controllers/CommentsController';
import { Segments, celebrate } from 'celebrate';
import isAuthenticated from '@shared/http/middlewares/isAuthenticated';
import Joi from 'joi';

const commentsController = new CommentsController();
const commentRouter = Router();

commentRouter.post(
  '/',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      content: Joi.string(),
      product_id: Joi.string(),
    },
  }),
  commentsController.store,
);

export default commentRouter;
