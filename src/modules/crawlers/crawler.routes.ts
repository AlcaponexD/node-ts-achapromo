import { Router } from 'express';
import Terabyte from './Terabyte';
import Pelando from './Pelando';

const crawlerRouter = Router();

crawlerRouter.get('/terabyte/processadores', async (req, res) => {
  const terabyte = new Terabyte();
  const result = await terabyte.getCategory('processadores');
  return res.json({
    result,
  });
});

crawlerRouter.get('/pelando', (req, res) => {
  const pelando = new Pelando();
  const result = pelando.more_hots();

  res.json({
    result,
  });
});

export default crawlerRouter;
