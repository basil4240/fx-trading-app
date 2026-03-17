import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773753183801 implements MigrationInterface {
    name = 'AutoMigration1773753183801'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "account"."kyc_status" AS ENUM('NONE', 'PENDING', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "account"."user_profiles" ("iam_user_id" uuid NOT NULL, "display_name" character varying NOT NULL, "phone" character varying, "avatar_url" character varying, "kyc_status" "account"."kyc_status" NOT NULL DEFAULT 'NONE', "tier" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_aae0ca4ad514cf6616554c8598d" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`CREATE TABLE "account"."admin_profiles" ("iam_user_id" uuid NOT NULL, "department" character varying NOT NULL, "employee_id" character varying NOT NULL, "permissions_scope" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_2672d9214c4719615fa20e62c91" UNIQUE ("employee_id"), CONSTRAINT "PK_2e687af3d2244095612fa85a086" PRIMARY KEY ("iam_user_id"))`);
        await queryRunner.query(`ALTER TABLE "account"."user_profiles" ADD CONSTRAINT "FK_aae0ca4ad514cf6616554c8598d" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "account"."admin_profiles" ADD CONSTRAINT "FK_2e687af3d2244095612fa85a086" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "account"."admin_profiles" DROP CONSTRAINT "FK_2e687af3d2244095612fa85a086"`);
        await queryRunner.query(`ALTER TABLE "account"."user_profiles" DROP CONSTRAINT "FK_aae0ca4ad514cf6616554c8598d"`);
        await queryRunner.query(`DROP TABLE "account"."admin_profiles"`);
        await queryRunner.query(`DROP TABLE "account"."user_profiles"`);
        await queryRunner.query(`DROP TYPE "account"."kyc_status"`);
    }

}
