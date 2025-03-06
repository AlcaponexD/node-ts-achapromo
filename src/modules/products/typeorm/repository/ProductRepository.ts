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
import iShowProductResponse from '../../interfaces/ShowProductResponse';
import IMyProductsResponse from '../../interfaces/MyProductsResponse';
import ProductHistory from '../entities/ProductHistory';
import {
  iProductListResponse,
  product as iProduct,
} from '@modules/products/interfaces/ProductListResponse';
import Iquery from '@modules/products/interfaces/QueryPaginationRequest';

@EntityRepository(Product)
class ProductRepository extends Repository<Product> {
  private addDiscountPercentageSelect(queryBuilder: any, twoDaysAgo: Date) {
    return queryBuilder.addSelect((subQuery: any) => {
      return subQuery
        .select(
          `((ph.price::float - product.price::float) / ph.price::float) * 100`,
        )
        .from(ProductHistory, 'ph')
        .where('ph.product_id = product.id')
        .andWhere('product.price < ph.price')
        .andWhere(`ph.created_at > '${twoDaysAgo.toISOString()}'`)
        .orderBy('ph.created_at', 'DESC')
        .limit(1);
    }, 'discount_percentage');
  }

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
  ): Promise<iProductListResponse | undefined> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 5);

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
        'user.id AS user_id',
        'user.name AS user_name',
        'category.id AS category_id',
        'category.title AS category_title',
      ])
      .addSelect('COUNT(DISTINCT comments.id)', 'comments_count')
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'user')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments');

    this.addDiscountPercentageSelect(queryBuilder, twoDaysAgo);

    queryBuilder
      .where({
        in_review: 0,
        published: 1,
        classification: Not(IsNull()),
      })
      .groupBy('product.id')
      .addGroupBy('store.id')
      .addGroupBy('user.id')
      .addGroupBy('category.id')
      .orderBy('product.classification', 'DESC')
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
      comments_count: parseInt(product.comments_count, 10),
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

  public async searchProducts(
    query: Iquery,
  ): Promise<iProductListResponse | undefined> {
    const perPage = query.per_page || 10;
    const page = query.page || 1;
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 5);

    const keyword = query.search || '';
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
      .addSelect('COUNT(DISTINCT comments.id)', 'comments_count')
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'users')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments');
    this.addDiscountPercentageSelect(queryBuilder, twoDaysAgo);

    queryBuilder
      .where('product.title ILIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere("product.in_review = '0'")
      .andWhere("product.published = '1'")
      .groupBy('product.id')
      .addGroupBy('product.title')
      .addGroupBy('product.url')
      .addGroupBy('product.avatar')
      .addGroupBy('product.price')
      .addGroupBy('product.description')
      .addGroupBy('product.classification')
      .addGroupBy('product.created_at')
      .addGroupBy('store.id')
      .addGroupBy('store.title')
      .addGroupBy('users.id')
      .addGroupBy('users.name')
      .addGroupBy('category.id')
      .addGroupBy('category.title')
      .orderBy('product.title', 'DESC')
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
      comments_count: parseInt(product.comments_count, 10),
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

  public async findTops(
    page: number,
    perPage: number,
  ): Promise<iProductListResponse | undefined> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 5);

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
      .addSelect('COUNT(DISTINCT comments.id)', 'comments_count')
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'users')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .addSelect(subQuery => {
        return subQuery
          .select(
            `((ph.price::float - product.price::float) / ph.price::float) * 100`,
          )
          .from(ProductHistory, 'ph')
          .where('ph.product_id = product.id')
          .andWhere('product.price < ph.price')
          .andWhere(`ph.created_at > '${twoDaysAgo.toISOString()}'`)
          .orderBy('ph.created_at', 'DESC')
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
          .andWhere(`ph.created_at > '${twoDaysAgo.toISOString()}'`)
          .orderBy('ph.created_at', 'DESC')
          .limit(1)
          .getQuery();
        return `EXISTS (${subQuery})`;
      })
      .groupBy('product.id')
      .addGroupBy('product.title')
      .addGroupBy('product.url')
      .addGroupBy('product.avatar')
      .addGroupBy('product.price')
      .addGroupBy('product.description')
      .addGroupBy('product.classification')
      .addGroupBy('product.created_at')
      .addGroupBy('store.id')
      .addGroupBy('store.title')
      .addGroupBy('users.id')
      .addGroupBy('users.name')
      .addGroupBy('category.id')
      .addGroupBy('category.title')
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
      comments_count: parseInt(product.comments_count, 10),
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
  ): Promise<iProductListResponse | undefined> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

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
        'user.id AS user_id',
        'user.name AS user_name',
        'category.id AS category_id',
        'category.title AS category_title',
      ])
      .addSelect('COUNT(DISTINCT comments.id)', 'comments_count')
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'user')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .where({
        in_review: 0,
        published: 1,
        created_at: MoreThanOrEqual(twoDaysAgo),
      })
      .groupBy('product.id')
      .addGroupBy('store.id')
      .addGroupBy('user.id')
      .addGroupBy('category.id')
      .orderBy('product.created_at', 'DESC')
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
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      comments_count: parseInt(product.comments_count, 10),
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

  public async findProductsInReview(): Promise<iProduct[] | undefined> {
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
    const product = await this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('product.history', 'history')
      .where('product.id = :id', { id })
      .getOne();

    if (!product) {
      throw new Error('Product not found');
    }

    const histories = product.history.map(history => ({
      id: history.id,
      price: history.price,
      created_at: history.created_at,
      updated_at: history.updated_at,
    }));

    return {
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      store: {
        id: product.store.id,
        title: product.store.title,
      },
      user: {
        id: product.user.id,
        name: product.user.name,
        avatar: product.user.avatar,
      },
      category: {
        id: product.category.id,
        title: product.category.title,
      },
      comments: product.comments.map(comment => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          avatar: comment.user.avatar,
        },
      })),
      history: histories.map(history => ({
        ...history,
        id: String(history.id),
      })),
    };
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
