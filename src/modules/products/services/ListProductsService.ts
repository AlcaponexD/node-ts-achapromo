import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import AppError from '@shared/errors/AppError';

interface IProductResponse {
  title: string;
  url: string;
  avatar: string;
  price: string;
  description?: string;
  classification?: string;
  store: string;
  user: string;
  category: string;
}
export default class ListProductService {
  public async recommends(): Promise<any> {
    const productRepository = getCustomRepository(ProductRepository);
    const products = await productRepository.findRecommends();
    return products;
  }
}
