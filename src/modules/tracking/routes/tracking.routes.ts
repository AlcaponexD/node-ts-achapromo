import { Router } from 'express';
import TrackingController from '../controllers/TrackingController';

const trackingRouter = Router();
const trackingController = new TrackingController();

trackingRouter.get('/track/:tracking_id', trackingController.handleClick);
trackingRouter.get(
  '/tracking/:product_id',
  trackingController.generateTrackingUrl,
);

export default trackingRouter;
