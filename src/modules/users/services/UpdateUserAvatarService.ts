import path from 'path';
import { getCustomRepository } from 'typeorm';
import User from '../typeorm/entities/User';
import UsersRepository from '../typeorm/repositories/UsersRepository';
import uploadConfig from '../../../config/upload';
import fs from 'fs';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  user_id: string;
  avatarFileName: string;
}

class UpdateUserAvatarService {
  public async execute({ user_id, avatarFileName }: IRequest): Promise<User> {
    const usersRepository = getCustomRepository(UsersRepository);
    const user = await usersRepository.findById(user_id);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    if (user.avatar) {
      try {
        const UserAvatarFilePath = path.join(
          uploadConfig.directory,
          user.avatar,
        );
        const userAvatarFileExists = await fs.promises.stat(UserAvatarFilePath);

        if (userAvatarFileExists) {
          //Remove arquivo duplicado, caso existir
          await fs.promises.unlink(UserAvatarFilePath);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    }

    user.avatar = avatarFileName;
    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
