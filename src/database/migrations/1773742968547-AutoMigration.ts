import type { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1773742968547 implements MigrationInterface {
    name = 'AutoMigration1773742968547'

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
        await queryRunner.query(`CREATE TYPE "iam"."role" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "iam"."auth_method" AS ENUM('EMAIL', 'GOOGLE', 'FACEBOOK', 'ANONYMOUS')`);
        await queryRunner.query(`CREATE TYPE "iam"."account_status" AS ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED', 'PENDING_VERIFICATION')`);
        await queryRunner.query(`CREATE TABLE "iam"."iam_users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "iam"."role" NOT NULL, "is_email_verified" boolean NOT NULL DEFAULT false, "is_verified" boolean NOT NULL DEFAULT false, "auth_method" "iam"."auth_method" NOT NULL DEFAULT 'EMAIL', "account_status" "iam"."account_status" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_0692f810e8926469bec26da0d99" UNIQUE ("email"), CONSTRAINT "PK_02086c69f80fed8ae319ec498ec" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ec92d759102ed28ad43ba5932f" ON "iam"."iam_users" ("email", "role") `);
        await queryRunner.query(`ALTER TABLE "iam"."password_histories" ADD CONSTRAINT "FK_0773e3e1d5660057a283f3f08e2" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."password_reset_tokens" ADD CONSTRAINT "FK_ca189dae692453a9a1b62f6bd4e" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."password_change_tokens" ADD CONSTRAINT "FK_79823fe27fde4e5372c00167a8b" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "iam"."email_verification_tokens" ADD CONSTRAINT "FK_114448395d7cc91d62f1bdc6855" FOREIGN KEY ("iam_user_id") REFERENCES "iam"."iam_users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "iam"."email_verification_tokens" DROP CONSTRAINT "FK_114448395d7cc91d62f1bdc6855"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_change_tokens" DROP CONSTRAINT "FK_79823fe27fde4e5372c00167a8b"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_reset_tokens" DROP CONSTRAINT "FK_ca189dae692453a9a1b62f6bd4e"`);
        await queryRunner.query(`ALTER TABLE "iam"."password_histories" DROP CONSTRAINT "FK_0773e3e1d5660057a283f3f08e2"`);
        await queryRunner.query(`DROP INDEX "iam"."IDX_ec92d759102ed28ad43ba5932f"`);
        await queryRunner.query(`DROP TABLE "iam"."iam_users"`);
        await queryRunner.query(`DROP TYPE "iam"."account_status"`);
        await queryRunner.query(`DROP TYPE "iam"."auth_method"`);
        await queryRunner.query(`DROP TYPE "iam"."role"`);
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
