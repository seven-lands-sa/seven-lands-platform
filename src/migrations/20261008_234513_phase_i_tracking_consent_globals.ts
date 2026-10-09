import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_tracking_settings_environments" AS ENUM('production', 'preview', 'development');
  CREATE TYPE "public"."enum__tracking_settings_v_version_environments" AS ENUM('production', 'preview', 'development');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'tracking_updated' BEFORE 'media_visibility_changed';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'consent_updated' BEFORE 'media_visibility_changed';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'tracking-settings';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'consent-settings';
  CREATE TABLE "tracking_settings_environments" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_tracking_settings_environments",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "tracking_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"google_analytics_id" varchar,
  	"google_analytics_enabled" boolean DEFAULT false,
  	"gtm_container_id" varchar,
  	"gtm_enabled" boolean DEFAULT false,
  	"google_ads_conversion_id" varchar,
  	"google_ads_enabled" boolean DEFAULT false,
  	"meta_pixel_id" varchar,
  	"meta_pixel_enabled" boolean DEFAULT false,
  	"snap_pixel_id" varchar,
  	"snap_pixel_enabled" boolean DEFAULT false,
  	"tiktok_pixel_id" varchar,
  	"tiktok_pixel_enabled" boolean DEFAULT false,
  	"linkedin_partner_id" varchar,
  	"linkedin_enabled" boolean DEFAULT false,
  	"clarity_project_id" varchar,
  	"clarity_enabled" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_tracking_settings_v_version_environments" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__tracking_settings_v_version_environments",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_tracking_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_google_analytics_id" varchar,
  	"version_google_analytics_enabled" boolean DEFAULT false,
  	"version_gtm_container_id" varchar,
  	"version_gtm_enabled" boolean DEFAULT false,
  	"version_google_ads_conversion_id" varchar,
  	"version_google_ads_enabled" boolean DEFAULT false,
  	"version_meta_pixel_id" varchar,
  	"version_meta_pixel_enabled" boolean DEFAULT false,
  	"version_snap_pixel_id" varchar,
  	"version_snap_pixel_enabled" boolean DEFAULT false,
  	"version_tiktok_pixel_id" varchar,
  	"version_tiktok_pixel_enabled" boolean DEFAULT false,
  	"version_linkedin_partner_id" varchar,
  	"version_linkedin_enabled" boolean DEFAULT false,
  	"version_clarity_project_id" varchar,
  	"version_clarity_enabled" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "consent_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"cookie_expiry_months" numeric DEFAULT 6 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "consent_settings_locales" (
  	"banner_title" varchar,
  	"banner_description" varchar,
  	"accept_all_label" varchar,
  	"reject_all_label" varchar,
  	"preferences_label" varchar,
  	"save_preferences_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_consent_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_enabled" boolean DEFAULT true,
  	"version_cookie_expiry_months" numeric DEFAULT 6 NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_consent_settings_v_locales" (
  	"version_banner_title" varchar,
  	"version_banner_description" varchar,
  	"version_accept_all_label" varchar,
  	"version_reject_all_label" varchar,
  	"version_preferences_label" varchar,
  	"version_save_preferences_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "tracking_settings_environments" ADD CONSTRAINT "tracking_settings_environments_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."tracking_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_tracking_settings_v_version_environments" ADD CONSTRAINT "_tracking_settings_v_version_environments_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_tracking_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "consent_settings_locales" ADD CONSTRAINT "consent_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."consent_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_consent_settings_v_locales" ADD CONSTRAINT "_consent_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_consent_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "tracking_settings_environments_order_idx" ON "tracking_settings_environments" USING btree ("order");
  CREATE INDEX "tracking_settings_environments_parent_idx" ON "tracking_settings_environments" USING btree ("parent_id");
  CREATE INDEX "_tracking_settings_v_version_environments_order_idx" ON "_tracking_settings_v_version_environments" USING btree ("order");
  CREATE INDEX "_tracking_settings_v_version_environments_parent_idx" ON "_tracking_settings_v_version_environments" USING btree ("parent_id");
  CREATE INDEX "_tracking_settings_v_created_at_idx" ON "_tracking_settings_v" USING btree ("created_at");
  CREATE INDEX "_tracking_settings_v_updated_at_idx" ON "_tracking_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "consent_settings_locales_locale_parent_id_unique" ON "consent_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_consent_settings_v_created_at_idx" ON "_consent_settings_v" USING btree ("created_at");
  CREATE INDEX "_consent_settings_v_updated_at_idx" ON "_consent_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_consent_settings_v_locales_locale_parent_id_unique" ON "_consent_settings_v_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "tracking_settings_environments" CASCADE;
  DROP TABLE "tracking_settings" CASCADE;
  DROP TABLE "_tracking_settings_v_version_environments" CASCADE;
  DROP TABLE "_tracking_settings_v" CASCADE;
  DROP TABLE "consent_settings" CASCADE;
  DROP TABLE "consent_settings_locales" CASCADE;
  DROP TABLE "_consent_settings_v" CASCADE;
  DROP TABLE "_consent_settings_v_locales" CASCADE;
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed', 'media_uploaded', 'media_updated', 'media_binary_replaced', 'media_deleted', 'media_delete_blocked', 'page_created', 'page_updated', 'page_published', 'page_unpublished', 'page_archived', 'page_restored', 'page_slug_changed', 'page_blocks_reordered', 'service_created', 'service_updated', 'service_published', 'service_unpublished', 'project_created', 'project_updated', 'project_published', 'project_unpublished', 'insight_created', 'insight_updated', 'insight_published', 'insight_unpublished', 'lead_created', 'lead_status_changed', 'lead_note_added', 'lead_exported', 'redirect_created', 'redirect_updated', 'redirect_deleted');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_resource_type";
  CREATE TYPE "public"."enum_audit_events_resource_type" AS ENUM('users', 'roles', 'audit', 'system', 'site-settings', 'contact-settings', 'business-hours', 'social-accounts', 'navigation', 'footer', 'media', 'pages', 'services', 'projects', 'insights', 'leads', 'redirects');
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE "public"."enum_audit_events_resource_type" USING "resource_type"::"public"."enum_audit_events_resource_type";
  DROP TYPE "public"."enum_tracking_settings_environments";
  DROP TYPE "public"."enum__tracking_settings_v_version_environments";`)
}
