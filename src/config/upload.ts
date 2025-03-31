import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import logger from '../../logger';

const uploadFolder = path.resolve(__dirname, '..', '..', 'uploads');

const uploadFolderProduct = path.resolve(
  __dirname,
  '..',
  '..',
  'uploads/products',
);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const dt = new Date();
    const fullFileName = `${dt.getTime()} ${path.extname(file.originalname)}`;
    cb(null, fullFileName);
  },
});

const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatar');
  },
  filename: function (req, file, cb) {
    const dt = new Date();
    const fullFileName = `${dt.getTime()} ${path.extname(file.originalname)}`;
    cb(null, fullFileName);
  },
});

const product_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/products/');
  },
  filename: function (req, file, cb) {
    const dt = new Date();
    const fullFileName = `product-${dt.getTime()}${path.extname(
      file.originalname,
    )}`;
    cb(null, fullFileName);
  },
});

const resizeProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({
        error: true,
        message: 'Nenhuma imagem foi enviada.',
      });
    }

    const originalImagePath = uploadedFile.path;
    const dt = new Date();
    const originalImageName = `product-thumb-${dt.getTime()}${path.extname(
      uploadedFile.originalname,
    )}`;

    const productsFolder = path.join(uploadFolder, 'products');
    const convertedImagePath = path.join(productsFolder, originalImageName);

    logger.error({
      error: 1,
      convertedImagePath: convertedImagePath,
    });

    logger.error({ message: 'Antes da operação sharp' });

    // try {
    //   await sharp(originalImagePath)
    //     .resize(300, 300)
    //     .toFile(convertedImagePath);
    // } catch (error) {
    //   logger.error(error);
    //   return next(error);
    // }

    logger.error({ message: 'Após a operação sharp' });

    uploadedFile.path = convertedImagePath;
    fs.unlinkSync(originalImagePath);

    logger.error({
      error: 2,
      re: req.file,
      originalImageName: originalImageName,
    });

    if (req.file) {
      req.file.filename = originalImageName;
    }

    next();
  } catch (error) {
    logger.error(error);
    next(error);
  }
};

const processProductImage = async (imageName: string): Promise<string> => {
  const productsFolder = path.join(uploadFolder, 'products');
  const convertedImagePath = path.join(productsFolder, imageName);

  try {
    // Verifica se o arquivo do avatar do produto já existe
    await fs.promises.access(convertedImagePath);
    // Remove o arquivo existente
    await fs.promises.unlink(convertedImagePath);
  } catch (error) {
    logger.error(error);
    // O arquivo do avatar do produto não existe
  }

  // Comprime a imagem para reduzir o tamanho
  // const compressedBuffer = await sharp(buffer)
  //   .resize(200, 200)
  //   .jpeg({ quality: 80 }) // Ajuste a qualidade conforme necessário
  //   .toBuffer();
  // // Salva o novo arquivo do avatar do produto
  // await fs.promises.writeFile(convertedImagePath, compressedBuffer);

  console.log('Download e remoção de arquivo concluídos com sucesso!');
  return imageName;
};

export default {
  directory: uploadFolder,
  directoryProduct: uploadFolderProduct,
  storage: multer({ storage }),
  avatar_storage: multer({ storage: avatarStorage }),
  product_storage: multer({ storage: product_storage }),
  processProductImage,
  resizeProductImage,
};
