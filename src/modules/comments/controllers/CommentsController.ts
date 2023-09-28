import { Request, Response } from 'express';
import CreateCommentService from '../services/CreateCommentService';

export default class CommentsController {
  public async store(request: Request, response: Response): Promise<Response> {
    const data = {
      product_id: request.body.product_id,
      user_id: request.user.id,
      content: request.body.content,
    };

    const commentsService = new CreateCommentService();
    const comments = await commentsService.execute(data);
    return response.json(comments);
  }
}
