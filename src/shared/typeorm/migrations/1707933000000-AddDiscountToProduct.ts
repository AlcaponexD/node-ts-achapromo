import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddDiscountToProduct1707933000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'discount',
        type: 'integer',
        isNullable: true,
        default: 0,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'discount');
  }
}
