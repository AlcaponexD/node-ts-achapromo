import path from 'path';
import puppeteer from 'puppeteer';
import uploadConfig from '../../config/upload';
import helpers from '../utils/helpers';

class Pelando {
  public async more_hots() {
    //Abre o navegador
    const browser = await puppeteer.launch({
      headless: false,
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

    await page.goto('https://www.pelando.com.br/mais-quentes');
    await page.setViewport({ width: 1080, height: 1024 });

    //await page.waitFor(10000);
    const FilePath = path.join(uploadConfig.directory, 'pelando.png');

    try {
      const hide_expireds = await page.click('[role="switch"]');
      await page.waitForTimeout(3000);
      const open_filters = await page.click('[aria-label="Abrir filtro"]');
      const elementos = await page.$$('[aria-selected="false"]');

      for (const elemento of elementos) {
        const textoDoElemento = await page.evaluate(
          el => el.innerText,
          elemento,
        );
        if (textoDoElemento == 'Hoje') {
          elemento.click();
        }
      }

      await page.click('[aria-label="Fechar"]');
    } catch (error) {
      console.log(error);
    }

    await page.screenshot({ path: FilePath });

    try {
      await page.click('[aria-label="Fechar"]');
    } catch (error) {
      //console.log(error);
    }

    const elemento = await page.$('.sc-cb8be5d8-2 .hliMah');

    console.log(elemento?.innerHTML);
  }
}

export default Pelando;
