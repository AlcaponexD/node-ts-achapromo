import { EntityRepository, Repository } from 'typeorm';
import Click from '../entities/Click';

@EntityRepository(Click)
class ClickRepository extends Repository<Click> {
  public async findByTrackingId(
    tracking_id: string,
  ): Promise<Click | undefined> {
    const click = await this.findOne({
      where: {
        tracking_id,
      },
    });

    return click;
  }

  public async findByProductId(product_id: string): Promise<Click[]> {
    const clicks = await this.find({
      where: {
        product_id,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return clicks;
  }
}

export default ClickRepository;
