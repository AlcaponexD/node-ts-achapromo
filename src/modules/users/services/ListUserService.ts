import { getCustomRepository } from 'typeorm';
import User from '../typeorm/entities/User';
import UsersRepository from '../typeorm/repositories/UsersRepository';

class ListUserService {
  public async execute(): Promise<User[]> {
    const usersRepository = getCustomRepository(UsersRepository);

    const users = usersRepository.find();

    return users;
  }

  public async findUser(id: string): Promise<User | undefined> {
    const usersRepository = getCustomRepository(UsersRepository);

    const users = usersRepository.findById(id);

    return users;
  }

  public async findUserByEmail(email: string): Promise<User | undefined> {
    const usersRepository = getCustomRepository(UsersRepository);

    const users = usersRepository.findByEmail(email);

    return users;
  }
}

export default ListUserService;
