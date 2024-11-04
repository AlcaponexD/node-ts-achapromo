import {
  EntityRepository,
  ILike,
  IsNull,
  Like,
  Not,
  Repository,
  getRepository,
} from 'typeorm';
import Product, { InReviewEnum, publishedEnum } from '../entities/Product';
import iProductListResponse from '../../interfaces/ProductListResponse';
import iShowProductResponse from '../../interfaces/ShowProductResponse';
import IMyProductsResponse from '../../interfaces/MyProductsResponse';
import iProductSearchListResponse from '../../interfaces/SearchProductResponse';

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
  public async findRecommends(): Promise<iProductListResponse[] | undefined> {
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
        in_review: 0,
        published: 1,
      })
      .getMany();
    return products;
  }

  public async searchProducts(
    query: any,
  ): Promise<iProductSearchListResponse | undefined> {
    const perPage = parseInt(query.per_page) || 10; // Número padrão de registros por página
    const page = parseInt(query.page) || 1; // Número padrão da página

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
      .leftJoin('product.user', 'user') // Alias 'user' para a tabela de usuários
      .leftJoin('product.category', 'category')
      .leftJoin('product.comments', 'comments')
      .addSelect([
        'store.id',
        'store.title',
        'user.id', // Corrigido: use o alias 'user' para referenciar a tabela de usuários
        'user.name', // Corrigido: use o alias 'user' para referenciar a tabela de usuários
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

  public async findTops(): Promise<any[] | undefined> {
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
      .getMany();
    return products;
  }
  public async findNews(): Promise<any[] | undefined> {
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
        in_review: 0,
        published: 1,
      })
      .orderBy('product.created_at', 'DESC')
      .getMany();
    return products;
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
