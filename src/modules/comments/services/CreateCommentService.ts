import { getCustomRepository } from 'typeorm';
import CommentRepository from '../typeorm/repository/CommentRepository';
import IRequest from '../interfaces/CreateCommentRequest';
import { publishedEnum } from '../typeorm/entities/Comment';

export default class CreateCommentService {
  public async execute(data: IRequest) {
    const commentRepository = getCustomRepository(CommentRepository);
    data.published = publishedEnum.Option2;
    const comment = commentRepository.create(data);
    await commentRepository.save(comment);
    return comment;
  }
}
