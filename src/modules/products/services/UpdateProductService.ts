import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import AppError from '@shared/errors/AppError';
import CreateProductService from './CreateProductService';
import Product from '../typeorm/entities/Product';
import { count } from 'console';
import UsersRepository from '@modules/users/typeorm/repositories/UsersRepository';
import iShowProductResponse from '../interfaces/ShowProductResponse';

interface IDataUpdate {
  title?: string;
  price?: number;
  description?: string;
  category_name?: string;
}

export default class UpdateProductService {
  public async execute(
    data: IDataUpdate,
    id: string,
    user_id: string,
  ): Promise<iShowProductResponse> {
    //Recuvery product
    const productRepository = getCustomRepository(ProductRepository);
    const productExists = await productRepository.findProductById(id);
    if (!productExists) {
      throw new AppError('Produto não encontrado,404');
    }

    //Verify if admin or product owner
    const userRepository = getCustomRepository(UsersRepository);
    const admin = await userRepository.findById(user_id);
    if (!admin) {
      throw new AppError('Usuário não encontrado,404');
    }

    if (productExists.user.id === user_id || admin.is_admin) {
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

      if (data.category_name) {
        const ProductService = new CreateProductService();
        const category = await ProductService.getCategory(data.category_name);
        if (category) {
          productExists.category = category;
        }
      }

      await productRepository.save(productExists);

      return productExists;
    } else {
      throw new AppError('Usuário não tem permissão,403');
    }
  }
  public async changeStarsCount(id: string, action: string): Promise<string> {
    const productRepository = getCustomRepository(ProductRepository);
    let counts = 0;

    const product = await productRepository.findOne({
      where: {
        id,
      },
    });

    if (product) {
      if (action == 'up') {
        counts = product.classification ? product.classification + 1 : 1;
      } else {
        counts = product.classification ? product.classification - 1 : 1;
      }
      //Update
      await productRepository.updateClassification(id, counts);
    }

    return action;
  }
}
