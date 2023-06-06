import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddCategoryIdToStore1686009071714 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Adiciona a nova coluna "category_id" à tabela "products"
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Cria uma nova chave estrangeira (FK) na coluna "category_id" da tabela "products",
    // referenciando a coluna "id" da tabela "categories"
    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL', // Define o comportamento de exclusão em cascata
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove a chave estrangeira (FK) da coluna "category_id" da tabela "products"
    await queryRunner.dropForeignKey('products', 'FK_Store_Category');

    // Remove a coluna "category_id" da tabela "store"
    await queryRunner.dropColumn('products', 'category_id');
  }
}
