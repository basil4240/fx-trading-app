import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchemas1773774040817 implements MigrationInterface {
    name = 'InitSchemas1773774040817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "iam"."password_histories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "password_hash" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP, CONSTRAINT "PK_3b3ab30d6152c933113c9534442" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0773e3e1d5660057a283f3f08e" ON "iam"."password_histories" ("iam_user_id") `);
        await queryRunner.query(`CREATE TABLE "iam"."password_reset_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ab673f0e63eac966762155508ee" UNIQUE ("token"), CONSTRAINT "PK_d16bebd73e844c48bca50ff8d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ca189dae692453a9a1b62f6bd4" ON "iam"."password_reset_tokens" ("iam_user_id") `);
        await queryRunner.query(`CREATE TABLE "iam"."password_change_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "password_hash" character varying NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_89365d03d6df5fae31e957320c8" UNIQUE ("token"), CONSTRAINT "PK_b04b0679a5b14d0df095e735b5c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_79823fe27fde4e5372c00167a8" ON "iam"."password_change_tokens" ("iam_user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_89365d03d6df5fae31e957320c" ON "iam"."password_change_tokens" ("token") `);
        await queryRunner.query(`CREATE TABLE "iam"."email_verification_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3d1613f95c6a564a3b588d161ae" UNIQUE ("token"), CONSTRAINT "PK_417a095bbed21c2369a6a01ab9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_114448395d7cc91d62f1bdc685" ON "iam"."email_verification_tokens" ("iam_user_id") `);
        await queryRunner.query(`CREATE TYPE "account"."kyc_status" AS ENUM('NONE', 'PENDING', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "account"."user_profiles" ("iam_user_id" uuid NOT NULL, "display_name" character varying NOT NULL, "phone" character varying, "avatar_url" character varying, "kyc_status" "account"."kyc_status" NOT NULL DEFAULT 'NONE', "tier" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aae0ca4ad514cf6616554c8598d" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`CREATE TABLE "account"."admin_profiles" ("iam_user_id" uuid NOT NULL, "department" character varying NOT NULL, "employee_id" character varying NOT NULL, "permissions_scope" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2672d9214c4719615fa20e62c91" UNIQUE ("employee_id"), CONSTRAINT "PK_2e687af3d2244095612fa85a086" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`CREATE TYPE "iam"."role" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "iam"."auth_method" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'ANONYMOUS')`);
        await queryRunner.query(`CREATE TYPE "iam"."account_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION')`);
        await queryRunner.query(`CREATE TABLE "iam"."iam_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "iam"."role" NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "auth_method" "iam"."auth_method" NOT NULL DEFAULT 'EMAIL', "account_status" "iam"."account_status" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0692f810e8926469bec26da0d99" UNIQUE ("email"), CONSTRAINT "PK_02086c69f80fed8ae319ec498ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ec92d759102ed28ad43ba5932f" ON "iam"."iam_users" ("email", "role") `);
        await queryRunner.query(`CREATE TABLE "fx"."currencies" ("code" character varying(3) NOT NULL, "name" character varying NOT NULL, "symbol" character varying(5), "is_funding_currency" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f8d0972aeeb5a2277e40332d29" PRIMARY KEY ("code"))`);
        await queryRunner.query(`CREATE TABLE "fx"."currency_pairs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "base_currency_code" character varying NOT NULL, "quote_currency_code" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "added_by_admin_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dadf101ef21de770fa8dcfae1b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5bed3bceb361429f1a84ee81e6" ON "fx"."currency_pairs" ("base_currency_code", "quote_currency_code") `);
        await queryRunner.query(`CREATE TABLE "wallet"."wallets" ("iam_user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e4cfffa6c58328bf6ee28fc57" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`CREATE TABLE "wallet"."wallet_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_id" uuid NOT NULL, "currency_code" character varying NOT NULL, "balance" numeric(18,8) NOT NULL DEFAULT '0', "locked_balance" numeric(18,8) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eebe2c6f13f1a2de3457f8a885c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a1983bb22b30a57a62abdce0ef" ON "wallet"."wallet_balances" ("wallet_id", "currency_code") `);
        await queryRunner.query(`CREATE TYPE "wallet"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'reversed')`);
        await queryRunner.query(`CREATE TABLE "wallet"."funding_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_id" uuid NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "status" "wallet"."transaction_status" NOT NULL DEFAULT 'pending', "provider" character varying, "reference" character varying NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2896145976d2fd4040af0b6374d" UNIQUE ("reference"), CONSTRAINT "PK_369a4c0fd0d1a7b14ebd9fa8e1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "trading"."trade_status" AS ENUM('pending', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "trading"."trade_type" AS ENUM('CONVERSION', 'TRADE')`);
        await queryRunner.query(`CREATE TABLE "trading"."trades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "from_currency_code" character varying NOT NULL, "to_currency_code" character varying NOT NULL, "from_amount" numeric(18,8) NOT NULL, "to_amount" numeric(18,8) NOT NULL, "rate" numeric(18,8) NOT NULL, "fee" numeric(18,8) NOT NULL DEFAULT '0', "status" "trading"."trade_status" NOT NULL DEFAULT 'pending', "type" "trading"."trade_type" NOT NULL DEFAULT 'CONVERSION', "idempotency_key" character varying NOT NULL, "executed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e6726f1b49b0ec9a882ec66aba2" UNIQUE ("idempotency_key"), CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trading"."trade_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trade_id" uuid NOT NULL, "fee_type" character varying NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b7d754928a23b6a4c608d2e8c40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit"."ledger_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying NOT NULL, "action" character varying NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "balance_before" numeric(18,8) NOT NULL, "balance_after" numeric(18,8) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6efcb84411d3f08b08450ae75d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit"."audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid, "module" character varying NOT NULL, "action" character varying NOT NULL, "ip_address" character varying, "user_agent" character varying, "payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "iam"."password_histories" ADD CONSTRAINT "FK_0773e3e1d5660057a283f3f08e2" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."password_reset_tokens" ADD CONSTRAINT "FK_ca189dae692453a9a1b62f6bd4e" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."password_change_tokens" ADD CONSTRAINT "FK_79823fe27fde4e5372c00167a8b" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."email_verification_tokens" ADD CONSTRAINT "FK_114448395d7cc91d62f1bdc6855" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account"."user_profiles" ADD CONSTRAINT "FK_aae0ca4ad514cf6616554c8598d" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account"."admin_profiles" ADD CONSTRAINT "FK_2e687af3d2244095612fa85a086" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_dcea437b53376edb53a9e3a5f72" FOREIGN KEY ("base_currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_61c036e6bea4ac7047578b509ad" FOREIGN KEY ("quote_currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_c54a4caeb06d676b454396fac1b" FOREIGN KEY ("added_by_admin_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallets" ADD CONSTRAINT "FK_f4e4cfffa6c58328bf6ee28fc57" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" ADD CONSTRAINT "FK_df71d0f9058318ebc25302aa365" FOREIGN KEY ("wallet_id") REFERENCES "wallet"."wallets"("iam_user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" ADD CONSTRAINT "FK_2674821ffb4e68555b8db4faa10" FOREIGN KEY ("currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."funding_transactions" ADD CONSTRAINT "FK_22366dd00fca36c9156fee340fc" FOREIGN KEY ("wallet_id") REFERENCES "wallet"."wallets"("iam_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."trades" ADD CONSTRAINT "FK_d5cc38461e9487c127882757bc7" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."trade_fees" ADD CONSTRAINT "FK_7ba99caf8a1dd047da4543a67f8" FOREIGN KEY ("trade_id") REFERENCES "trading"."trades"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit"."ledger_entries" ADD CONSTRAINT "FK_04aed5836a7a3d9a0ba0382fe41" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit"."audit_logs" ADD CONSTRAINT "FK_e106d2feb318503093d66287dcd" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit"."audit_logs" DROP CONSTRAINT "FK_e106d2feb318503093d66287dcd"`);
        await queryRunner.query(`ALTER TABLE "audit"."ledger_entries" DROP CONSTRAINT "FK_04aed5836a7a3d9a0ba0382fe41"`);
        await queryRunner.query(`ALTER TABLE "trading"."trade_fees" DROP CONSTRAINT "FK_7ba99caf8a1dd047da4543a67f8"`);
        await queryRunner.query(`ALTER TABLE "trading"."trades" DROP CONSTRAINT "FK_d5cc38461e9487c127882757bc7"`);
        await queryRunner.query(`ALTER TABLE "wallet"."funding_transactions" DROP CONSTRAINT "FK_22366dd00fca36c9156fee340fc"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" DROP CONSTRAINT "FK_2674821ffb4e68555b8db4faa10"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" DROP CONSTRAINT "FK_df71d0f9058318ebc25302aa365"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallets" DROP CONSTRAINT "FK_f4e4cfffa6c58328bf6ee28fc57"`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_c54a4caeb06d676b454396fac1b"`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_61c036e6bea4ac7047578b509ad"`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_dcea437b53376edb53a9e3a5f72"`);
        await queryRunner.query(`ALTER TABLE "account"."admin_profiles" DROP CONSTRAINT "FK_2e687af3d2244095612fa85a086"`);
        await queryRunner.query(`ALTER TABLE "account"."user_profiles" DROP CONSTRAINT "FK_aae0ca4ad514cf6616554c8598d"`);
        await queryRunner.query(`ALTER TABLE "iam"."email_verification_tokens" DROP CONSTRAINT "FK_114448395d7cc91d62f1bdc6855"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_change_tokens" DROP CONSTRAINT "FK_79823fe27fde4e5372c00167a8b"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_reset_tokens" DROP CONSTRAINT "FK_ca189dae692453a9a1b62f6bd4e"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_histories" DROP CONSTRAINT "FK_0773e3e1d5660057a283f3f08e2"`);
        await queryRunner.query(`DROP TABLE "audit"."audit_logs"`);
        await queryRunner.query(`DROP TABLE "audit"."ledger_entries"`);
        await queryRunner.query(`DROP TABLE "trading"."trade_fees"`);
        await queryRunner.query(`DROP TABLE "trading"."trades"`);
        await queryRunner.query(`DROP TYPE "trading"."trade_type"`);
        await queryRunner.query(`DROP TYPE "trading"."trade_status"`);
        await queryRunner.query(`DROP TABLE "wallet"."funding_transactions"`);
        await queryRunner.query(`DROP TYPE "wallet"."transaction_status"`);
        await queryRunner.query(`DROP INDEX "wallet"."IDX_a1983bb22b30a57a62abdce0ef"`);
        await queryRunner.query(`DROP TABLE "wallet"."wallet_balances"`);
        await queryRunner.query(`DROP TABLE "wallet"."wallets"`);
        await queryRunner.query(`DROP INDEX "fx"."IDX_5bed3bceb361429f1a84ee81e6"`);
        await queryRunner.query(`DROP TABLE "fx"."currency_pairs"`);
        await queryRunner.query(`DROP TABLE "fx"."currencies"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_ec92d759102ed28ad43ba5932f"`);
        await queryRunner.query(`DROP TABLE "iam"."iam_users"`);
        await queryRunner.query(`DROP TYPE "iam"."account_status"`);
        await queryRunner.query(`DROP TYPE "iam"."auth_method"`);
        await queryRunner.query(`DROP TYPE "iam"."role"`);
        await queryRunner.query(`DROP TABLE "account"."admin_profiles"`);
        await queryRunner.query(`DROP TABLE "account"."user_profiles"`);
        await queryRunner.query(`DROP TYPE "account"."kyc_status"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_114448395d7cc91d62f1bdc685"`);
        await queryRunner.query(`DROP TABLE "iam"."email_verification_tokens"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_89365d03d6df5fae31e957320c"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_79823fe27fde4e5372c00167a8"`);
        await queryRunner.query(`DROP TABLE "iam"."password_change_tokens"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_ca189dae692453a9a1b62f6bd4"`);
        await queryRunner.query(`DROP TABLE "iam"."password_reset_tokens"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_0773e3e1d5660057a283f3f08e"`);
        await queryRunner.query(`DROP TABLE "iam"."password_histories"`);
    }

}
