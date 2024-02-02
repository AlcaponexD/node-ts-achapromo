import { EntityRepository, Repository } from 'typeorm';
import Stars from '../entities/Stars';

@EntityRepository(Stars)
class StarRepository extends Repository<Stars> {}

export default StarRepository;
