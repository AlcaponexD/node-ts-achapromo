import 'reflect-metadata';
import bodyParser from 'body-parser';
import multer from 'multer';
const forms = multer();
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import routes from './routes';
import '../../shared/typeorm/index';
import { errors } from 'celebrate';
import uploadConfig from '../../config/upload';
import AppError from '../errors/AppError';

const app = express();
// Put these statements before you define any routes.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().single('avatar'));
//Habilita cors para requisicões, sem passar parametro ele é * aceita todas origens
app.use(cors());

//Habilita para trabalhar com json por padrão
app.use(express.json());

//Rota publica para usar nas imagens feitas uploads
app.use('/files', express.static(uploadConfig.directory));

//Usa nossa arquivo de rotas tradicional externo
app.use(routes);

//Erro de validacoes
app.use(errors());

//Middleware para pegar errors sem ter que fica utilizando try catch nos código e pega os throw
//AppError
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });
  }

  const stack = new Error().stack;
  return res.status(500).json({
    status: 'error',
    message: error.message,
    stack: stack,
  });
});

app.listen(3333, () => {
  console.log('Server running on port 3333 !');
});
