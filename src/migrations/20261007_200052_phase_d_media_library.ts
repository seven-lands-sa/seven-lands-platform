import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_tags" AS ENUM('brand', 'website', 'services', 'projects', 'articles', 'social', 'og', 'team', 'other');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_uploaded';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_binary_replaced';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_deleted';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_delete_blocked';
  CREATE TABLE "media_tags" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_tags",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "media_texts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_texts" CASCADE;
  ALTER TABLE "media_locales" ALTER COLUMN "alt" DROP NOT NULL;
  ALTER TABLE "roles" ADD COLUMN "media_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "media_visibility" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "media_svg_upload" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "decorative" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "content_hash" varchar;
  ALTER TABLE "media" ADD COLUMN "source_filename" varchar;
  ALTER TABLE "media" ADD COLUMN "created_by_id" integer;
  ALTER TABLE "media" ADD COLUMN "duplicate_of_id" integer;
  ALTER TABLE "media" ADD COLUMN "replaced_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "sizes_content_url" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_width" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_height" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_mime_type" varchar;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filesize" numeric;
  ALTER TABLE "media" ADD COLUMN "sizes_content_filename" varchar;
  ALTER TABLE "media_tags" ADD CONSTRAINT "media_tags_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_tags_order_idx" ON "media_tags" USING btree ("order");
  CREATE INDEX "media_tags_parent_idx" ON "media_tags" USING btree ("parent_id");
  CREATE INDEX "media_tags_value_idx" ON "media_tags" USING btree ("value");
  ALTER TABLE "media" ADD CONSTRAINT "media_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media" ADD CONSTRAINT "media_duplicate_of_id_media_id_fk" FOREIGN KEY ("duplicate_of_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_content_hash_idx" ON "media" USING btree ("content_hash");
  CREATE INDEX "media_created_by_idx" ON "media" USING btree ("created_by_id");
  CREATE INDEX "media_duplicate_of_idx" ON "media" USING btree ("duplicate_of_id");
  CREATE INDEX "media_sizes_content_sizes_content_filename_idx" ON "media" USING btree ("sizes_content_filename");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "media_texts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"text" varchar
  );
  
  ALTER TABLE "media_tags" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "media_tags" CASCADE;
  ALTER TABLE "media" DROP CONSTRAINT "media_created_by_id_users_id_fk";
  
  ALTER TABLE "media" DROP CONSTRAINT "media_duplicate_of_id_media_id_fk";
  
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  DROP INDEX "media_content_hash_idx";
  DROP INDEX "media_created_by_idx";
  DROP INDEX "media_duplicate_of_idx";
  DROP INDEX "media_sizes_content_sizes_content_filename_idx";
  ALTER TABLE "media_locales" ALTER COLUMN "alt" SET NOT NULL;
  ALTER TABLE "media_texts" ADD CONSTRAINT "media_texts_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "media_texts_order_parent" ON "media_texts" USING btree ("order","parent_id");
  ALTER TABLE "roles" DROP COLUMN "media_update";
  ALTER TABLE "roles" DROP COLUMN "media_visibility";
  ALTER TABLE "roles" DROP COLUMN "media_svg_upload";
  ALTER TABLE "media" DROP COLUMN "decorative";
  ALTER TABLE "media" DROP COLUMN "content_hash";
  ALTER TABLE "media" DROP COLUMN "source_filename";
  ALTER TABLE "media" DROP COLUMN "created_by_id";
  ALTER TABLE "media" DROP COLUMN "duplicate_of_id";
  ALTER TABLE "media" DROP COLUMN "replaced_at";
  ALTER TABLE "media" DROP COLUMN "sizes_content_url";
  ALTER TABLE "media" DROP COLUMN "sizes_content_width";
  ALTER TABLE "media" DROP COLUMN "sizes_content_height";
  ALTER TABLE "media" DROP COLUMN "sizes_content_mime_type";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filesize";
  ALTER TABLE "media" DROP COLUMN "sizes_content_filename";
  DROP TYPE "public"."enum_media_tags";`)
}
