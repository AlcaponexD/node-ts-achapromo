import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddURLCollumnToStore1684926319551 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE stores ADD COLUMN url varchar(255)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE stores DROP COLUMN url');
  }
}
