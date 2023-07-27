import { getCustomRepository } from 'typeorm';
import CategoryRepository from '../repository/CategoryRepository';
import { Category, publishedEnum } from '../typeorm/entities/Category';

class ListCategoryService {
  public async list(): Promise<Category[]> {
    const categoryRepository = getCustomRepository(CategoryRepository);
    const categories = await categoryRepository.find({
      where: {
        published: publishedEnum.Option2,
      },
    });

    return categories;
  }
}
export default ListCategoryService;
