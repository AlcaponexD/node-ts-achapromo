import path from 'path';
import puppeteer from 'puppeteer';
import uploadConfig from '../../config/upload';
import helpers from '../utils/helpers';
class Terabyte {
  public async run(url: string) {
    //Abre o navegador
    const browser = await puppeteer.launch({ headless: false });

    //Nova guia
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
      const elementoValVista = element?.querySelector(
        '.fotorama__thumb.fotorama__loaded.fotorama__loaded--img > img',
      );
      return elementoValVista?.src;
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
}

export default Terabyte;
