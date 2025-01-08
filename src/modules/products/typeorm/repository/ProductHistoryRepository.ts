import { EntityRepository, Repository } from 'typeorm';
import ProductHistory from '../entities/ProductHistory';

@EntityRepository(ProductHistory)
class ProductHistoryRepository extends Repository<ProductHistory> {}
export default ProductHistoryRepository;
