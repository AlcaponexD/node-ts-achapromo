import { getCustomRepository } from 'typeorm';
import CommentRepository from '../typeorm/repository/CommentRepository';

export default class ListCommentsService {
  public async findByProductId(id: string): Promise<Comment[]> {
    const commentRepository = getCustomRepository(CommentRepository);
    const comments = await commentRepository.findByProductId(id);

    return comments;
  }
}
