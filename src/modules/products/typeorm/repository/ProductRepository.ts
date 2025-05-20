import {
  EntityRepository,
  ILike,
  IsNull,
  Not,
  Repository,
  getRepository,
  MoreThanOrEqual,
  MoreThan,
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
  public async findByUrl(url: string): Promise<Product | undefined> {
    const product = await this.findOne({
      where: {
        url,
      },
      relations: ['store', 'user', 'category', 'comments'],
    });

    return product;
  }

  public async findRecommends(
    page: number,
    perPage: number,
  ): Promise<iProductListResponse | undefined> {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 5);

    const queryBuilder = this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .where({
        in_review: InReviewEnum.Option1,
        published: InReviewEnum.Option2,
        classification: Not(IsNull()),
      })
      .orderBy('product.classification', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    const results = products.map(product => ({
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      discount_percentage: product.discount,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      comments_count: product.comments?.length || 0,
      store: {
        id: product.store?.id,
        title: product.store?.title,
      },
      user: {
        id: product.user?.id,
        name: product.user?.name,
      },
      category: {
        id: product.category?.id,
        title: product.category?.title,
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
    const keyword = query.search || '';

    const queryBuilder = this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .where('product.title ILIKE :keyword', { keyword: `%${keyword}%` })
      .andWhere("product.in_review = '0'")
      .andWhere("product.published = '1'");

    queryBuilder
      .orderBy('product.title', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    const results = products.map(product => ({
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      discount_percentage: product.discount,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      comments_count: product.comments?.length || 0,
      store: {
        id: product.store?.id,
        title: product.store?.title,
      },
      user: {
        id: product.user?.id,
        name: product.user?.name,
      },
      category: {
        id: product.category?.id,
        title: product.category?.title,
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
    page = page || 1;
    perPage = perPage || 10;

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const queryBuilder = this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .where({
        in_review: InReviewEnum.Option1,
        published: InReviewEnum.Option2,
        discount: MoreThan(0),
        updated_at: MoreThanOrEqual(fiveDaysAgo),
      })
      .orderBy('product.discount', 'DESC')
      .addOrderBy('product.created_at', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    const results = products.map(product => ({
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      discount_percentage: product.discount,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      comments_count: product.comments?.length || 0,
      store: {
        id: product.store?.id,
        title: product.store?.title,
      },
      user: {
        id: product.user?.id,
        name: product.user?.name,
      },
      category: {
        id: product.category?.id,
        title: product.category?.title,
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

    const queryBuilder = this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .where({
        in_review: InReviewEnum.Option1,
        published: InReviewEnum.Option2,
        created_at: MoreThanOrEqual(twoDaysAgo),
      })
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [products, total] = await queryBuilder.getManyAndCount();

    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;

    const results = products.map(product => ({
      id: product.id,
      title: product.title,
      url: product.url,
      avatar: product.avatar,
      price: product.price,
      discount_percentage: product.discount,
      description: product.description,
      classification: product.classification,
      created_at: product.created_at,
      comments_count: product.comments?.length || 0,
      store: {
        id: product.store?.id,
        title: product.store?.title,
      },
      user: {
        id: product.user?.id,
        name: product.user?.name,
      },
      category: {
        id: product.category?.id,
        title: product.category?.title,
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
        'product.discount',
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
        'product.discount as discount_percentage',
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
      discount_percentage: product.discount,
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

  public async findProductsRankingByDay(
    page: number,
    perPage: number,
  ): Promise<
    { products: any[]; total: number; next_page: boolean } | undefined
  > {
    const queryBuilder = this.createQueryBuilder('product')
      .innerJoinAndSelect('product.store', 'store')
      .innerJoinAndSelect('product.user', 'user')
      .innerJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.comments', 'comments')
      .leftJoinAndSelect('product.history', 'historic')
      .where({
        in_review: InReviewEnum.Option1,
        published: InReviewEnum.Option2,
        updated_at: MoreThanOrEqual(new Date(Date.now() - 24 * 60 * 60 * 1000)),
      })
      .orderBy('product.discount', 'DESC')
      .skip((page - 1) * perPage)
      .take(perPage);

    const [products, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / perPage);
    const nextPage = page < totalPages;
    const results = products.map((product: any) => {
      product.price = product.price / 100;
      const priceBRL = product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      product.price = product.price * 100;

      product.discount_percentage = product.discount;
      product.post = `[${product.discount}%OFF🤯 ]Descubra ${product.title} com ${product.discount}% de Desconto! 🚀 
    Aproveite a Oferta Imperdível no site da http://Achapromo.com.br
    Caixa de Som Marvo SG-302, RGB, Bluetooth, Sem Fio, Função Carregamento Sem Fio, Branco, SG-302
    ${priceBRL}`;

      return product;
    });

    return {
      products: results,
      total: totalPages,
      next_page: nextPage,
    };
  }
}

export default ProductRepository;
