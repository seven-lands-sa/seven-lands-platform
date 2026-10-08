import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_redirects_status_code" AS ENUM('301', '302', '307', '308');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'redirect_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'redirect_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'redirect_deleted';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'redirects';
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"status_code" "enum_redirects_status_code" DEFAULT '301' NOT NULL,
  	"enabled" boolean DEFAULT true NOT NULL,
  	"internal_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "redirects" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed', 'media_uploaded', 'media_updated', 'media_binary_replaced', 'media_deleted', 'media_delete_blocked', 'page_created', 'page_updated', 'page_published', 'page_unpublished', 'page_archived', 'page_restored', 'page_slug_changed', 'page_blocks_reordered', 'service_created', 'service_updated', 'service_published', 'service_unpublished', 'project_created', 'project_updated', 'project_published', 'project_unpublished', 'insight_created', 'insight_updated', 'insight_published', 'insight_unpublished', 'lead_created', 'lead_status_changed', 'lead_note_added', 'lead_exported');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_resource_type";
  CREATE TYPE "public"."enum_audit_events_resource_type" AS ENUM('users', 'roles', 'audit', 'system', 'site-settings', 'contact-settings', 'business-hours', 'social-accounts', 'navigation', 'footer', 'media', 'pages', 'services', 'projects', 'insights', 'leads');
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE "public"."enum_audit_events_resource_type" USING "resource_type"::"public"."enum_audit_events_resource_type";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_redirects_status_code";`)
}
