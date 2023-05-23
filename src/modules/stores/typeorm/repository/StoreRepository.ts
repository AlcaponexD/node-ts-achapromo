import { EntityRepository, Repository } from 'typeorm';
import Store from '../entities/Store';

@EntityRepository(Store)
class StoreRepository extends Repository<Store> {}

export default StoreRepository;
