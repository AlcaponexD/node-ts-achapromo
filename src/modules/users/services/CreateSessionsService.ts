import { compare } from 'bcryptjs';
import { getCustomRepository } from 'typeorm';
import UsersRepository from '../typeorm/repositories/UsersRepository';
import { sign } from 'jsonwebtoken';
import authConfig from '../../../config/auth';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  email: string;
  password: string;
}

interface IResponse {
  user: {
    name: string;
    email: string;
    avatar: string;
    id: string;
  };
  token: string;
}

class CreateSessionService {
  public async execute({ email, password }: IRequest): Promise<IResponse> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const passwordConfirmed = await compare(password, user.password);

    if (!passwordConfirmed) {
      throw new AppError('Incorrect email/password combination', 401);
    }

    const token = sign({}, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn,
      subject: user.id,
    });

    return {
      user: {
        name: user.name,
        email: user.email,
        avatar: user.avatar
          ? process.env.URL_APP + '/files/avatar/' + user.avatar
          : '',
        id: user.id,
      },
      token,
    };
  }
}

export default CreateSessionService;
