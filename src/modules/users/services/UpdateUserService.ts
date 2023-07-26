import { getCustomRepository } from 'typeorm';
import User from '../typeorm/entities/User';
import UsersRepository from '../typeorm/repositories/UsersRepository';
import AppError from '../../../shared/errors/AppError';
import { hash } from 'bcryptjs';

interface IRequest {
  user_id: string;
  name: string;
  email: string;
  password: string;
}
interface IResponse {
  name: string;
  email: string;
  avatar: string;
  id: string;
}
class UpdateUserService {
  public async execute({
    user_id,
    name,
    email,
    password,
  }: IRequest): Promise<IResponse> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findById(user_id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const hashedPassword = await hash(password, 8);

    name ? (user.name = name) : null;
    email ? (user.email = email) : null;
    password ? (user.password = hashedPassword) : null;
    await usersRepository.save(user);

    return {
      name: user.name,
      email: user.email,
      avatar: user.avatar ? process.env.URL_APP + '/files/' + user.avatar : '',
      id: user.id,
    };
  }
}

export default UpdateUserService;
