import { getCustomRepository, getRepository } from 'typeorm';
import CategoryRepository from '../repository/CategoryRepository';
import { Category, publishedEnum } from '../typeorm/entities/Category';
import Product from '../../products/typeorm/entities/Product';
import iShowProductResponse from '../../products/interfaces/ShowProductResponse';

interface ShowCategoryProductResponse {
  category: Category;
  products: iShowProductResponse[];
}

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

  public async show(id: string, page: number, limit: number): Promise<any> {
    const [products, total] = await getRepository(Product)
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.title',
        'product.url',
        'product.avatar',
        'product.price',
        'product.discount as discount_percentage',
        'product.description',
        'product.classification',
        'product.created_at',
      ])
      .leftJoin('product.store', 'store')
      .leftJoin('product.user', 'user')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .addSelect([
        'store.id',
        'store.title',
        'user.id',
        'user.name',
        'category.id',
        'category.title',
        'comments.id',
      ])
      .where({
        in_review: 0,
        published: 1,
      })
      .andWhere('category.id = :categoryId', { categoryId: id })
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const final_products = products.map(product => {
      return product;
    });

    const categoryRepository = getCustomRepository(CategoryRepository);
    const category = await categoryRepository.findOneOrFail({
      where: {
        id,
      },
    });

    return {
      category,
      products: final_products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
export default ListCategoryService;
