import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import AppError from '@shared/errors/AppError';

interface IDataUpdate {
  title?: string;
  price?: number;
  description?: string;
  category_name?: string;
}

export default class UpdateProductService {
  public async execute(data: IDataUpdate, id: string) {
    //Recuvery product
    const productRepository = getCustomRepository(ProductRepository);
    const productExists = await productRepository.findProductById(id);
    if (!productExists) {
      throw new AppError('Produto não encontrado,404');
    }

    //Validade data input sended
    if (data.title) {
      productExists.title = data.title;
    }
    if (data.price) {
      productExists.price = data.price;
    }
    if (data.description) {
      productExists.description = data.description;
    }
    await productRepository.save(productExists);

    return productExists;
  }
}
