import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773762537695 implements MigrationInterface {
    name = 'AutoMigration1773762537695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "trading"."trade_status" AS ENUM('pending', 'completed', 'failed', 'cancelled')`);
        await queryRunner.query(`CREATE TYPE "trading"."trade_type" AS ENUM('CONVERSION', 'TRADE')`);
        await queryRunner.query(`CREATE TABLE "trading"."trades" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "from_currency_code" character varying NOT NULL, "to_currency_code" character varying NOT NULL, "from_amount" numeric(18,8) NOT NULL, "to_amount" numeric(18,8) NOT NULL, "rate" numeric(18,8) NOT NULL, "fee" numeric(18,8) NOT NULL DEFAULT '0', "status" "trading"."trade_status" NOT NULL DEFAULT 'pending', "type" "trading"."trade_type" NOT NULL DEFAULT 'CONVERSION', "idempotency_key" character varying NOT NULL, "executed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_e6726f1b49b0ec9a882ec66aba2" UNIQUE ("idempotency_key"), CONSTRAINT "PK_c6d7c36a837411ba5194dc58595" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trading"."trade_fees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "trade_id" uuid NOT NULL, "fee_type" character varying NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_b7d754928a23b6a4c608d2e8c40" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "trading"."trades" ADD CONSTRAINT "FK_d5cc38461e9487c127882757bc7" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trading"."trade_fees" ADD CONSTRAINT "FK_7ba99caf8a1dd047da4543a67f8" FOREIGN KEY ("trade_id") REFERENCES "trading"."trades"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trading"."trade_fees" DROP CONSTRAINT "FK_7ba99caf8a1dd047da4543a67f8"`);
        await queryRunner.query(`ALTER TABLE "trading"."trades" DROP CONSTRAINT "FK_d5cc38461e9487c127882757bc7"`);
        await queryRunner.query(`DROP TABLE "trading"."trade_fees"`);
        await queryRunner.query(`DROP TABLE "trading"."trades"`);
        await queryRunner.query(`DROP TYPE "trading"."trade_type"`);
        await queryRunner.query(`DROP TYPE "trading"."trade_status"`);
    }

}
