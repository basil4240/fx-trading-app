import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773763866267 implements MigrationInterface {
    name = 'AutoMigration1773763866267'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit"."ledger_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid NOT NULL, "entity_type" character varying NOT NULL, "entity_id" character varying NOT NULL, "action" character varying NOT NULL, "amount" numeric(18,8) NOT NULL, "currency_code" character varying NOT NULL, "balance_before" numeric(18,8) NOT NULL, "balance_after" numeric(18,8) NOT NULL, "metadata" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_6efcb84411d3f08b08450ae75d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "audit"."audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "iam_user_id" uuid, "module" character varying NOT NULL, "action" character varying NOT NULL, "ip_address" character varying, "user_agent" character varying, "payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "audit"."ledger_entries" ADD CONSTRAINT "FK_04aed5836a7a3d9a0ba0382fe41" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit"."audit_logs" ADD CONSTRAINT "FK_e106d2feb318503093d66287dcd" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audit"."audit_logs" DROP CONSTRAINT "FK_e106d2feb318503093d66287dcd"`);
        await queryRunner.query(`ALTER TABLE "audit"."ledger_entries" DROP CONSTRAINT "FK_04aed5836a7a3d9a0ba0382fe41"`);
        await queryRunner.query(`DROP TABLE "audit"."audit_logs"`);
        await queryRunner.query(`DROP TABLE "audit"."ledger_entries"`);
    }

}
