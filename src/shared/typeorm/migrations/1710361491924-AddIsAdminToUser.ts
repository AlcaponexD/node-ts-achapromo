import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddIsAdminToUser1710361491924 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'is_admin',
        type: 'enum',
        enum: ['yes', 'no'],
        default: `'no'`,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'is_admin');
  }
}
