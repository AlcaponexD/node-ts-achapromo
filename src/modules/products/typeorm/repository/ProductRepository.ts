import {
  EntityRepository,
  ILike,
  IsNull,
  Not,
  Repository,
  getRepository,
  MoreThanOrEqual,
} from 'typeorm';
import Product, { InReviewEnum, publishedEnum } from '../entities/Product';
import iProductListResponse from '../../interfaces/ProductListResponse';
import iShowProductResponse from '../../interfaces/ShowProductResponse';
import IMyProductsResponse from '../../interfaces/MyProductsResponse';
import iProductSearchListResponse from '../../interfaces/SearchProductResponse';
import ProductHistory from '../entities/ProductHistory';

interface IListResponse {
  products: iProductListResponse[];
  total: number;
  next_page: boolean;
}

@EntityRepository(Product)
class ProductRepository extends Repository<Product> {
  public async findByUrl(url: string): Promise<Product | undefined> {
    const product = await this.findOne({
      where: {
        url,
      },
    });

    return product;
  }

  public async findRecommends(
    page: number,
    perPage: number,
  ): Promise<any | undefined> {
    const [products, total] = await getRepository(Product)
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
      .leftJoin('product.category', 'category')
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
        classification: Not(IsNull()),
      })
      .orderBy('product.classification', 'DESC')
      .take(perPage)
      .skip((page - 1) * perPage)
      .getManyAndCount();

    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    return {
      products: products,
      total: totalPages,
      next_page: nextPage,
    };
  }

  public async searchProducts(
    query: any,
  ): Promise<iProductSearchListResponse | undefined> {
    const perPage = parseInt(query.per_page) || 10;
    const page = parseInt(query.page) || 1;

    const keyword = query.search || '';
    const [products, total] = await getRepository(Product)
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
      .leftJoin('product.category', 'category')
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
        title: ILike('%' + keyword + '%'),
        in_review: 0,
        published: 1,
      })
      .orderBy('product.title', 'DESC')
      .take(perPage)
      .skip((page - 1) * perPage)
      .getManyAndCount();

    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    return {
      products: products,
      total: totalPages,
      next_page: nextPage,
    };
  }

  public async findTops(
    page: number,
    perPage: number,
  ): Promise<any | undefined> {
    page = page || 1;
    perPage = perPage || 10;
    const queryBuilder = getRepository(Product)
      .createQueryBuilder('product')
      .select([
        'product.id AS id',
        'product.title AS title',
        'product.url AS url',
        'product.avatar AS avatar',
        'product.price AS price',
        'product.description AS description',
        'product.classification AS classification',
        'product.created_at AS created_at',
        'store.id AS store_id',
        'store.title AS store_title',
        'users.id AS user_id',
        'users.name AS user_name',
        'category.id AS category_id',
        'category.title AS category_title',
      ])
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'users')
      .innerJoin('product.category', 'category')
      .addSelect(subQuery => {
        return subQuery
          .select('ph.price')
          .from(ProductHistory, 'ph')
          .where('ph.product_id = product.id')
          .andWhere('product.price < ph.price')
          .orderBy('ph.created_at', 'ASC')
          .limit(1);
      }, 'history_price')
      .addSelect(subQuery => {
        return subQuery
          .select(
            `((ph.price::float - product.price::float) / ph.price::float) * 100`,
          )
          .from(ProductHistory, 'ph')
          .where('ph.product_id = product.id')
          .andWhere('product.price < ph.price')
          .orderBy('ph.created_at', 'ASC')
          .limit(1);
      }, 'discount_percentage')
      .where(qb => {
        const subQuery = qb
          .subQuery()
          .select('ph.price')
          .from(ProductHistory, 'ph')
          .where('ph.product_id = product.id')
          .andWhere('product.price < ph.price')
          .andWhere("product.in_review = '0'")
          .andWhere("product.published = '1'")
          .orderBy('ph.created_at', 'ASC')
          .limit(1)
          .getQuery();
        return `EXISTS (${subQuery})`;
      })
      .orderBy('discount_percentage', 'DESC')
      .addOrderBy('product.created_at', 'DESC')
      .offset((page - 1) * perPage)
      .limit(perPage);

    const products = await queryBuilder.getRawMany();
    const total = await queryBuilder.getCount();

    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;
    const results = products.map(product => ({
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      discount_percentage: product.discount_percentage,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      store: {
        id: product.store_id,
        title: product.store_title,
      },
      user: {
        id: product.user_id,
        name: product.user_name,
      },
      category: {
        id: product.category_id,
        title: product.category_title,
      },
    }));

    return {
      products: results,
      total: totalPages,
      next_page: nextPage,
    };
  }

  public async findNews(
    page: number,
    perPage: number,
  ): Promise<any | undefined> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2); // Get the date for two days ago

    const [products, total] = await getRepository(Product)
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
      .leftJoin('product.category', 'category')
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
        created_at: MoreThanOrEqual(twoDaysAgo), // Filter for records from the last two days
      })
      .orderBy('product.created_at', 'DESC')
      .take(perPage)
      .skip((page - 1) * perPage)
      .getManyAndCount();

    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    return {
      products: products,
      total: totalPages,
      next_page: nextPage,
    };
  }

  public async findProductsInReview(): Promise<any[] | undefined> {
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
        'product.stars as classification',
      ])
      .leftJoin('product.store', 'store')
      .leftJoin('product.user', 'user')
      .leftJoin('product.category', 'category')
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
        in_review: InReviewEnum.Option2,
        published: publishedEnum.Option2,
      })
      .orderBy('product.created_at', 'DESC')
      .getMany();
    return products;
  }

  public async findMyProductsSended(
    user_id: string,
  ): Promise<IMyProductsResponse[] | undefined> {
    const products = await getRepository(Product)
      .createQueryBuilder('product')
      .select([
        'product.id',
        'product.title',
        'product.url',
        'product.avatar',
        'product.price',
        'product.user_id',
        'product.description',
        'product.classification',
        'product.created_at',
        'product.published',
        'product.in_review',
        'product.stars as classification',
      ])
      .leftJoin('product.store', 'store')
      .innerJoin('product.user', 'user')
      .leftJoin('product.category', 'category')
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
        user: user_id,
      })
      .getMany();
    return products;
  }

  public async findProductById(
    id: string,
  ): Promise<iShowProductResponse | undefined> {
    const product = await getRepository(Product)
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
        'product.stars as classification',
      ])
      .leftJoin('product.store', 'store')
      .leftJoin('product.user', 'user')
      .leftJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .leftJoin('comments.user', 'comments_user')
      .leftJoin('product.history', 'histories')
      .addSelect([
        'store.id',
        'store.title',
        'user.id',
        'user.name',
        'user.avatar',
        'category.id',
        'category.title',
        'comments.id',
        'comments.content',
        'comments.created_at',
        'comments_user.name',
        'comments_user.id',
        'comments_user.avatar',
        'histories.id',
        'histories.price',
        'histories.created_at',
        'histories.updated_at',
      ])
      .where({
        id,
      })
      .orderBy('histories.created_at', 'ASC')
      .getOneOrFail();
    return product;
  }

  public async updateClassification(
    id: string,
    count: number,
  ): Promise<boolean> {
    await this.createQueryBuilder()
      .update(Product)
      .set({ classification: count })
      .where('id = :id', { id })
      .execute();

    return true;
  }
}
export default ProductRepository;
