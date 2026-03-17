import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedInitialFxData1773759126356 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Seed Currencies
    await queryRunner.query(`
      INSERT INTO "fx"."currencies" (code, name, symbol, is_funding_currency) VALUES
      ('NGN', 'Nigerian Naira', '₦', true),
      ('USD', 'United States Dollar', '$', false),
      ('EUR', 'Euro', '€', false),
      ('GBP', 'British Pound', '£', false)
      ON CONFLICT (code) DO NOTHING;
    `);

    // 2. Seed Initial Pairs (NGN -> Others and Others -> NGN)
    await queryRunner.query(`
      INSERT INTO "fx"."currency_pairs" (base_currency_code, quote_currency_code) VALUES
      ('NGN', 'USD'),
      ('USD', 'NGN'),
      ('NGN', 'EUR'),
      ('EUR', 'NGN'),
      ('NGN', 'GBP'),
      ('GBP', 'NGN')
      ON CONFLICT (base_currency_code, quote_currency_code) DO NOTHING;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clean up seeded data
    await queryRunner.query(`DELETE FROM "fx"."currency_pairs" WHERE base_currency_code IN ('NGN', 'USD', 'EUR', 'GBP') AND quote_currency_code IN ('NGN', 'USD', 'EUR', 'GBP');`);
    await queryRunner.query(`DELETE FROM "fx"."currencies" WHERE code IN ('NGN', 'USD', 'EUR', 'GBP');`);
  }
}
