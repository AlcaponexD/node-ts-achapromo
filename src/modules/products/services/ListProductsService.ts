import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import iProductRecommendResponse from '../interfaces/ProductRecommendResponse';
import iShowProductResponse from '../interfaces/ShowProductResponse';

export default class ListProductService {
  public async recommends(): Promise<iProductRecommendResponse[] | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const _products = await productRepository.findRecommends();
    const products = _products?.map(product => {
      if (product.avatar) {
        product.avatar =
          process.env.URL_APP + '/files/products/' + product.avatar;
      }
      return product;
    });
    return products;
  }

  public async productById(
    id: string,
  ): Promise<iShowProductResponse | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const product = await productRepository.findProductById(id);
    if (product) {
      product.avatar =
        process.env.URL_APP + '/files/products/' + product.avatar;
    }
    return product;
  }
  public async productByUserLogged(id: string): Promise<any[] | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const products = await productRepository.findMyProductsSended(id);
    products?.map(product => {
      product.avatar =
        process.env.URL_APP + '/files/products/' + product.avatar;
    });
    return products;
  }
}
