import { EntityRepository, Repository } from 'typeorm';
import Stars from '../entities/Stars';

@EntityRepository(Stars)
class StarRepository extends Repository<Stars> {
  public async findByProductId(
    product_id: string,
    user_id: string,
  ): Promise<Stars | undefined> {
    const stars = await this.findOne({
      where: {
        product_id,
        user_id,
      },
    });

    return stars;
  }

  public async deleteByProductId(
    product_id: string,
    user_id: string,
  ): Promise<any> {
    const deleted = await this.delete({
      product_id,
      user_id,
    });

    return deleted;
  }
}

export default StarRepository;
