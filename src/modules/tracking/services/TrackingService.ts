import { getCustomRepository } from 'typeorm';
import { getRepository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import Product from '../../products/typeorm/entities/Product';
import StoreRepository from '@modules/stores/typeorm/repository/StoreRepository';

interface ITrackingResponse {
  tracking_url: string;
  original_url: string;
}

class TrackingService {
  private async afiliatedLink(link: string, store_id: string): Promise<string> {
    //Get the store with store_id
    const storeRepository = getCustomRepository(StoreRepository);
    const store = await storeRepository.findOne(store_id);

    if (store) {
      //Get the store link
      const storeLink = store.title.toLowerCase();

      //Afliated amz
      if (storeLink == 'amazon') {
        return `${link}?tag=achapromo00-20`;
      }

      //Kabum affiliate via Awin
      if (storeLink === 'kabum') {
        return `https://www.awin1.com/cread.php?awinmid=17729&awinaffid=1959555&ued=${encodeURIComponent(
          link,
        )}`;
      }
    }

    return link;
  }

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
      original_url: await this.afiliatedLink(product.url, product.store_id),
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
