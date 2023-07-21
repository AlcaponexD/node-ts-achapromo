import { getCustomRepository } from 'typeorm';
import { InReviewEnum, publishedEnum } from '../typeorm/entities/Product';
import ProductRepository from '../typeorm/repository/ProductRepository';
import User from '../../../modules/users/typeorm/entities/User';
import Store from '../../../modules/stores/typeorm/entities/Store';
import { Category } from '../../../modules/categories/typeorm/entities/Category';
import CategoryRepository from '../../../modules/categories/repository/CategoryRepository';
import helpers from '../../../modules/utils/helpers';
import StoreRepository from '../../../modules/stores/typeorm/repository/StoreRepository';
import AppError from '../../../shared/errors/AppError';
import Terabyte from '../../../modules/crawlers/Terabyte';

interface IRequest {
  url: string;
  title?: string;
  price?: number;
  avatar?: string;
  description?: string;
  user?: User;
  store?: Store;
  category?: Category;
  published?: publishedEnum;
  in_review?: InReviewEnum;
  category_name: string;
}

export default class CreateProductService {
  private async getCategory(title: string): Promise<Category | undefined> {
    const categoryRepository = getCustomRepository(CategoryRepository);
    const category_exists = await categoryRepository.findByName(title);
    if (category_exists) {
      return category_exists;
    }
    const category = await categoryRepository.create({
      title: title,
      published: publishedEnum.Option2,
      slug: helpers.slug(title),
    });

    categoryRepository.save(category);

    return category;
  }

  private async getStore(url: string): Promise<Store | undefined> {
    const storeRepository = getCustomRepository(StoreRepository);
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const store = await storeRepository.findByUrl(domain);
    if (!store) {
      throw new AppError('Store not found');
    }

    return store;
  }

  public async processProduct(store: string, url: string): Promise<object> {
    //mock
    const storeList: Record<string, any> = {
      terabyte: async (url: string) => {
        const terabyte = new Terabyte();
        return terabyte.run(url);
      },
    };

    return await storeList[store](url);
  }

  public async execute(data: IRequest): Promise<any> {
    const productRepository = getCustomRepository(ProductRepository);
    const productExists = await productRepository.findByUrl(data.url);
    if (productExists) {
      throw new AppError('Product exists with the url');
    }

    data.published = publishedEnum.Option1;
    data.in_review = InReviewEnum.Option1;

    //Mock pra loja
    const dataProductCrawler = await this.processProduct('terabyte', data.url);

    const jsonFinal = Object.assign({}, data, dataProductCrawler);
    const store = await this.getStore(data.url);
    if (!store) {
      throw new AppError('Store not found', 404);
    }

    if (
      !jsonFinal.title &&
      !jsonFinal.price &&
      !jsonFinal.avatar &&
      !jsonFinal.price &&
      !jsonFinal.category_name
    ) {
      throw new AppError('Send all inputs', 422);
    }

    jsonFinal.store = store;

    //Get Category
    jsonFinal.category = await this.getCategory(jsonFinal.category_name);

    const product = productRepository.create(jsonFinal);
    await productRepository.save(product);

    return product;
  }
}
