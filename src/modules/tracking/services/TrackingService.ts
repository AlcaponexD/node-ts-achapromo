import { getCustomRepository } from 'typeorm';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import Product from '../../products/typeorm/entities/Product';

interface ITrackingResponse {
  tracking_url: string;
  original_url: string;
}

class TrackingService {
  public async generateTrackingUrl(
    product_id: string,
  ): Promise<ITrackingResponse> {
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne(product_id);

    if (!product) {
      throw new Error('Product not found');
    }

    const tracking_id = uuidv4();
    const tracking_url = `${process.env.URL_APP}/track/${tracking_id}?product=${product_id}`;

    return {
      tracking_url,
      original_url: product.url,
    };
  }

  public async trackClick(
    tracking_id: string,
    product_id: string,
  ): Promise<void> {
    const productRepository = getRepository(Product);
    const product = await productRepository.findOne(product_id);

    if (!product) {
      throw new Error('Product not found');
    }

    // Here you can implement click tracking logic
    // For example, saving to a clicks table with timestamp and other relevant data

    // For now, we'll just return the original URL
    return;
  }
}

export default TrackingService;
