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
import { json } from 'stream/consumers';
import ProductHistory from '../typeorm/entities/ProductHistory';
import ProductHistoryRepository from '../typeorm/repository/ProductHistoryRepository';

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

interface IProductHistory {
  price: number;
  product_id: string;
}

export default class CreateProductService {
  public async getCategory(title: string): Promise<Category | undefined> {
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

  private storeName(url: string): string {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    return domain;
  }

  private async getStore(url: string): Promise<Store | undefined> {
    const storeRepository = getCustomRepository(StoreRepository);
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname;
    const store = await storeRepository.findByUrl(domain);
    if (!store) {
      throw new AppError('Loja não encontrada');
    }

    return store;
  }

  public async processProduct(
    store: string,
    url: string,
  ): Promise<object | boolean> {
    //mock
    const storeList: Record<string, any> = {
      terabyteshop: async (url: string) => {
        const terabyte = new Terabyte();
        return terabyte.run(url);
      },
    };

    try {
      return await storeList[store](url);
    } catch (e) {
      return false;
    }
  }

  public async execute(data: IRequest): Promise<any> {
    const productRepository = getCustomRepository(ProductRepository);
    // const productExists = await productRepository.findByUrl(data.url);
    // if (productExists) {
    //   throw new AppError('Produto já existente');
    // }

    data.published = publishedEnum.Option1;
    data.in_review = InReviewEnum.Option2;

    const store = await this.getStore(data.url);
    const storeName = this.storeName(data.url);
    if (!store || !storeName) {
      throw new AppError('Loja não encontrada', 404);
    }
    //Mock pra loja
    const dataProductCrawler = {}; //await this.processProduct(storeName, data.url);
    const jsonFinal = Object.assign({}, data, dataProductCrawler);
    if (
      !jsonFinal.title &&
      !jsonFinal.price &&
      !jsonFinal.avatar &&
      !jsonFinal.category_name
    ) {
      throw new AppError('Preencha manualmente o novo produto', 422);
    }

    //Nao deixa preço menor que 1
    if (jsonFinal.price && jsonFinal.price < 1) {
      throw new AppError('Preço inválido', 422);
    }

    jsonFinal.store = store;

    //Get Category
    jsonFinal.category = await this.getCategory(jsonFinal.category_name);

    //Get product by url
    const productExists = await productRepository.findByUrl(data.url);

    if (productExists && data.price) {
      //Verifica se cria ou atualiza o preço do mesmo na tabela de histórico
      const productHistoryRepository = getCustomRepository(
        ProductHistoryRepository,
      );
      const jsonHistory: IProductHistory = {
        product_id: productExists.id,
        price: data.price,
      };

      const history = productHistoryRepository.create(jsonHistory);
      await productHistoryRepository.save(history);

      //update product price
      productExists.price = data.price;
      productExists.published = publishedEnum.Option2;
      if (!data.price) {
        productExists.published = publishedEnum.Option1;
      }
      await productRepository.save(productExists);

      return productExists;
    }

    const product = productRepository.create(jsonFinal);
    await productRepository.save(product);

    return product;
  }
}
