import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedInitialData1773774136583 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Seed Currencies
        await queryRunner.query(`
            INSERT INTO "fx"."currencies" (code, name, symbol, is_funding_currency, is_active) VALUES
            ('NGN', 'Nigerian Naira', '₦', true, true),
            ('USD', 'US Dollar', '$', true, true),
            ('GBP', 'British Pound', '£', false, true),
            ('EUR', 'Euro', '€', false, true);
        `);

        // 2. Seed Admin User (Admin@123)
        const adminId = '00000000-0000-0000-0000-000000000001';
        await queryRunner.query(`
            INSERT INTO "iam"."iam_users" (id, email, password_hash, role, is_email_verified, is_verified, account_status)
            VALUES ('${adminId}', 'admin@fx.com', '$2b$10$OFuS/6fIXcsWVT1B3Xd3Q.AkIjgmAWXjy.6ftxQw5ptEWaiewszK6', 'ADMIN', true, true, 'ACTIVE');
        `);
        await queryRunner.query(`
            INSERT INTO "account"."admin_profiles" (iam_user_id, department, employee_id)
            VALUES ('${adminId}', 'Management', 'ADM-001');
        `);

        // 3. Seed Regular User (User@123)
        const userId = '00000000-0000-0000-0000-000000000002';
        await queryRunner.query(`
            INSERT INTO "iam"."iam_users" (id, email, password_hash, role, is_email_verified, is_verified, account_status)
            VALUES ('${userId}', 'user@fx.com', '$2b$10$sJvYzjDPfDy1d3s76fHkq.hc4hdLhl/omhiLRvNNNmNI9/yOQRIYS', 'USER', true, true, 'ACTIVE');
        `);
        await queryRunner.query(`
            INSERT INTO "account"."user_profiles" (iam_user_id, display_name, kyc_status)
            VALUES ('${userId}', 'John Doe', 'VERIFIED');
        `);

        // 4. Create Wallet and Balance for User
        await queryRunner.query(`
            INSERT INTO "wallet"."wallets" (iam_user_id) VALUES ('${userId}');
        `);
        await queryRunner.query(` 
            INSERT INTO "wallet"."wallet_balances" (wallet_id, currency_code, balance)
            VALUES ('${userId}', 'NGN', 1000);
        `);
        // 5. Seed Currency Pairs
        await queryRunner.query(`
            INSERT INTO "fx"."currency_pairs" (base_currency_code, quote_currency_code, is_active, added_by_admin_id) VALUES
            ('USD', 'NGN', true, '${adminId}'),
            ('GBP', 'NGN', true, '${adminId}'),
            ('EUR', 'NGN', true, '${adminId}');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "fx"."currency_pairs"`);
        await queryRunner.query(`DELETE FROM "wallet"."wallet_balances"`);
        await queryRunner.query(`DELETE FROM "wallet"."wallets"`);
        await queryRunner.query(`DELETE FROM "account"."user_profiles"`);
        await queryRunner.query(`DELETE FROM "account"."admin_profiles"`);
        await queryRunner.query(`DELETE FROM "iam"."iam_users"`);
        await queryRunner.query(`DELETE FROM "fx"."currencies"`);
    }

}
