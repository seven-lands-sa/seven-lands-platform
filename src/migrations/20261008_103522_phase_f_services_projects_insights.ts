import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_land_key" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum_services_glyph" AS ENUM('strategy', 'brand', 'content', 'social', 'performance', 'web', 'software');
  CREATE TYPE "public"."enum_services_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_land_key" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum__services_v_version_glyph" AS ENUM('strategy', 'brand', 'content', 'social', 'performance', 'web', 'software');
  CREATE TYPE "public"."enum__services_v_version_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_projects_land_keys" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum_projects_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_land_keys" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum__projects_v_version_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_published_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_insights_land_keys" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum_insights_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_insights_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_insights_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_version_land_keys" AS ENUM('strategy-business-growth', 'branding-creative', 'content-production', 'social-digital-presence', 'performance-acquisition', 'web-commerce-experiences', 'software-automation-technology');
  CREATE TYPE "public"."enum__insights_v_version_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_version_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__insights_v_published_locale" AS ENUM('ar', 'en');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'service_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'service_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'service_published';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'service_unpublished';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'project_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'project_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'project_published';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'project_unpublished';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'insight_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'insight_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'insight_published';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'insight_unpublished';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'services';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'projects';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'insights';
  CREATE TABLE "services_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "services_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"land_key" "enum_services_land_key",
  	"number" varchar,
  	"order" numeric DEFAULT 1,
  	"enabled" boolean DEFAULT true,
  	"glyph" "enum_services_glyph",
  	"cover_id" integer,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"locale_state_ar_state" "enum_services_locale_state_ar_state" DEFAULT 'draft',
  	"locale_state_ar_at" timestamp(3) with time zone,
  	"locale_state_en_state" "enum_services_locale_state_en_state" DEFAULT 'draft',
  	"locale_state_en_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "services_locales" (
  	"title" varchar,
  	"short" varchar,
  	"promise" varchar,
  	"intro" varchar,
  	"wa" varchar,
  	"scope_note" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_services_v_version_capabilities" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"q" varchar,
  	"a" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_land_key" "enum__services_v_version_land_key",
  	"version_number" varchar,
  	"version_order" numeric DEFAULT 1,
  	"version_enabled" boolean DEFAULT true,
  	"version_glyph" "enum__services_v_version_glyph",
  	"version_cover_id" integer,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_locale_state_ar_state" "enum__services_v_version_locale_state_ar_state" DEFAULT 'draft',
  	"version_locale_state_ar_at" timestamp(3) with time zone,
  	"version_locale_state_en_state" "enum__services_v_version_locale_state_en_state" DEFAULT 'draft',
  	"version_locale_state_en_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__services_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_services_v_locales" (
  	"version_title" varchar,
  	"version_short" varchar,
  	"version_promise" varchar,
  	"version_intro" varchar,
  	"version_wa" varchar,
  	"version_scope_note" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_land_keys" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_projects_land_keys",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "projects_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"source_note" varchar
  );
  
  CREATE TABLE "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"year" varchar,
  	"featured" boolean DEFAULT false,
  	"cover_id" integer,
  	"testimonial_approved" boolean DEFAULT false,
  	"published_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"locale_state_ar_state" "enum_projects_locale_state_ar_state" DEFAULT 'draft',
  	"locale_state_ar_at" timestamp(3) with time zone,
  	"locale_state_en_state" "enum_projects_locale_state_en_state" DEFAULT 'draft',
  	"locale_state_en_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "projects_locales" (
  	"name" varchar,
  	"client" varchar,
  	"sector" varchar,
  	"summary" varchar,
  	"challenge" varchar,
  	"objective" varchar,
  	"approach" varchar,
  	"execution" varchar,
  	"result_narrative" varchar,
  	"testimonial_quote" varchar,
  	"testimonial_attribution" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_projects_v_version_land_keys" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__projects_v_version_land_keys",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_projects_v_version_metrics" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"value" varchar,
  	"source_note" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_year" varchar,
  	"version_featured" boolean DEFAULT false,
  	"version_cover_id" integer,
  	"version_testimonial_approved" boolean DEFAULT false,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_locale_state_ar_state" "enum__projects_v_version_locale_state_ar_state" DEFAULT 'draft',
  	"version_locale_state_ar_at" timestamp(3) with time zone,
  	"version_locale_state_en_state" "enum__projects_v_version_locale_state_en_state" DEFAULT 'draft',
  	"version_locale_state_en_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__projects_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_projects_v_locales" (
  	"version_name" varchar,
  	"version_client" varchar,
  	"version_sector" varchar,
  	"version_summary" varchar,
  	"version_challenge" varchar,
  	"version_objective" varchar,
  	"version_approach" varchar,
  	"version_execution" varchar,
  	"version_result_narrative" varchar,
  	"version_testimonial_quote" varchar,
  	"version_testimonial_attribution" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "insights_land_keys" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_insights_land_keys",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "insights" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"cover_id" integer,
  	"published_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"locale_state_ar_state" "enum_insights_locale_state_ar_state" DEFAULT 'draft',
  	"locale_state_ar_at" timestamp(3) with time zone,
  	"locale_state_en_state" "enum_insights_locale_state_en_state" DEFAULT 'draft',
  	"locale_state_en_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_insights_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "insights_locales" (
  	"title" varchar,
  	"excerpt" varchar,
  	"category" varchar,
  	"author" varchar,
  	"body" jsonb,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_insights_v_version_land_keys" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__insights_v_version_land_keys",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_insights_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_cover_id" integer,
  	"version_published_at" timestamp(3) with time zone,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_locale_state_ar_state" "enum__insights_v_version_locale_state_ar_state" DEFAULT 'draft',
  	"version_locale_state_ar_at" timestamp(3) with time zone,
  	"version_locale_state_en_state" "enum__insights_v_version_locale_state_en_state" DEFAULT 'draft',
  	"version_locale_state_en_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__insights_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__insights_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_insights_v_locales" (
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_category" varchar,
  	"version_author" varchar,
  	"version_body" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "insights_id" integer;
  ALTER TABLE "services_capabilities" ADD CONSTRAINT "services_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_problems" ADD CONSTRAINT "services_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faqs" ADD CONSTRAINT "services_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_capabilities" ADD CONSTRAINT "_services_v_version_capabilities_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_problems" ADD CONSTRAINT "_services_v_version_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faqs" ADD CONSTRAINT "_services_v_version_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_locales" ADD CONSTRAINT "_services_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_land_keys" ADD CONSTRAINT "projects_land_keys_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_metrics" ADD CONSTRAINT "projects_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects" ADD CONSTRAINT "projects_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_land_keys" ADD CONSTRAINT "_projects_v_version_land_keys_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_metrics" ADD CONSTRAINT "_projects_v_version_metrics_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_locales" ADD CONSTRAINT "_projects_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights_land_keys" ADD CONSTRAINT "insights_land_keys_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights" ADD CONSTRAINT "insights_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "insights_locales" ADD CONSTRAINT "insights_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v_version_land_keys" ADD CONSTRAINT "_insights_v_version_land_keys_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_parent_id_insights_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."insights"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v" ADD CONSTRAINT "_insights_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_insights_v_locales" ADD CONSTRAINT "_insights_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_insights_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_capabilities_order_idx" ON "services_capabilities" USING btree ("_order");
  CREATE INDEX "services_capabilities_parent_id_idx" ON "services_capabilities" USING btree ("_parent_id");
  CREATE INDEX "services_capabilities_locale_idx" ON "services_capabilities" USING btree ("_locale");
  CREATE INDEX "services_problems_order_idx" ON "services_problems" USING btree ("_order");
  CREATE INDEX "services_problems_parent_id_idx" ON "services_problems" USING btree ("_parent_id");
  CREATE INDEX "services_problems_locale_idx" ON "services_problems" USING btree ("_locale");
  CREATE INDEX "services_faqs_order_idx" ON "services_faqs" USING btree ("_order");
  CREATE INDEX "services_faqs_parent_id_idx" ON "services_faqs" USING btree ("_parent_id");
  CREATE INDEX "services_faqs_locale_idx" ON "services_faqs" USING btree ("_locale");
  CREATE UNIQUE INDEX "services_land_key_idx" ON "services" USING btree ("land_key");
  CREATE INDEX "services_cover_idx" ON "services" USING btree ("cover_id");
  CREATE INDEX "services_seo_seo_og_image_idx" ON "services" USING btree ("seo_og_image_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE UNIQUE INDEX "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_services_v_version_capabilities_order_idx" ON "_services_v_version_capabilities" USING btree ("_order");
  CREATE INDEX "_services_v_version_capabilities_parent_id_idx" ON "_services_v_version_capabilities" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_capabilities_locale_idx" ON "_services_v_version_capabilities" USING btree ("_locale");
  CREATE INDEX "_services_v_version_problems_order_idx" ON "_services_v_version_problems" USING btree ("_order");
  CREATE INDEX "_services_v_version_problems_parent_id_idx" ON "_services_v_version_problems" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_problems_locale_idx" ON "_services_v_version_problems" USING btree ("_locale");
  CREATE INDEX "_services_v_version_faqs_order_idx" ON "_services_v_version_faqs" USING btree ("_order");
  CREATE INDEX "_services_v_version_faqs_parent_id_idx" ON "_services_v_version_faqs" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faqs_locale_idx" ON "_services_v_version_faqs" USING btree ("_locale");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_land_key_idx" ON "_services_v" USING btree ("version_land_key");
  CREATE INDEX "_services_v_version_version_cover_idx" ON "_services_v" USING btree ("version_cover_id");
  CREATE INDEX "_services_v_version_seo_version_seo_og_image_idx" ON "_services_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_snapshot_idx" ON "_services_v" USING btree ("snapshot");
  CREATE INDEX "_services_v_published_locale_idx" ON "_services_v" USING btree ("published_locale");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_services_v_locales_locale_parent_id_unique" ON "_services_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_land_keys_order_idx" ON "projects_land_keys" USING btree ("order");
  CREATE INDEX "projects_land_keys_parent_idx" ON "projects_land_keys" USING btree ("parent_id");
  CREATE INDEX "projects_metrics_order_idx" ON "projects_metrics" USING btree ("_order");
  CREATE INDEX "projects_metrics_parent_id_idx" ON "projects_metrics" USING btree ("_parent_id");
  CREATE INDEX "projects_metrics_locale_idx" ON "projects_metrics" USING btree ("_locale");
  CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX "projects_cover_idx" ON "projects" USING btree ("cover_id");
  CREATE INDEX "projects_seo_seo_og_image_idx" ON "projects" USING btree ("seo_og_image_id");
  CREATE INDEX "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE UNIQUE INDEX "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX "projects_rels_media_id_idx" ON "projects_rels" USING btree ("media_id");
  CREATE INDEX "_projects_v_version_land_keys_order_idx" ON "_projects_v_version_land_keys" USING btree ("order");
  CREATE INDEX "_projects_v_version_land_keys_parent_idx" ON "_projects_v_version_land_keys" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_metrics_order_idx" ON "_projects_v_version_metrics" USING btree ("_order");
  CREATE INDEX "_projects_v_version_metrics_parent_id_idx" ON "_projects_v_version_metrics" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_metrics_locale_idx" ON "_projects_v_version_metrics" USING btree ("_locale");
  CREATE INDEX "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX "_projects_v_version_version_cover_idx" ON "_projects_v" USING btree ("version_cover_id");
  CREATE INDEX "_projects_v_version_seo_version_seo_og_image_idx" ON "_projects_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX "_projects_v_snapshot_idx" ON "_projects_v" USING btree ("snapshot");
  CREATE INDEX "_projects_v_published_locale_idx" ON "_projects_v" USING btree ("published_locale");
  CREATE INDEX "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_projects_v_locales_locale_parent_id_unique" ON "_projects_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX "_projects_v_rels_media_id_idx" ON "_projects_v_rels" USING btree ("media_id");
  CREATE INDEX "insights_land_keys_order_idx" ON "insights_land_keys" USING btree ("order");
  CREATE INDEX "insights_land_keys_parent_idx" ON "insights_land_keys" USING btree ("parent_id");
  CREATE UNIQUE INDEX "insights_slug_idx" ON "insights" USING btree ("slug");
  CREATE INDEX "insights_cover_idx" ON "insights" USING btree ("cover_id");
  CREATE INDEX "insights_seo_seo_og_image_idx" ON "insights" USING btree ("seo_og_image_id");
  CREATE INDEX "insights_updated_at_idx" ON "insights" USING btree ("updated_at");
  CREATE INDEX "insights_created_at_idx" ON "insights" USING btree ("created_at");
  CREATE INDEX "insights__status_idx" ON "insights" USING btree ("_status");
  CREATE UNIQUE INDEX "insights_locales_locale_parent_id_unique" ON "insights_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_insights_v_version_land_keys_order_idx" ON "_insights_v_version_land_keys" USING btree ("order");
  CREATE INDEX "_insights_v_version_land_keys_parent_idx" ON "_insights_v_version_land_keys" USING btree ("parent_id");
  CREATE INDEX "_insights_v_parent_idx" ON "_insights_v" USING btree ("parent_id");
  CREATE INDEX "_insights_v_version_version_slug_idx" ON "_insights_v" USING btree ("version_slug");
  CREATE INDEX "_insights_v_version_version_cover_idx" ON "_insights_v" USING btree ("version_cover_id");
  CREATE INDEX "_insights_v_version_seo_version_seo_og_image_idx" ON "_insights_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_insights_v_version_version_updated_at_idx" ON "_insights_v" USING btree ("version_updated_at");
  CREATE INDEX "_insights_v_version_version_created_at_idx" ON "_insights_v" USING btree ("version_created_at");
  CREATE INDEX "_insights_v_version_version__status_idx" ON "_insights_v" USING btree ("version__status");
  CREATE INDEX "_insights_v_created_at_idx" ON "_insights_v" USING btree ("created_at");
  CREATE INDEX "_insights_v_updated_at_idx" ON "_insights_v" USING btree ("updated_at");
  CREATE INDEX "_insights_v_snapshot_idx" ON "_insights_v" USING btree ("snapshot");
  CREATE INDEX "_insights_v_published_locale_idx" ON "_insights_v" USING btree ("published_locale");
  CREATE INDEX "_insights_v_latest_idx" ON "_insights_v" USING btree ("latest");
  CREATE UNIQUE INDEX "_insights_v_locales_locale_parent_id_unique" ON "_insights_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_insights_fk" FOREIGN KEY ("insights_id") REFERENCES "public"."insights"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX "payload_locked_documents_rels_insights_id_idx" ON "payload_locked_documents_rels" USING btree ("insights_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_capabilities" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_land_keys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_land_keys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_metrics" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_land_keys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "insights_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_version_land_keys" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_insights_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_capabilities" CASCADE;
  DROP TABLE "services_problems" CASCADE;
  DROP TABLE "services_faqs" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "services_locales" CASCADE;
  DROP TABLE "_services_v_version_capabilities" CASCADE;
  DROP TABLE "_services_v_version_problems" CASCADE;
  DROP TABLE "_services_v_version_faqs" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "_services_v_locales" CASCADE;
  DROP TABLE "projects_land_keys" CASCADE;
  DROP TABLE "projects_metrics" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_locales" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_land_keys" CASCADE;
  DROP TABLE "_projects_v_version_metrics" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_locales" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "insights_land_keys" CASCADE;
  DROP TABLE "insights" CASCADE;
  DROP TABLE "insights_locales" CASCADE;
  DROP TABLE "_insights_v_version_land_keys" CASCADE;
  DROP TABLE "_insights_v" CASCADE;
  DROP TABLE "_insights_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_insights_fk";
  
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed', 'media_uploaded', 'media_updated', 'media_binary_replaced', 'media_deleted', 'media_delete_blocked', 'page_created', 'page_updated', 'page_published', 'page_unpublished', 'page_archived', 'page_restored', 'page_slug_changed', 'page_blocks_reordered');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_resource_type";
  CREATE TYPE "public"."enum_audit_events_resource_type" AS ENUM('users', 'roles', 'audit', 'system', 'site-settings', 'contact-settings', 'business-hours', 'social-accounts', 'navigation', 'footer', 'media', 'pages');
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE "public"."enum_audit_events_resource_type" USING "resource_type"::"public"."enum_audit_events_resource_type";
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX "payload_locked_documents_rels_insights_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "insights_id";
  DROP TYPE "public"."enum_services_land_key";
  DROP TYPE "public"."enum_services_glyph";
  DROP TYPE "public"."enum_services_locale_state_ar_state";
  DROP TYPE "public"."enum_services_locale_state_en_state";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_land_key";
  DROP TYPE "public"."enum__services_v_version_glyph";
  DROP TYPE "public"."enum__services_v_version_locale_state_ar_state";
  DROP TYPE "public"."enum__services_v_version_locale_state_en_state";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum__services_v_published_locale";
  DROP TYPE "public"."enum_projects_land_keys";
  DROP TYPE "public"."enum_projects_locale_state_ar_state";
  DROP TYPE "public"."enum_projects_locale_state_en_state";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_land_keys";
  DROP TYPE "public"."enum__projects_v_version_locale_state_ar_state";
  DROP TYPE "public"."enum__projects_v_version_locale_state_en_state";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum__projects_v_published_locale";
  DROP TYPE "public"."enum_insights_land_keys";
  DROP TYPE "public"."enum_insights_locale_state_ar_state";
  DROP TYPE "public"."enum_insights_locale_state_en_state";
  DROP TYPE "public"."enum_insights_status";
  DROP TYPE "public"."enum__insights_v_version_land_keys";
  DROP TYPE "public"."enum__insights_v_version_locale_state_ar_state";
  DROP TYPE "public"."enum__insights_v_version_locale_state_en_state";
  DROP TYPE "public"."enum__insights_v_version_status";
  DROP TYPE "public"."enum__insights_v_published_locale";`)
}
