import { Request, Response } from 'express';
import CreateSessionService from '../services/CreateSessionsService';

export default class SessionController {
  public async create(request: Request, response: Response): Promise<Response> {
    const { email, password } = request.body;
    const createSessions = new CreateSessionService();
    const user = await createSessions.execute({
      email,
      password,
    });

    return response.json(user);
  }
}
