import { getCustomRepository } from 'typeorm';
import Product from '../typeorm/entities/Product';
import ProductRepository from '../typeorm/repository/ProductRepository';
import path from 'path';
import uploadConfig from '../../../config/upload';
import fs from 'fs';
import AppError from '../../../shared/errors/AppError';

interface IRequest {
  product_url: string;
  avatarFileName: string;
}

class UpdateAvatarProductServce {
  public async execute({
    product_url,
    avatarFileName,
  }: IRequest): Promise<Product> {
    const productRepository = getCustomRepository(ProductRepository);
    const product = await productRepository.findByUrl(product_url);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.avatar) {
      //Junta o diretorio com o nome salvo no banco
      const ProductAvatarFilePath = path.join(
        uploadConfig.directory,
        product.avatar,
      );
      const productAvatarFileExists = await fs.promises.stat(
        ProductAvatarFilePath,
      );

      if (productAvatarFileExists) {
        //Remove arquivo duplicado, caso existir
        await fs.promises.unlink(ProductAvatarFilePath);
      }

      product.avatar = avatarFileName;
      await productRepository.save(product);
    }
    return product;
  }
}

export default UpdateAvatarProductServce;
