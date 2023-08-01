import multer from 'multer';
import path from 'path';
import cryto from 'crypto';
import fs from 'fs';
import sharp from 'sharp';
import puppeteer from 'puppeteer';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');
const uploadMulterStorage = multer.diskStorage({
  destination: uploadFolder,
  filename(request, file, callback) {
    const fileHash = cryto.randomBytes(10).toString('hex');
    const fileName = `${fileHash}-${file.originalname}`;

    callback(null, fileName);
  },
});

export default {
  directory: uploadFolder,
  storage: uploadMulterStorage,
  uploadFromUrlImage: async (url: string) => {
    const browser = await puppeteer.launch({
      // headless: 'new',
      // executablePath: '/usr/bin/chromium-browser',
      // args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
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
    const buffer = await page.screenshot({ fullPage: true });
    await browser.close();

    //const timestamp = Date.now();
    //const imageExtension = path.extname(url);
    const imageName = path.basename(url);
    //const imageExtension = path.extname(url);

    const avatarFileName = `${imageName}`;

    const productAvatarFilePath = path.join(uploadFolder, avatarFileName);

    try {
      // Verifica se o arquivo do avatar do produto já existe
      await fs.promises.access(productAvatarFilePath);

      // Remove o arquivo existente
      await fs.promises.unlink(productAvatarFilePath);
    } catch (error) {
      // O arquivo do avatar do produto não existe
    }
    // Comprime a imagem para reduzir o tamanho
    const compressedBuffer = await sharp(buffer)
      .jpeg({ quality: 80 }) // Ajuste a qualidade conforme necessário
      .toBuffer();
    // Salva o novo arquivo do avatar do produto
    await fs.promises.writeFile(productAvatarFilePath, compressedBuffer);

    console.log('Download e remoção de arquivo concluídos com sucesso!');
    return avatarFileName;
  },
};
