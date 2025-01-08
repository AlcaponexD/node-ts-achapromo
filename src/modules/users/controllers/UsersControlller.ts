import { Request, Response } from 'express';
import CreateUserService from '../services/CreateUserService';
import ListUserService from '../services/ListUserService';
import AppError from '@shared/errors/AppError';
import UpdateUserService from '../services/UpdateUserService';
import UserUpdateInterface from '../interfaces/UserUpdateInterface';
interface IRequest {
  user_id: string;
  name: string;
  email: string;
  password?: string;
}
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
      avatar: user.avatar
        ? process.env.URL_APP + '/files/avatar/' + user.avatar
        : '',
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
      avatar: user.avatar
        ? process.env.URL_APP + '/files/avatar/' + user.avatar
        : '',
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

    return response.status(200).json({
      message: 'User registered successfully',
    });
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const listUser = new UpdateUserService();

    const data_user: UserUpdateInterface = {
      user_id: request.user.id,
      name: request.body.name,
      email: request.body.email,
    };

    if (request.body.password) {
      data_user.password = request.body.password;
    }

    const user = await listUser.execute(data_user);

    return response.json(user);
  }
}
