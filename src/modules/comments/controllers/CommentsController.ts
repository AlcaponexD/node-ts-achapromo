import { Request, Response } from 'express';

export default class CommentsController {
  public async store(request: Request, response: Response): Promise<Response> {
    return response.json(request.body);
  }
}
