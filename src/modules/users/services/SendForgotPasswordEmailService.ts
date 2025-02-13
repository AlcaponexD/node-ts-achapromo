import { getCustomRepository } from 'typeorm';
import UsersRepository from '../typeorm/repositories/UsersRepository';
import UserTokensRepository from '../typeorm/repositories/UserTokenRepository';
import EtherealMail from '../../../config/mail/EtherealMail';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  email: string;
}

class SendForgotPasswordEmailService {
  public async execute({ email }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository);
    const userTokensRepository = getCustomRepository(UserTokensRepository);

    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError('User does not exists.');
    }

    const token = await userTokensRepository.generate(user.id);

    //console.log(token);
    await EtherealMail.sendMail({
      to: email,
      body: `Solicitação se redefinição de senha recebida: ${token?.token}`,
      subject: 'Recuperação de senha',
    });
  }
}

export default SendForgotPasswordEmailService;
