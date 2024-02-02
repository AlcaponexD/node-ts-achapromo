import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddStarToProduct1706866383174 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'products',
      new TableColumn({
        name: 'stars',
        type: 'int',
        isNullable: false, // Ou true, dependendo se é obrigatório ou não
        default: 0, // Valor padrão, se aplicável
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('products', 'stars');
  }
}
