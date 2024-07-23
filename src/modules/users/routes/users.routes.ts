import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import UserController from '../controllers/UsersControlller';
import isAuthenticated from '../../../shared/http/middlewares/isAuthenticated';
import upload from '../../../config/upload';
import UserAvatarController from '../controllers/UpdateUserAvatarController';

const usersRouter = Router();
const usersController = new UserController();
const usersAvatarController = new UserAvatarController();

usersRouter.get('/', isAuthenticated, usersController.index);
usersRouter.get('/me', isAuthenticated, usersController.showLoggedUser);
usersRouter.get('/show/:id', usersController.publicProfile);

usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  usersController.create,
);

usersRouter.patch(
  '/avatar',
  isAuthenticated,
  upload.avatar_storage.single('avatar'),
  usersAvatarController.update,
);

usersRouter.put(
  '/',
  isAuthenticated,
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string(),
      password_confirmation: Joi.string(),
    },
  }),
  usersController.update,
);

export default usersRouter;
