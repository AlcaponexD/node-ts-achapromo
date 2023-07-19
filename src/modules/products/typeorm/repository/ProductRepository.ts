import { EntityRepository, Repository } from 'typeorm';
import Product from '../entities/Product';
import Store from '@modules/stores/typeorm/entities/Store';

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
  public async findRecommends(): Promise<Product[] | undefined> {
    const products = await this.find({
      select: [
        'title',
        'url',
        'avatar',
        'price',
        'description',
        'classification',
        'store',
        'category',
        'user',
        'store_id',
      ],
      where: {
        in_review: 0,
        published: 1,
      },
    });
    return products;
  }
}
export default ProductRepository;
