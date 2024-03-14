import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import authConfig from '../../../config/auth';
import AppError from '../../errors/AppError';
import { getCustomRepository } from 'typeorm';
import UsersRepository from '../../../modules/users/typeorm/repositories/UsersRepository';

interface TokenPayload {
  iat: number;
  exp: number;
  sub: string;
}
export default async function isAuthenticatedAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError('JWT Token is missing');
  }

  //Possivel desistruturação por split
  const [type, token] = authHeader.split(' ');
  const decodedToken = verify(token, authConfig.jwt.secret);
  const { sub } = decodedToken as TokenPayload;

  //Verify is admin
  const userRepository = getCustomRepository(UsersRepository);
  const admin = await userRepository.findById(sub);

  if (!admin) {
    throw new AppError('User not found');
  }

  request.user = {
    id: sub,
  };

  if (admin.is_admin === 'yes') {
    return next();
  } else {
    throw new AppError('You are not allowed to view this', 403);
  }
}
