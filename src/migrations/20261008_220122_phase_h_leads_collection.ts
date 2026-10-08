import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_status" AS ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST', 'SPAM');
  CREATE TYPE "public"."enum_leads_channel" AS ENUM('whatsapp', 'call');
  CREATE TYPE "public"."enum_leads_timeline" AS ENUM('now', 'quarter', 'later', 'unsure');
  CREATE TYPE "public"."enum_leads_mode" AS ENUM('brief', 'quick');
  CREATE TYPE "public"."enum_leads_locale" AS ENUM('ar', 'en');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'lead_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'lead_status_changed';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'lead_note_added';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'lead_exported';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'leads';
  CREATE TABLE "leads_internal_notes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL,
  	"author" varchar,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "leads" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"reference" varchar NOT NULL,
  	"status" "enum_leads_status" DEFAULT 'NEW' NOT NULL,
  	"name" varchar NOT NULL,
  	"company" varchar,
  	"phone" varchar NOT NULL,
  	"email" varchar,
  	"channel" "enum_leads_channel" NOT NULL,
  	"timeline" "enum_leads_timeline",
  	"mode" "enum_leads_mode" DEFAULT 'brief' NOT NULL,
  	"lands" jsonb,
  	"goal" varchar NOT NULL,
  	"notes" varchar,
  	"consent" boolean DEFAULT true NOT NULL,
  	"locale" "enum_leads_locale" DEFAULT 'ar' NOT NULL,
  	"campaign" jsonb,
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "leads_id" integer;
  ALTER TABLE "leads_internal_notes" ADD CONSTRAINT "leads_internal_notes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "leads_internal_notes_order_idx" ON "leads_internal_notes" USING btree ("_order");
  CREATE INDEX "leads_internal_notes_parent_id_idx" ON "leads_internal_notes" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "leads_reference_idx" ON "leads" USING btree ("reference");
  CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");
  CREATE INDEX "leads_phone_idx" ON "leads" USING btree ("phone");
  CREATE INDEX "leads_updated_at_idx" ON "leads" USING btree ("updated_at");
  CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_leads_fk" FOREIGN KEY ("leads_id") REFERENCES "public"."leads"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_leads_id_idx" ON "payload_locked_documents_rels" USING btree ("leads_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads_internal_notes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "leads" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "leads_internal_notes" CASCADE;
  DROP TABLE "leads" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_leads_fk";
  
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed', 'media_uploaded', 'media_updated', 'media_binary_replaced', 'media_deleted', 'media_delete_blocked', 'page_created', 'page_updated', 'page_published', 'page_unpublished', 'page_archived', 'page_restored', 'page_slug_changed', 'page_blocks_reordered', 'service_created', 'service_updated', 'service_published', 'service_unpublished', 'project_created', 'project_updated', 'project_published', 'project_unpublished', 'insight_created', 'insight_updated', 'insight_published', 'insight_unpublished');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  DROP INDEX "payload_locked_documents_rels_leads_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "leads_id";
  DROP TYPE "public"."enum_leads_status";
  DROP TYPE "public"."enum_leads_channel";
  DROP TYPE "public"."enum_leads_timeline";
  DROP TYPE "public"."enum_leads_mode";
  DROP TYPE "public"."enum_leads_locale";`)
}
