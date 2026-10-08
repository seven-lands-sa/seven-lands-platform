import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "glyph" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_glyph";
  CREATE TYPE "public"."enum_services_glyph" AS ENUM('strategy', 'branding', 'content', 'social', 'performance', 'web', 'technology');
  ALTER TABLE "services" ALTER COLUMN "glyph" SET DATA TYPE "public"."enum_services_glyph" USING "glyph"::"public"."enum_services_glyph";
  ALTER TABLE "_services_v" ALTER COLUMN "version_glyph" SET DATA TYPE text;
  DROP TYPE "public"."enum__services_v_version_glyph";
  CREATE TYPE "public"."enum__services_v_version_glyph" AS ENUM('strategy', 'branding', 'content', 'social', 'performance', 'web', 'technology');
  ALTER TABLE "_services_v" ALTER COLUMN "version_glyph" SET DATA TYPE "public"."enum__services_v_version_glyph" USING "version_glyph"::"public"."enum__services_v_version_glyph";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "glyph" SET DATA TYPE text;
  DROP TYPE "public"."enum_services_glyph";
  CREATE TYPE "public"."enum_services_glyph" AS ENUM('strategy', 'brand', 'content', 'social', 'performance', 'web', 'software');
  ALTER TABLE "services" ALTER COLUMN "glyph" SET DATA TYPE "public"."enum_services_glyph" USING "glyph"::"public"."enum_services_glyph";
  ALTER TABLE "_services_v" ALTER COLUMN "version_glyph" SET DATA TYPE text;
  DROP TYPE "public"."enum__services_v_version_glyph";
  CREATE TYPE "public"."enum__services_v_version_glyph" AS ENUM('strategy', 'brand', 'content', 'social', 'performance', 'web', 'software');
  ALTER TABLE "_services_v" ALTER COLUMN "version_glyph" SET DATA TYPE "public"."enum__services_v_version_glyph" USING "version_glyph"::"public"."enum__services_v_version_glyph";`)
}
