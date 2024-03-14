import path, { parse } from 'path';
import puppeteer from 'puppeteer';
import uploadConfig from '../../config/upload';
import helpers from '../utils/helpers';
import UsersRepository from '../users/typeorm/repositories/UsersRepository';
import StoreRepository from '../stores/typeorm/repository/StoreRepository';
import { publishedEnum } from '../stores/typeorm/entities/Store';
import { DeepPartial, getCustomRepository } from 'typeorm';
import ProductRepository from '../products/typeorm/repository/ProductRepository';
import Product, { InReviewEnum } from '../products/typeorm/entities/Product';
import CategoryRepository from '../categories/repository/CategoryRepository';
class Terabyte {
  public async run(url: string) {
    //Abre o navegador
    const browser = await puppeteer.launch({
      headless: 'new',
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    //Nova guia2
    const page = await browser.newPage();

    //Bypass checking browser cloudflare
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en',
    });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    );

    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    //await page.waitFor(10000);
    const FilePath = path.join(uploadConfig.directory, 'terabyte.png');
    await page.screenshot({ path: FilePath });

    const elemento = await page.$('.wrap-prod-destaque');

    //tit-prod
    const title = await page.evaluate(element => {
      const elementoValVista = element?.querySelector('.tit-prod');
      return elementoValVista?.textContent;
    }, elemento);

    const raw_price = await page.evaluate(element => {
      const elementoValVista = element?.querySelector('#valVista');
      return elementoValVista?.textContent;
    }, elemento);

    let price;
    if (raw_price) {
      price = helpers.string_to_number(raw_price);
    }

    const img_url = await page.evaluate((element: any) => {
      const elementoValVista = element.querySelector(
        '[data-caption="imagem produto"]',
      ).src;
      return elementoValVista;
    }, elemento);

    let avatar;
    if (img_url) {
      avatar = await uploadConfig.uploadFromUrlImage(img_url);
    }

    const category_name = await page.evaluate(() => {
      let cats = undefined;

      const nodeList = document.querySelectorAll(
        '[itemprop="itemListElement"]',
      );
      nodeList.forEach((node: any, key: any) => {
        if (key == nodeList.length - 1) {
          const item = node.querySelector('[itemprop="item"]')?.innerText;
          cats = item;
        }
      });

      return cats;
    }, elemento);

    await browser.close();

    return {
      title,
      price,
      img_url,
      category_name,
      avatar,
    };
  }
  public async getCategory(category: string) {
    const terabyte = `https://www.terabyteshop.com.br`;
    //Get user_id
    const userService = getCustomRepository(UsersRepository);
    const user = await userService.findByEmail('jeison.contas@gmail.com');

    if (!user) {
      return false;
    }

    //Product repository
    const productRepository = getCustomRepository(ProductRepository);

    //Get Store_id
    const storeRepository = getCustomRepository(StoreRepository);
    let store = await storeRepository.findByUrl(terabyte);

    if (!store) {
      //Create a new store
      store = storeRepository.create({
        title: 'terabyte.com.br',
        url: terabyte,
        avatar: '',
        published: publishedEnum.Option2,
      });

      await storeRepository.save(store);
    }

    //Get category or create a new category

    const categoryRepository = getCustomRepository(CategoryRepository);
    let _category = await categoryRepository.findByName(category);
    if (!_category) {
      _category = categoryRepository.create({
        title: category,
        published: publishedEnum.Option2,
        slug: helpers.slug(category),
      });

      await categoryRepository.save(_category);
    }

    const url = `${terabyte}/hardware/${category}`;
    //Abre o navegador
    const browser = await puppeteer.launch({
      headless: 'new',
      //executablePath: '/usr/bin/chromium-browser',
      //args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    //Nova guia2
    const page = await browser.newPage();

    //Bypass checking browser cloudflare
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en',
    });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
    );

    await page.goto(url);
    await page.setViewport({ width: 1080, height: 1024 });

    //await page.waitFor(10000);
    const FilePath = path.join(uploadConfig.directory, `${category}.png`);
    await page.screenshot({ path: FilePath });

    //Verify if have an modal
    try {
      await page.click('[data-dismiss="modal"]');
    } catch (error) {
      console.log(error);
    }

    const elements = await page.$$('.pbox');
    const products = [];

    for (const element of elements) {
      const text = await element.evaluate(node => {
        return node.querySelector('.prod-name')?.textContent;
      });
      if (!text) {
        continue;
      }

      let price = await element.evaluate(node => {
        if (node.querySelector('.prod-new-price')) {
          return node.querySelector('.prod-new-price > span')?.textContent;
        }
      });

      if (price) {
        price = helpers.string_to_number(price);
        let image = await element.evaluate(node => {
          const imgElement = node.querySelector(
            '.commerce_columns_item_image > img',
          );
          return imgElement ? imgElement.src : null;
        });

        if (image) {
          image = await uploadConfig.uploadFromUrlImage(image);
        }

        //commerce_columns_item_image
        const url = await element.evaluate(node => {
          return node
            .querySelector('.commerce_columns_item_image')
            ?.getAttribute('href');
        });

        if (!url) {
          continue;
        }

        const product = productRepository.create({
          title: text,
          price: parseInt(price),
          avatar: image,
          category: _category,
          url,
          description: '',
          published: publishedEnum.Option2,
          in_review: InReviewEnum.Option2,
          user: user,
          store: store,
          stars: 0,
        });

        products.push(product);
      }
    }

    await browser.close();

    //loop products to save on db
    for (const product of products) {
      await productRepository.save(product);
    }
    return products;
  }
}

export default Terabyte;
