import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773759827498 implements MigrationInterface {
    name = 'AutoMigration1773759827498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallet"."wallets" ("iam_user_id" uuid NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e4cfffa6c58328bf6ee28fc57" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`CREATE TABLE "wallet"."wallet_balances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_id" uuid NOT NULL, "currency_code" character varying NOT NULL, "balance" numeric(18,8) NOT NULL DEFAULT '0', "locked_balance" numeric(18,8) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_eebe2c6f13f1a2de3457f8a885c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_a1983bb22b30a57a62abdce0ef" ON "wallet"."wallet_balances" ("wallet_id", "currency_code") `);
        await queryRunner.query(`CREATE TYPE "wallet"."transaction_status" AS ENUM('pending', 'completed', 'failed', 'cancelled', 'reversed')`);
        await queryRunner.query(`CREATE TABLE "wallet"."funding_transactions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_id" uuid NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "status" "wallet"."transaction_status" NOT NULL DEFAULT 'pending', "provider" character varying, "reference" character varying NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2896145976d2fd4040af0b6374d" UNIQUE ("reference"), CONSTRAINT "PK_369a4c0fd0d1a7b14ebd9fa8e1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallets" ADD CONSTRAINT "FK_f4e4cfffa6c58328bf6ee28fc57" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" ADD CONSTRAINT "FK_df71d0f9058318ebc25302aa365" FOREIGN KEY ("wallet_id") REFERENCES "wallet"."wallets"("iam_user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" ADD CONSTRAINT "FK_2674821ffb4e68555b8db4faa10" FOREIGN KEY ("currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet"."funding_transactions" ADD CONSTRAINT "FK_22366dd00fca36c9156fee340fc" FOREIGN KEY ("wallet_id") REFERENCES "wallet"."wallets"("iam_user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallet"."funding_transactions" DROP CONSTRAINT "FK_22366dd00fca36c9156fee340fc"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" DROP CONSTRAINT "FK_2674821ffb4e68555b8db4faa10"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallet_balances" DROP CONSTRAINT "FK_df71d0f9058318ebc25302aa365"`);
        await queryRunner.query(`ALTER TABLE "wallet"."wallets" DROP CONSTRAINT "FK_f4e4cfffa6c58328bf6ee28fc57"`);
        await queryRunner.query(`DROP TABLE "wallet"."funding_transactions"`);
        await queryRunner.query(`DROP TYPE "wallet"."transaction_status"`);
        await queryRunner.query(`DROP INDEX "wallet"."IDX_a1983bb22b30a57a62abdce0ef"`);
        await queryRunner.query(`DROP TABLE "wallet"."wallet_balances"`);
        await queryRunner.query(`DROP TABLE "wallet"."wallets"`);
    }

}
