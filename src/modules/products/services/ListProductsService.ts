import { getCustomRepository } from 'typeorm';
import ProductRepository from '../typeorm/repository/ProductRepository';
import {
  iProductListResponse,
  product as iProduct,
} from '../interfaces/ProductListResponse';
import iShowProductResponse from '../interfaces/ShowProductResponse';
import AppError from '@shared/errors/AppError';
import iProductSearchListResponse from '../interfaces/SearchProductResponse';
import { InReviewEnum, publishedEnum } from '../typeorm/entities/Product';
import iProductRecommendResponse from '../interfaces/MyProductsResponse';
import Iquery from '../interfaces/QueryPaginationRequest';
import CacheService from '../../utils/cache';

export default class ListProductService {
  public async recommends(
    page: number,
    per_page: number,
  ): Promise<iProductListResponse | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const _products = await productRepository.findRecommends(page, per_page);
    return _products;
  }

  //TODO Implements search https://stackoverflow.com/questions/53922503/how-to-implement-pagination-in-nestjs-with-typeorm
  public async search(
    query: Iquery,
  ): Promise<iProductListResponse | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const results = await productRepository.searchProducts(query);
    if (!results) {
      throw new AppError('Nenhum resultado encontrado', 404);
    }

    const products = results.products?.map(product => {
      return product;
    });

    return {
      products: products,
      total: results.total,
      next_page: results.next_page,
    };
  }

  public async topProducts(page: number, perPage: number) {
    const cacheKey = `tops_${page}_${perPage}`;
    const cache = await CacheService.get(cacheKey);

    if (cache) {
      return cache;
    }

    const productRepository = getCustomRepository(ProductRepository);
    const top = await productRepository.findTops(page, perPage);

    // Cache the results for 12 hours
    await CacheService.set(cacheKey, top);

    return top;
  }
  public async newsProducts(page: number, perPage: number) {
    const productRepository = getCustomRepository(ProductRepository);
    const products = await productRepository.findNews(page, perPage);
    return products;
  }

  public async productById(
    id: string,
  ): Promise<iShowProductResponse | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const product = await productRepository.findProductById(id);
    if (product) {
      // eslint-disable-next-line no-self-assign
      product.avatar = product.avatar;
      if (product.user.avatar) {
        product.user.avatar =
          process.env.URL_APP + '/files/avatar/' + product.user.avatar;
      }
      product.comments = product.comments.map(comment => {
        if (comment.user.avatar) {
          comment.user.avatar =
            process.env.URL_APP + '/files/avatar/' + comment.user.avatar;
        }
        return comment;
      });
    }

    return product;
  }
  public async productByUserLogged(
    id: string,
  ): Promise<iProductRecommendResponse[] | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const products = await productRepository.findMyProductsSended(id);
    products?.map(product => {
      // eslint-disable-next-line no-self-assign
      product.avatar = product.avatar;
    });
    return products;
  }

  public async productInReview(): Promise<iProduct[] | undefined> {
    const productRepository = getCustomRepository(ProductRepository);
    const products = await productRepository.findProductsInReview();
    products?.map(product => {
      // eslint-disable-next-line no-self-assign
      product.avatar = product.avatar;
    });
    return products;
  }

  public async moderateProduct(id: string, action: string): Promise<iProduct> {
    const productRepository = getCustomRepository(ProductRepository);
    const product = await productRepository.findOneOrFail(id);
    if (!product) {
      throw new AppError('Produto não encontrado', 404);
    }

    if (action == 'approved') {
      product.in_review = InReviewEnum.Option1;
    } else {
      product.published = publishedEnum.Option1;
    }
    await productRepository.save(product);
    return product;
  }
}
