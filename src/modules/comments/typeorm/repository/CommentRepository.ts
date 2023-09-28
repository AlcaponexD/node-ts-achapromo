import { EntityRepository, Repository } from 'typeorm';

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
}

export default CommentRepository;
