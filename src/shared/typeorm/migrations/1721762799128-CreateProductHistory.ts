import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateProductHistory1721762799128 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'product_histories',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },

          {
            name: 'product_id',
            type: 'uuid',
          },
          {
            name: 'price',
            type: 'int',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            name: 'ProductHistory',
            referencedTableName: 'products',
            referencedColumnNames: ['id'],
            columnNames: ['product_id'],
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('product_histories');
  }
}
