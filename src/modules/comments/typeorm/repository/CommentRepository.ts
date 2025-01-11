import { EntityRepository, Repository } from 'typeorm';
import Comment from '../entities/Comment';

@EntityRepository(Comment)
class CommentRepository extends Repository<Comment> {
  public async findByUserId(id: string): Promise<Comment[] | undefined> {
    const comments = await this.find({
      where: {
        user_id: id,
      },
    });

    return comments;
  }

  public async findByProductId(id: string): Promise<Comment[]> {
    const comments = await this.find({
      select: ['id'],
      where: {
        product_id: id,
      },
    });

    return comments;
  }
}

export default CommentRepository;
