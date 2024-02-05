import { getCustomRepository } from 'typeorm';
import Product from '../typeorm/entities/Product';
import ProductRepository from '../typeorm/repository/ProductRepository';
import path from 'path';
import uploadConfig from '../../../config/upload';
import fs from 'fs';
import AppError from '../../../shared/errors/AppError';
import iShowProductResponse from '../interfaces/ShowProductResponse';
import logger from '../../../../logger';

interface IRequest {
  id: string;
  avatarFileName: string;
}

class UpdateAvatarProductServce {
  public async execute({
    id,
    avatarFileName,
  }: IRequest): Promise<iShowProductResponse> {
    const productRepository = getCustomRepository(ProductRepository);
    const product = await productRepository.findProductById(id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    if (product.avatar) {
      //Junta o diretorio com o nome salvo no banco
      const ProductAvatarFilePath = path.join(
        uploadConfig.directoryProduct,
        product.avatar,
      );
      try {
        const productAvatarFileExists = await fs.promises.stat(
          ProductAvatarFilePath,
        );

        if (productAvatarFileExists) {
          //Remove arquivo duplicado, caso existir
          await fs.promises.unlink(ProductAvatarFilePath);
        }
      } catch (error) {
        logger.error(error);
      }

      product.avatar = avatarFileName;
      await productRepository.save(product);
    }
    return product;
  }
}

export default UpdateAvatarProductServce;
