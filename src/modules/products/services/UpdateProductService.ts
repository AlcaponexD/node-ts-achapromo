import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import AppError from '@shared/errors/AppError';
interface IDataUpdate {
  title?: string;
  price?: number;
  avatar?: string;
  description?: string;
  category_name?: string;
}

export default class UpdateProductService {
  public async execute(data: any, id: string) {
    /*
    title: Joi.string(),
    price: Joi.number(),
    avatar: Joi.any(),
    description: Joi.string(),
    category_name: Joi.string(),
*/

    //Recuvery product
    const productRepository = getCustomRepository(ProductRepository);
    const productExists = await productRepository.findProductById(id);
    if (!productExists) {
      throw new AppError('Produto não encontrado,404');
    }

    //Validade data input sended
    const dataUpdate: IDataUpdate = {};
    if (data.title) {
      dataUpdate.title = data.title;
    }
    if (data.price) {
      dataUpdate.price = data.price;
    }
    if (data.description) {
      dataUpdate.description = data.description;
    }
    if (data.avatar) {
      //Toda lógica para novo avatar uplaod e get url

      dataUpdate.avatar = data.avatar;
    }

    //Renew avatar

    //Update

    return dataUpdate;
  }
}
