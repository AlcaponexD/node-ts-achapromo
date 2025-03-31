import { getCustomRepository } from 'typeorm';
import ProductRepository from '../../../modules/products/typeorm/repository/ProductRepository';
import ProductHistoryRepository from '../../../modules/products/typeorm/repository/ProductHistoryRepository';

class UpdateProductDiscountsService {
  private readonly BATCH_SIZE = 100;

  public async execute(): Promise<void> {
    const productRepository = getCustomRepository(ProductRepository);
    const productHistoryRepository = getCustomRepository(
      ProductHistoryRepository,
    );

    // Busca o total de produtos
    const totalProducts = await productRepository.count();
    let processed = 0;

    console.log(
      `Iniciando atualização de descontos para ${totalProducts} produtos`,
    );

    // Processa em lotes menores
    while (processed < totalProducts) {
      console.log(
        `Processando lote ${processed + 1} a ${Math.min(
          processed + this.BATCH_SIZE,
          totalProducts,
        )}`,
      );

      const products = await productRepository.find({
        skip: processed,
        take: this.BATCH_SIZE,
      });

      for (const product of products) {
        // Busca o histórico do produto ordenado por data decrescente
        const histories = await productHistoryRepository.find({
          where: { product_id: product.id },
          order: { created_at: 'DESC' },
        });

        // Se tiver pelo menos 2 históricos, podemos calcular o desconto
        if (histories.length >= 2) {
          const penultimoPreco = histories[1].price;
          const precoAtual = product.price;

          // Calcula o desconto
          let discount = 0;
          if (precoAtual < penultimoPreco) {
            discount = ((penultimoPreco - precoAtual) / penultimoPreco) * 100;
            // Arredonda o desconto para número inteiro
            discount = Math.round(discount);
          }

          // Atualiza o desconto do produto
          await productRepository.update(product.id, {
            discount: discount,
          });
        } else {
          // Se não tiver histórico suficiente, define desconto como 0
          await productRepository.update(product.id, {
            discount: 0,
          });
        }

        processed += products.length;
        console.log(
          `Lote concluído: ${processed}/${totalProducts} produtos processados`,
        );
      }

      console.log('Atualização de descontos concluída com sucesso!');
    }
  }
}

export default UpdateProductDiscountsService;
