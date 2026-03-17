import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchemas1773742154497 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS iam`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS account`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS wallet`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS fx`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS trading`);
    await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS audit`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SCHEMA IF EXISTS iam`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS account`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS wallet`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS fx`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS trading`);
    await queryRunner.query(`DROP SCHEMA IF EXISTS audit`);
  }
}
