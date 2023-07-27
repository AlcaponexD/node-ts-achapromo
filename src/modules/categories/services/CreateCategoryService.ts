import { getCustomRepository } from 'typeorm';
import CategoryRepository from '../repository/CategoryRepository';
import { publishedEnum } from '../typeorm/entities/Category';
import helpers from '../../../modules/utils/helpers';
import AppError from '../../../shared/errors/AppError';

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
      throw new AppError('Category exists', 422);
    }

    data.slug = helpers.slug(data.title);
    data.published = publishedEnum.Option2;

    const category = categoryRepository.create(data);
    await categoryRepository.save(category);
    return category;
  }
}
export default CreateCategoryService;
