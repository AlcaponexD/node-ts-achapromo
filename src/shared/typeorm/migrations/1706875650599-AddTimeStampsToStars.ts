import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTimeStampsToStars1706875650599 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'product_stars',
      new TableColumn({
        name: 'created_at',
        type: 'timestamp',
        default: 'now()', // Valor padrão, se aplicável
      }),
    );

    await queryRunner.addColumn(
      'product_stars',
      new TableColumn({
        name: 'updated_at',
        type: 'timestamp',
        default: 'now()', // Valor padrão, se aplicável
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('stars', 'created_at');
    await queryRunner.dropColumn('stars', 'updated_at');
  }
}
