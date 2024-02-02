import { getCustomRepository } from 'typeorm';
import StarRepository from '../typeorm/repository/StarRepository';

export default class StarService {
  public async syncStarByProductId(
    product_id: string,
    user_id: string,
  ): Promise<string> {
    const starRepository = getCustomRepository(StarRepository);
    const stars = await starRepository.findByProductId(product_id, user_id);
    let action = 'up';

    if (stars) {
      //Delete stars and return var
      starRepository.deleteByProductId(product_id, user_id);
      action = 'down';
    } else {
      const newStar = starRepository.create({
        product_id,
        user_id,
      });
      await starRepository.save(newStar);
    }

    return action;
  }
}
