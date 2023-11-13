import { getCustomRepository, getRepository } from 'typeorm';
import CategoryRepository from '../repository/CategoryRepository';
import { Category, publishedEnum } from '../typeorm/entities/Category';
import Product from '@modules/products/typeorm/entities/Product';
import iShowProductResponse from '@modules/products/interfaces/ShowProductResponse';

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

  public async show(id: string): Promise<ShowCategoryProductResponse> {
    const products = await getRepository(Product)
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.title',
        'product.url',
        'product.avatar',
        'product.price',
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
      .getMany();

    const final_products = products.map(product => {
      if (product) {
        product.avatar =
          process.env.URL_APP + '/files/products/' + product.avatar;
      }
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
    };
  }
}
export default ListCategoryService;
