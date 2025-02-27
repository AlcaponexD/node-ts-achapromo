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
import iProductSearchListResponse from '../../interfaces/SearchProductResponse';
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
        'user.avatar AS user_avatar',
        'category.id AS category_id',
        'category.title AS category_title',
        'comments.id AS comment_id',
        'comments.content AS comment_content',
        'comments.created_at AS comment_created_at',
        'comments_user.id AS comment_user_id',
        'comments_user.name AS comment_user_name',
        'comments_user.avatar AS comment_user_avatar',
        'histories.id AS history_id',
        'histories.price AS history_price',
        'histories.created_at AS history_created_at',
        'histories.updated_at AS history_updated_at',
      ])
      .innerJoin('product.store', 'store')
      .innerJoin('product.user', 'user')
      .innerJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .leftJoin('comments.user', 'comments_user')
      .leftJoin('product.history', 'histories');

    this.addDiscountPercentageSelect(queryBuilder, twoDaysAgo);

    queryBuilder.where({ id }).orderBy('histories.created_at', 'ASC');

    const rawResults = await queryBuilder.getRawMany();
    if (!rawResults || rawResults.length === 0) {
      throw new Error('Product not found');
    }

    const product = rawResults[0];
    const comments = rawResults
      .filter(row => row.comment_id)
      .map(row => ({
        id: row.comment_id,
        content: row.comment_content,
        created_at: row.comment_created_at,
        user: {
          id: row.comment_user_id,
          name: row.comment_user_name,
          avatar: row.comment_user_avatar,
        },
      }));

    const history = rawResults
      .filter(row => row.history_id)
      .map(row => ({
        id: row.history_id,
        price: row.history_price,
        created_at: row.history_created_at,
        updated_at: row.history_updated_at,
      }));

    return {
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
        avatar: product.user_avatar,
      },
      category: {
        id: product.category_id,
        title: product.category_title,
      },
      comments,
      history,
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
