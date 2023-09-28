import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddProductIdToComments1695914762241 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a nova coluna "category_id" à tabela "products"
    await queryRunner.addColumn(
      'comments',
      new TableColumn({
        name: 'product_id',
        type: 'uuid',
      }),
    );

    // Cria uma nova chave estrangeira (FK) na coluna "product_id" da tabela "products",
    // referenciando a coluna "id" da tabela "categories"
    await queryRunner.createForeignKey(
      'comments',
      new TableForeignKey({
        columnNames: ['product_id'],
        referencedTableName: 'products',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE', // Define o comportamento de exclusão em cascata
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a chave estrangeira (FK) da coluna "product_id" da tabela "products"
    await queryRunner.dropForeignKey(
      'comments',
      'FK_8f405e50bbc3adb9a80fac0f928',
    );

    // Remove a coluna "product_id" da tabela "store"
    await queryRunner.dropColumn('comments', 'product_id');
  }
}
