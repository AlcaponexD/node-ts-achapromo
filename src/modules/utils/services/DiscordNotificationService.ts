import { getCustomRepository } from 'typeorm';
import axios from 'axios';
import ProductsRepository from '../../products/typeorm/repository/ProductRepository';
import { product } from '../../products/interfaces/ProductListResponse';

class DiscordNotificationService {
  public async execute(): Promise<void> {
    const productsRepository = getCustomRepository(ProductsRepository);
    const page = 1;
    const perPage = 10;

    const discountedProducts = await productsRepository.findTops(page, perPage);

    if (!discountedProducts || discountedProducts.products.length === 0) return;

    const webhookUrl = process.env.WEBHOOK_DISCORD;
    if (!webhookUrl) {
      console.error('Discord webhook URL not configured');
      return;
    }

    const embed = {
      title: '🔥 Produtos com Maiores Descontos',
      color: 0xff0000,
      fields: discountedProducts.products.map((product: product) => {
        return {
          name: product.title,
          value: `💰 R$ ${product.price}
📉 Desconto: ${product.discount_percentage?.toFixed(2)}%
🏪 Loja: ${product.store.title}
🔗 [Ver Produto](${product.url})`,
          inline: false,
        };
      }),
      timestamp: new Date().toISOString(),
    };

    try {
      await axios.post(webhookUrl, { embeds: [embed] });
      console.log(
        `Sent ${discountedProducts.products.length} products to Discord webhook`,
      );
    } catch (error) {
      console.error('Failed to send Discord webhook:', error);
    }
  }
}

export default DiscordNotificationService;
