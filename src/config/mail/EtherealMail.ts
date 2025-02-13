import nodemailer from 'nodemailer';

interface ISendMail {
  to: string;
  body: string;
  subject: string;
}
export default class EtherealMail {
  static async sendMail({ to, body, subject }: ISendMail): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    try {
      const message = await transporter.sendMail({
        from: process.env.MAIL_USER,
        to,
        subject,
        text: body,
      });
      console.log('E-mail enviado:', message.response);
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
    }
  }
}
