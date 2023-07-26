import { Request, Response } from 'express';
import CreateUserService from '../services/CreateUserService';
import ListUserService from '../services/ListUserService';
import AppError from '@shared/errors/AppError';
import UpdateUserService from '../services/UpdateUserService';

export default class UserController {
  public async index(request: Request, response: Response): Promise<Response> {
    const listUser = new ListUserService();

    const users = await listUser.execute();

    return response.json(users);
  }
  public async showLoggedUser(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const listUser = new ListUserService();

    const user = await listUser.findUser(request.user.id);

    if (!user) {
      throw new AppError('User not found,404');
    }

    return response.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar ? process.env.URL_APP + '/files/' + user.avatar : '',
      id: user.id,
    });
  }
  public async publicProfile(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const listUser = new ListUserService();

    const user = await listUser.findUser(request.params.id);

    if (!user) {
      throw new AppError('User not found,404');
    }

    return response.json({
      name: user.name,
      email: user.email,
      avatar: user.avatar ? process.env.URL_APP + '/files/' + user.avatar : '',
      id: user.id,
    });
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, email, password } = request.body;

    const createUser = new CreateUserService();

    const user = await createUser.execute({
      name,
      email,
      password,
    });

    return response.json(user);
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const listUser = new UpdateUserService();

    const user = await listUser.execute({
      user_id: request.user.id,
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
    });

    return response.json(user);
  }
}
