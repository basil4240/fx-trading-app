import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773758623045 implements MigrationInterface {
    name = 'AutoMigration1773758623045'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fx"."currencies" ("code" character varying(3) NOT NULL, "name" character varying NOT NULL, "symbol" character varying(5), "is_funding_currency" boolean NOT NULL DEFAULT false, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9f8d0972aeeb5a2277e40332d29" PRIMARY KEY ("code"))`);
        await queryRunner.query(`CREATE TABLE "fx"."currency_pairs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "base_currency_code" character varying NOT NULL, "quote_currency_code" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "added_by_admin_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dadf101ef21de770fa8dcfae1b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5bed3bceb361429f1a84ee81e6" ON "fx"."currency_pairs" ("base_currency_code", "quote_currency_code") `);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_dcea437b53376edb53a9e3a5f72" FOREIGN KEY ("base_currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_61c036e6bea4ac7047578b509ad" FOREIGN KEY ("quote_currency_code") REFERENCES "fx"."currencies"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" ADD CONSTRAINT "FK_c54a4caeb06d676b454396fac1b" FOREIGN KEY ("added_by_admin_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_c54a4caeb06d676b454396fac1b"`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_61c036e6bea4ac7047578b509ad"`);
        await queryRunner.query(`ALTER TABLE "fx"."currency_pairs" DROP CONSTRAINT "FK_dcea437b53376edb53a9e3a5f72"`);
        await queryRunner.query(`DROP INDEX "fx"."IDX_5bed3bceb361429f1a84ee81e6"`);
        await queryRunner.query(`DROP TABLE "fx"."currency_pairs"`);
        await queryRunner.query(`DROP TABLE "fx"."currencies"`);
    }

}
