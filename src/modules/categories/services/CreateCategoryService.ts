import { getCustomRepository } from 'typeorm';
import CategoryRepository from '../repository/CategoryRepository';
import AppError from '@shared/errors/AppError';
import helpers from '@modules/utils/helpers';
import { publishedEnum } from '../typeorm/entities/Category';

interface IRequest {
  title: string;
  avatar?: string;
  slug?: string;
  published: publishedEnum;
}

class CreateCategoryService {
  public async create(data: IRequest) {
    const categoryRepository = getCustomRepository(CategoryRepository);
    const category_exists = await categoryRepository.findByName(data.title);
    if (category_exists) {
      throw new AppError('Category not exists', 404);
    }

    data.slug = helpers.slug(data.title);
    data.published = publishedEnum.Option2;

    const category = categoryRepository.create(data);
    await categoryRepository.save(category);
    return category;
  }
}
export default CreateCategoryService;
