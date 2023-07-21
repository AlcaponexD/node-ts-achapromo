import AppError from '../../../shared/errors/AppError';
import Store, { publishedEnum } from '../typeorm/entities/Store';
import StoreRepository from '../typeorm/repository/StoreRepository';
import { getCustomRepository } from 'typeorm';

interface IRequest {
  title: string;
  avatar: string;
  description: string;
  url: string;
}

class CreateStoreService {
  public async execute({
    title,
    avatar,
    description,
    url,
  }: IRequest): Promise<Store> {
    const storeRepository = getCustomRepository(StoreRepository);
    const storeExists = await storeRepository.findByUrl(url);
    if (storeExists) {
      throw new AppError('Store exists');
    }
    const store = storeRepository.create({
      title,
      avatar,
      description,
      url,
      published: publishedEnum.Option1,
    });

    await storeRepository.save(store);

    return store;
  }
}

export default CreateStoreService;
