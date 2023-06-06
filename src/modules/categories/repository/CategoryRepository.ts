import { EntityRepository, Repository } from 'typeorm';
import { Category } from '../typeorm/entities/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async findByName(title: string): Promise<Category | undefined> {
    const category = await this.findOne({
      where: {
        title,
      },
    });

    return category;
  }
}

export default CategoryRepository;
