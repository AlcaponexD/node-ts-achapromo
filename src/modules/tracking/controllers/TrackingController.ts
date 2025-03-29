import { Request, Response } from 'express';
import TrackingService from '../services/TrackingService';
import { getRepository } from 'typeorm';
import Click from '../typeorm/entities/Click';

class TrackingController {
  public async generateTrackingUrl(
    request: Request,
    response: Response,
  ): Promise<Response> {
    const { product_id } = request.params;
    const trackingService = new TrackingService();

    const trackingResponse = await trackingService.generateTrackingUrl(
      product_id,
    );

    return response.json(trackingResponse);
  }

  public async handleClick(request: Request, response: Response) {
    const { tracking_id } = request.params;
    const { product } = request.query;
    const product_id = product as string;

    const clickRepository = getRepository(Click);
    const trackingService = new TrackingService();

    // Save click data
    const click = clickRepository.create({
      tracking_id,
      product_id,
      user_agent: request.headers['user-agent'],
      ip_address: request.ip,
      referer: request.headers.referer,
    });

    await clickRepository.save(click);

    // Get original URL and redirect
    const { original_url } = await trackingService.generateTrackingUrl(
      product_id,
    );

    return response.redirect(original_url);
  }
}

export default TrackingController;
