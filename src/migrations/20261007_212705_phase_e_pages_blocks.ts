import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_variant" AS ENUM('brandPath', 'image', 'minimal');
  CREATE TYPE "public"."enum_pages_blocks_hero_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_hero_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_hero_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_hero_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_hero_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_page_header_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_legal_document_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_trust_statement_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_lands_system_variant" AS ENUM('system', 'grid');
  CREATE TYPE "public"."enum_pages_blocks_lands_system_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_problems_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_process_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_why_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_services_teaser_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_services_teaser_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_services_teaser_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_work_teaser_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_work_teaser_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_work_teaser_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_work_teaser_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_work_teaser_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_cta_variant" AS ENUM('dark', 'light', 'brand');
  CREATE TYPE "public"."enum_pages_blocks_cta_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_cta_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_cta_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_cta_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_cta_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_contact_panel_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_brief_form_variant" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum_pages_blocks_brief_form_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_map_embed_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_system_key" AS ENUM('home', 'about', 'contact', 'start-a-project', 'privacy', 'terms');
  CREATE TYPE "public"."enum_pages_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_variant" AS ENUM('brandPath', 'image', 'minimal');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_page_header_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_legal_document_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_trust_statement_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_lands_system_variant" AS ENUM('system', 'grid');
  CREATE TYPE "public"."enum__pages_v_blocks_lands_system_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_problems_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_process_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_why_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_work_teaser_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_work_teaser_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_work_teaser_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_work_teaser_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_work_teaser_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_variant" AS ENUM('dark', 'light', 'brand');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_cta_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_panel_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_brief_form_variant" AS ENUM('full', 'compact');
  CREATE TYPE "public"."enum__pages_v_blocks_brief_form_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_map_embed_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_version_system_key" AS ENUM('home', 'about', 'contact', 'start-a-project', 'privacy', 'terms');
  CREATE TYPE "public"."enum__pages_v_version_locale_state_ar_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_locale_state_en_state" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_published_locale" AS ENUM('ar', 'en');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_created';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_published';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_unpublished';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_archived';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_restored';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_slug_changed';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'page_blocks_reordered';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'pages';
  CREATE TABLE "pages_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_hero_variant" DEFAULT 'brandPath',
  	"eyebrow" varchar,
  	"title1" varchar,
  	"title2" varchar,
  	"title_accent" varchar,
  	"support" varchar,
  	"primary_kind" "enum_pages_blocks_hero_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum_pages_blocks_hero_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum_pages_blocks_hero_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum_pages_blocks_hero_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"media_id" integer,
  	"mobile_media_id" integer,
  	"decoration" boolean DEFAULT true,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_hero_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_page_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"lede" varchar,
  	"support" varchar,
  	"decoration" boolean DEFAULT true,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_page_header_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_rich_text_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_legal_document_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb
  );
  
  CREATE TABLE "pages_blocks_legal_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_legal_document_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_statement_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_trust_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"note" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_trust_statement_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_lands_system" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_lands_system_variant" DEFAULT 'system',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_lands_system_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_problems_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"problem" varchar,
  	"outcome" varchar
  );
  
  CREATE TABLE "pages_blocks_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_problems_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_process_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_why" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_why_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_kind" "enum_pages_blocks_services_teaser_cta_kind" DEFAULT 'internal',
  	"cta_page_id" integer,
  	"cta_route_key" "enum_pages_blocks_services_teaser_cta_route_key",
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_services_teaser_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_work_teaser_empty_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_work_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"primary_kind" "enum_pages_blocks_work_teaser_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum_pages_blocks_work_teaser_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum_pages_blocks_work_teaser_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum_pages_blocks_work_teaser_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_work_teaser_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_cta_variant" DEFAULT 'dark',
  	"eyebrow" varchar,
  	"heading1" varchar,
  	"heading2" varchar,
  	"body" varchar,
  	"primary_kind" "enum_pages_blocks_cta_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum_pages_blocks_cta_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum_pages_blocks_cta_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum_pages_blocks_cta_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_cta_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_panel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_contact_panel_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_brief_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"variant" "enum_pages_blocks_brief_form_variant" DEFAULT 'full',
  	"heading" varchar,
  	"intro" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_brief_form_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"note" varchar,
  	"cta_kind" "enum_pages_blocks_map_embed_cta_kind" DEFAULT 'internal',
  	"cta_page_id" integer,
  	"cta_route_key" "enum_pages_blocks_map_embed_cta_route_key",
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_map_embed_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"system_key" "enum_pages_system_key",
  	"slug" varchar,
  	"locale_state_ar_state" "enum_pages_locale_state_ar_state" DEFAULT 'draft',
  	"locale_state_ar_at" timestamp(3) with time zone,
  	"locale_state_en_state" "enum_pages_locale_state_en_state" DEFAULT 'draft',
  	"locale_state_en_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "pages_locales" (
  	"title" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_hero_variant" DEFAULT 'brandPath',
  	"eyebrow" varchar,
  	"title1" varchar,
  	"title2" varchar,
  	"title_accent" varchar,
  	"support" varchar,
  	"primary_kind" "enum__pages_v_blocks_hero_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum__pages_v_blocks_hero_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum__pages_v_blocks_hero_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum__pages_v_blocks_hero_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"media_id" integer,
  	"mobile_media_id" integer,
  	"decoration" boolean DEFAULT true,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_hero_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_page_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"title" varchar,
  	"lede" varchar,
  	"support" varchar,
  	"decoration" boolean DEFAULT true,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_page_header_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"body" jsonb,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_rich_text_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_legal_document_sections" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" jsonb,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_legal_document" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"intro" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_legal_document_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_statement_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_trust_statement" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"note" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_trust_statement_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_lands_system" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_lands_system_variant" DEFAULT 'system',
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_lands_system_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_problems_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"problem" varchar,
  	"outcome" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_problems" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_problems_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_process_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_why" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_why_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_kind" "enum__pages_v_blocks_services_teaser_cta_kind" DEFAULT 'internal',
  	"cta_page_id" integer,
  	"cta_route_key" "enum__pages_v_blocks_services_teaser_cta_route_key",
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_services_teaser_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_work_teaser_empty_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_work_teaser" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"primary_kind" "enum__pages_v_blocks_work_teaser_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum__pages_v_blocks_work_teaser_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum__pages_v_blocks_work_teaser_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum__pages_v_blocks_work_teaser_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_work_teaser_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_cta_variant" DEFAULT 'dark',
  	"eyebrow" varchar,
  	"heading1" varchar,
  	"heading2" varchar,
  	"body" varchar,
  	"primary_kind" "enum__pages_v_blocks_cta_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum__pages_v_blocks_cta_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum__pages_v_blocks_cta_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum__pages_v_blocks_cta_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_cta_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_panel" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_contact_panel_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_brief_form" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"variant" "enum__pages_v_blocks_brief_form_variant" DEFAULT 'full',
  	"heading" varchar,
  	"intro" varchar,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_brief_form_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"note" varchar,
  	"cta_kind" "enum__pages_v_blocks_map_embed_cta_kind" DEFAULT 'internal',
  	"cta_page_id" integer,
  	"cta_route_key" "enum__pages_v_blocks_map_embed_cta_route_key",
  	"cta_url" varchar,
  	"cta_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_map_embed_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_system_key" "enum__pages_v_version_system_key",
  	"version_slug" varchar,
  	"version_locale_state_ar_state" "enum__pages_v_version_locale_state_ar_state" DEFAULT 'draft',
  	"version_locale_state_ar_at" timestamp(3) with time zone,
  	"version_locale_state_en_state" "enum__pages_v_version_locale_state_en_state" DEFAULT 'draft',
  	"version_locale_state_en_at" timestamp(3) with time zone,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__pages_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "_pages_v_locales" (
  	"version_title" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "roles" ADD COLUMN "pages_archive" boolean DEFAULT false;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "pages_id" integer;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero" ADD CONSTRAINT "pages_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_header" ADD CONSTRAINT "pages_blocks_page_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text" ADD CONSTRAINT "pages_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_document_sections" ADD CONSTRAINT "pages_blocks_legal_document_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_legal_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_document" ADD CONSTRAINT "pages_blocks_legal_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_statement_facts" ADD CONSTRAINT "pages_blocks_trust_statement_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_statement" ADD CONSTRAINT "pages_blocks_trust_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lands_system" ADD CONSTRAINT "pages_blocks_lands_system_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_problems_items" ADD CONSTRAINT "pages_blocks_problems_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_problems" ADD CONSTRAINT "pages_blocks_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process" ADD CONSTRAINT "pages_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_items" ADD CONSTRAINT "pages_blocks_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_why"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why" ADD CONSTRAINT "pages_blocks_why_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_teaser" ADD CONSTRAINT "pages_blocks_services_teaser_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_teaser" ADD CONSTRAINT "pages_blocks_services_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser_empty_points" ADD CONSTRAINT "pages_blocks_work_teaser_empty_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_work_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser" ADD CONSTRAINT "pages_blocks_work_teaser_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser" ADD CONSTRAINT "pages_blocks_work_teaser_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser" ADD CONSTRAINT "pages_blocks_work_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_panel" ADD CONSTRAINT "pages_blocks_contact_panel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_brief_form" ADD CONSTRAINT "pages_blocks_brief_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed" ADD CONSTRAINT "pages_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_locales" ADD CONSTRAINT "pages_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_mobile_media_id_media_id_fk" FOREIGN KEY ("mobile_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero" ADD CONSTRAINT "_pages_v_blocks_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_header" ADD CONSTRAINT "_pages_v_blocks_page_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD CONSTRAINT "_pages_v_blocks_rich_text_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_document_sections" ADD CONSTRAINT "_pages_v_blocks_legal_document_sections_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_legal_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_document" ADD CONSTRAINT "_pages_v_blocks_legal_document_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" ADD CONSTRAINT "_pages_v_blocks_trust_statement_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_statement" ADD CONSTRAINT "_pages_v_blocks_trust_statement_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lands_system" ADD CONSTRAINT "_pages_v_blocks_lands_system_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_problems_items" ADD CONSTRAINT "_pages_v_blocks_problems_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_problems" ADD CONSTRAINT "_pages_v_blocks_problems_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process" ADD CONSTRAINT "_pages_v_blocks_process_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_items" ADD CONSTRAINT "_pages_v_blocks_why_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why" ADD CONSTRAINT "_pages_v_blocks_why_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD CONSTRAINT "_pages_v_blocks_services_teaser_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD CONSTRAINT "_pages_v_blocks_services_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" ADD CONSTRAINT "_pages_v_blocks_work_teaser_empty_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_work_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD CONSTRAINT "_pages_v_blocks_work_teaser_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD CONSTRAINT "_pages_v_blocks_work_teaser_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD CONSTRAINT "_pages_v_blocks_work_teaser_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta" ADD CONSTRAINT "_pages_v_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD CONSTRAINT "_pages_v_blocks_contact_panel_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brief_form" ADD CONSTRAINT "_pages_v_blocks_brief_form_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD CONSTRAINT "_pages_v_blocks_map_embed_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_locales" ADD CONSTRAINT "_pages_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_order_idx" ON "pages_blocks_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_parent_id_idx" ON "pages_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_path_idx" ON "pages_blocks_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_hero_primary_primary_page_idx" ON "pages_blocks_hero" USING btree ("primary_page_id");
  CREATE INDEX "pages_blocks_hero_secondary_secondary_page_idx" ON "pages_blocks_hero" USING btree ("secondary_page_id");
  CREATE INDEX "pages_blocks_hero_media_idx" ON "pages_blocks_hero" USING btree ("media_id");
  CREATE INDEX "pages_blocks_hero_mobile_media_idx" ON "pages_blocks_hero" USING btree ("mobile_media_id");
  CREATE INDEX "pages_blocks_page_header_order_idx" ON "pages_blocks_page_header" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_header_parent_id_idx" ON "pages_blocks_page_header" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_page_header_path_idx" ON "pages_blocks_page_header" USING btree ("_path");
  CREATE INDEX "pages_blocks_page_header_locale_idx" ON "pages_blocks_page_header" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rich_text_order_idx" ON "pages_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "pages_blocks_rich_text_parent_id_idx" ON "pages_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_rich_text_path_idx" ON "pages_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_legal_document_sections_order_idx" ON "pages_blocks_legal_document_sections" USING btree ("_order");
  CREATE INDEX "pages_blocks_legal_document_sections_parent_id_idx" ON "pages_blocks_legal_document_sections" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_legal_document_sections_locale_idx" ON "pages_blocks_legal_document_sections" USING btree ("_locale");
  CREATE INDEX "pages_blocks_legal_document_order_idx" ON "pages_blocks_legal_document" USING btree ("_order");
  CREATE INDEX "pages_blocks_legal_document_parent_id_idx" ON "pages_blocks_legal_document" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_legal_document_path_idx" ON "pages_blocks_legal_document" USING btree ("_path");
  CREATE INDEX "pages_blocks_legal_document_locale_idx" ON "pages_blocks_legal_document" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_statement_facts_order_idx" ON "pages_blocks_trust_statement_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_statement_facts_parent_id_idx" ON "pages_blocks_trust_statement_facts" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_statement_facts_locale_idx" ON "pages_blocks_trust_statement_facts" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_statement_order_idx" ON "pages_blocks_trust_statement" USING btree ("_order");
  CREATE INDEX "pages_blocks_trust_statement_parent_id_idx" ON "pages_blocks_trust_statement" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_trust_statement_path_idx" ON "pages_blocks_trust_statement" USING btree ("_path");
  CREATE INDEX "pages_blocks_trust_statement_locale_idx" ON "pages_blocks_trust_statement" USING btree ("_locale");
  CREATE INDEX "pages_blocks_lands_system_order_idx" ON "pages_blocks_lands_system" USING btree ("_order");
  CREATE INDEX "pages_blocks_lands_system_parent_id_idx" ON "pages_blocks_lands_system" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_lands_system_path_idx" ON "pages_blocks_lands_system" USING btree ("_path");
  CREATE INDEX "pages_blocks_lands_system_locale_idx" ON "pages_blocks_lands_system" USING btree ("_locale");
  CREATE INDEX "pages_blocks_problems_items_order_idx" ON "pages_blocks_problems_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_problems_items_parent_id_idx" ON "pages_blocks_problems_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_problems_items_locale_idx" ON "pages_blocks_problems_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_problems_order_idx" ON "pages_blocks_problems" USING btree ("_order");
  CREATE INDEX "pages_blocks_problems_parent_id_idx" ON "pages_blocks_problems" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_problems_path_idx" ON "pages_blocks_problems" USING btree ("_path");
  CREATE INDEX "pages_blocks_problems_locale_idx" ON "pages_blocks_problems" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_locale_idx" ON "pages_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_order_idx" ON "pages_blocks_process" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_parent_id_idx" ON "pages_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_path_idx" ON "pages_blocks_process" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_locale_idx" ON "pages_blocks_process" USING btree ("_locale");
  CREATE INDEX "pages_blocks_why_items_order_idx" ON "pages_blocks_why_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_items_parent_id_idx" ON "pages_blocks_why_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_items_locale_idx" ON "pages_blocks_why_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_why_order_idx" ON "pages_blocks_why" USING btree ("_order");
  CREATE INDEX "pages_blocks_why_parent_id_idx" ON "pages_blocks_why" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_why_path_idx" ON "pages_blocks_why" USING btree ("_path");
  CREATE INDEX "pages_blocks_why_locale_idx" ON "pages_blocks_why" USING btree ("_locale");
  CREATE INDEX "pages_blocks_services_teaser_order_idx" ON "pages_blocks_services_teaser" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_teaser_parent_id_idx" ON "pages_blocks_services_teaser" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_teaser_path_idx" ON "pages_blocks_services_teaser" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_teaser_locale_idx" ON "pages_blocks_services_teaser" USING btree ("_locale");
  CREATE INDEX "pages_blocks_services_teaser_cta_cta_page_idx" ON "pages_blocks_services_teaser" USING btree ("cta_page_id");
  CREATE INDEX "pages_blocks_work_teaser_empty_points_order_idx" ON "pages_blocks_work_teaser_empty_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_work_teaser_empty_points_parent_id_idx" ON "pages_blocks_work_teaser_empty_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_work_teaser_empty_points_locale_idx" ON "pages_blocks_work_teaser_empty_points" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_teaser_order_idx" ON "pages_blocks_work_teaser" USING btree ("_order");
  CREATE INDEX "pages_blocks_work_teaser_parent_id_idx" ON "pages_blocks_work_teaser" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_work_teaser_path_idx" ON "pages_blocks_work_teaser" USING btree ("_path");
  CREATE INDEX "pages_blocks_work_teaser_locale_idx" ON "pages_blocks_work_teaser" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_teaser_primary_primary_page_idx" ON "pages_blocks_work_teaser" USING btree ("primary_page_id");
  CREATE INDEX "pages_blocks_work_teaser_secondary_secondary_page_idx" ON "pages_blocks_work_teaser" USING btree ("secondary_page_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_primary_primary_page_idx" ON "pages_blocks_cta" USING btree ("primary_page_id");
  CREATE INDEX "pages_blocks_cta_secondary_secondary_page_idx" ON "pages_blocks_cta" USING btree ("secondary_page_id");
  CREATE INDEX "pages_blocks_contact_panel_order_idx" ON "pages_blocks_contact_panel" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_panel_parent_id_idx" ON "pages_blocks_contact_panel" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_panel_path_idx" ON "pages_blocks_contact_panel" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_panel_locale_idx" ON "pages_blocks_contact_panel" USING btree ("_locale");
  CREATE INDEX "pages_blocks_brief_form_order_idx" ON "pages_blocks_brief_form" USING btree ("_order");
  CREATE INDEX "pages_blocks_brief_form_parent_id_idx" ON "pages_blocks_brief_form" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_brief_form_path_idx" ON "pages_blocks_brief_form" USING btree ("_path");
  CREATE INDEX "pages_blocks_brief_form_locale_idx" ON "pages_blocks_brief_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_map_embed_order_idx" ON "pages_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "pages_blocks_map_embed_parent_id_idx" ON "pages_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_map_embed_path_idx" ON "pages_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "pages_blocks_map_embed_locale_idx" ON "pages_blocks_map_embed" USING btree ("_locale");
  CREATE INDEX "pages_blocks_map_embed_cta_cta_page_idx" ON "pages_blocks_map_embed" USING btree ("cta_page_id");
  CREATE UNIQUE INDEX "pages_system_key_idx" ON "pages" USING btree ("system_key");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages_locales" USING btree ("seo_og_image_id");
  CREATE UNIQUE INDEX "pages_locales_locale_parent_id_unique" ON "pages_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_order_idx" ON "_pages_v_blocks_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_parent_id_idx" ON "_pages_v_blocks_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_path_idx" ON "_pages_v_blocks_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_primary_primary_page_idx" ON "_pages_v_blocks_hero" USING btree ("primary_page_id");
  CREATE INDEX "_pages_v_blocks_hero_secondary_secondary_page_idx" ON "_pages_v_blocks_hero" USING btree ("secondary_page_id");
  CREATE INDEX "_pages_v_blocks_hero_media_idx" ON "_pages_v_blocks_hero" USING btree ("media_id");
  CREATE INDEX "_pages_v_blocks_hero_mobile_media_idx" ON "_pages_v_blocks_hero" USING btree ("mobile_media_id");
  CREATE INDEX "_pages_v_blocks_page_header_order_idx" ON "_pages_v_blocks_page_header" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_page_header_parent_id_idx" ON "_pages_v_blocks_page_header" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_page_header_path_idx" ON "_pages_v_blocks_page_header" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_page_header_locale_idx" ON "_pages_v_blocks_page_header" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_rich_text_order_idx" ON "_pages_v_blocks_rich_text" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_rich_text_parent_id_idx" ON "_pages_v_blocks_rich_text" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_rich_text_path_idx" ON "_pages_v_blocks_rich_text" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_legal_document_sections_order_idx" ON "_pages_v_blocks_legal_document_sections" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_legal_document_sections_parent_id_idx" ON "_pages_v_blocks_legal_document_sections" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_legal_document_sections_locale_idx" ON "_pages_v_blocks_legal_document_sections" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_legal_document_order_idx" ON "_pages_v_blocks_legal_document" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_legal_document_parent_id_idx" ON "_pages_v_blocks_legal_document" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_legal_document_path_idx" ON "_pages_v_blocks_legal_document" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_legal_document_locale_idx" ON "_pages_v_blocks_legal_document" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_statement_facts_order_idx" ON "_pages_v_blocks_trust_statement_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_statement_facts_parent_id_idx" ON "_pages_v_blocks_trust_statement_facts" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_statement_facts_locale_idx" ON "_pages_v_blocks_trust_statement_facts" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_statement_order_idx" ON "_pages_v_blocks_trust_statement" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_trust_statement_parent_id_idx" ON "_pages_v_blocks_trust_statement" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_trust_statement_path_idx" ON "_pages_v_blocks_trust_statement" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_trust_statement_locale_idx" ON "_pages_v_blocks_trust_statement" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_lands_system_order_idx" ON "_pages_v_blocks_lands_system" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_lands_system_parent_id_idx" ON "_pages_v_blocks_lands_system" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_lands_system_path_idx" ON "_pages_v_blocks_lands_system" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_lands_system_locale_idx" ON "_pages_v_blocks_lands_system" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_problems_items_order_idx" ON "_pages_v_blocks_problems_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_problems_items_parent_id_idx" ON "_pages_v_blocks_problems_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_problems_items_locale_idx" ON "_pages_v_blocks_problems_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_problems_order_idx" ON "_pages_v_blocks_problems" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_problems_parent_id_idx" ON "_pages_v_blocks_problems" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_problems_path_idx" ON "_pages_v_blocks_problems" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_problems_locale_idx" ON "_pages_v_blocks_problems" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_locale_idx" ON "_pages_v_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_order_idx" ON "_pages_v_blocks_process" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_parent_id_idx" ON "_pages_v_blocks_process" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_path_idx" ON "_pages_v_blocks_process" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_locale_idx" ON "_pages_v_blocks_process" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_why_items_order_idx" ON "_pages_v_blocks_why_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_items_parent_id_idx" ON "_pages_v_blocks_why_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_items_locale_idx" ON "_pages_v_blocks_why_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_why_order_idx" ON "_pages_v_blocks_why" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_why_parent_id_idx" ON "_pages_v_blocks_why" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_why_path_idx" ON "_pages_v_blocks_why" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_why_locale_idx" ON "_pages_v_blocks_why" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_services_teaser_order_idx" ON "_pages_v_blocks_services_teaser" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_teaser_parent_id_idx" ON "_pages_v_blocks_services_teaser" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_teaser_path_idx" ON "_pages_v_blocks_services_teaser" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_teaser_locale_idx" ON "_pages_v_blocks_services_teaser" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_services_teaser_cta_cta_page_idx" ON "_pages_v_blocks_services_teaser" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_work_teaser_empty_points_order_idx" ON "_pages_v_blocks_work_teaser_empty_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_work_teaser_empty_points_parent_id_idx" ON "_pages_v_blocks_work_teaser_empty_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_work_teaser_empty_points_locale_idx" ON "_pages_v_blocks_work_teaser_empty_points" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_teaser_order_idx" ON "_pages_v_blocks_work_teaser" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_work_teaser_parent_id_idx" ON "_pages_v_blocks_work_teaser" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_work_teaser_path_idx" ON "_pages_v_blocks_work_teaser" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_work_teaser_locale_idx" ON "_pages_v_blocks_work_teaser" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_teaser_primary_primary_page_idx" ON "_pages_v_blocks_work_teaser" USING btree ("primary_page_id");
  CREATE INDEX "_pages_v_blocks_work_teaser_secondary_secondary_page_idx" ON "_pages_v_blocks_work_teaser" USING btree ("secondary_page_id");
  CREATE INDEX "_pages_v_blocks_cta_order_idx" ON "_pages_v_blocks_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_cta_parent_id_idx" ON "_pages_v_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_cta_path_idx" ON "_pages_v_blocks_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_primary_primary_page_idx" ON "_pages_v_blocks_cta" USING btree ("primary_page_id");
  CREATE INDEX "_pages_v_blocks_cta_secondary_secondary_page_idx" ON "_pages_v_blocks_cta" USING btree ("secondary_page_id");
  CREATE INDEX "_pages_v_blocks_contact_panel_order_idx" ON "_pages_v_blocks_contact_panel" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_panel_parent_id_idx" ON "_pages_v_blocks_contact_panel" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_panel_path_idx" ON "_pages_v_blocks_contact_panel" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_panel_locale_idx" ON "_pages_v_blocks_contact_panel" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_brief_form_order_idx" ON "_pages_v_blocks_brief_form" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_brief_form_parent_id_idx" ON "_pages_v_blocks_brief_form" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_brief_form_path_idx" ON "_pages_v_blocks_brief_form" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_brief_form_locale_idx" ON "_pages_v_blocks_brief_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_map_embed_order_idx" ON "_pages_v_blocks_map_embed" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_map_embed_parent_id_idx" ON "_pages_v_blocks_map_embed" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_map_embed_path_idx" ON "_pages_v_blocks_map_embed" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_map_embed_locale_idx" ON "_pages_v_blocks_map_embed" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_map_embed_cta_cta_page_idx" ON "_pages_v_blocks_map_embed" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_system_key_idx" ON "_pages_v" USING btree ("version_system_key");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_snapshot_idx" ON "_pages_v" USING btree ("snapshot");
  CREATE INDEX "_pages_v_published_locale_idx" ON "_pages_v" USING btree ("published_locale");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v_locales" USING btree ("version_seo_og_image_id");
  CREATE UNIQUE INDEX "_pages_v_locales_locale_parent_id_unique" ON "_pages_v_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_page_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_legal_document_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_legal_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_statement_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_lands_system" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_problems_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_teaser" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_teaser_empty_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_teaser" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_panel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_brief_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_map_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_page_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_legal_document_sections" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_legal_document" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_statement" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_lands_system" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_problems_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_problems" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_teaser" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_teaser" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_panel" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brief_form" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_map_embed" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero" CASCADE;
  DROP TABLE "pages_blocks_page_header" CASCADE;
  DROP TABLE "pages_blocks_rich_text" CASCADE;
  DROP TABLE "pages_blocks_legal_document_sections" CASCADE;
  DROP TABLE "pages_blocks_legal_document" CASCADE;
  DROP TABLE "pages_blocks_trust_statement_facts" CASCADE;
  DROP TABLE "pages_blocks_trust_statement" CASCADE;
  DROP TABLE "pages_blocks_lands_system" CASCADE;
  DROP TABLE "pages_blocks_problems_items" CASCADE;
  DROP TABLE "pages_blocks_problems" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_process" CASCADE;
  DROP TABLE "pages_blocks_why_items" CASCADE;
  DROP TABLE "pages_blocks_why" CASCADE;
  DROP TABLE "pages_blocks_services_teaser" CASCADE;
  DROP TABLE "pages_blocks_work_teaser_empty_points" CASCADE;
  DROP TABLE "pages_blocks_work_teaser" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "pages_blocks_contact_panel" CASCADE;
  DROP TABLE "pages_blocks_brief_form" CASCADE;
  DROP TABLE "pages_blocks_map_embed" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "pages_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_page_header" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_document_sections" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_document" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_statement_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_statement" CASCADE;
  DROP TABLE "_pages_v_blocks_lands_system" CASCADE;
  DROP TABLE "_pages_v_blocks_problems_items" CASCADE;
  DROP TABLE "_pages_v_blocks_problems" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process" CASCADE;
  DROP TABLE "_pages_v_blocks_why_items" CASCADE;
  DROP TABLE "_pages_v_blocks_why" CASCADE;
  DROP TABLE "_pages_v_blocks_services_teaser" CASCADE;
  DROP TABLE "_pages_v_blocks_work_teaser_empty_points" CASCADE;
  DROP TABLE "_pages_v_blocks_work_teaser" CASCADE;
  DROP TABLE "_pages_v_blocks_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_panel" CASCADE;
  DROP TABLE "_pages_v_blocks_brief_form" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "_pages_v_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_pages_fk";
  
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted', 'settings_updated', 'contact_updated', 'hours_updated', 'social_updated', 'navigation_updated', 'footer_updated', 'media_visibility_changed', 'media_uploaded', 'media_updated', 'media_binary_replaced', 'media_deleted', 'media_delete_blocked');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_resource_type";
  CREATE TYPE "public"."enum_audit_events_resource_type" AS ENUM('users', 'roles', 'audit', 'system', 'site-settings', 'contact-settings', 'business-hours', 'social-accounts', 'navigation', 'footer', 'media');
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE "public"."enum_audit_events_resource_type" USING "resource_type"::"public"."enum_audit_events_resource_type";
  DROP INDEX "payload_locked_documents_rels_pages_id_idx";
  ALTER TABLE "roles" DROP COLUMN "pages_archive";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "pages_id";
  DROP TYPE "public"."enum_pages_blocks_hero_variant";
  DROP TYPE "public"."enum_pages_blocks_hero_primary_kind";
  DROP TYPE "public"."enum_pages_blocks_hero_primary_route_key";
  DROP TYPE "public"."enum_pages_blocks_hero_secondary_kind";
  DROP TYPE "public"."enum_pages_blocks_hero_secondary_route_key";
  DROP TYPE "public"."enum_pages_blocks_hero_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_page_header_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_rich_text_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_legal_document_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_trust_statement_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_lands_system_variant";
  DROP TYPE "public"."enum_pages_blocks_lands_system_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_problems_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_process_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_why_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_cta_kind";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_cta_route_key";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_work_teaser_primary_kind";
  DROP TYPE "public"."enum_pages_blocks_work_teaser_primary_route_key";
  DROP TYPE "public"."enum_pages_blocks_work_teaser_secondary_kind";
  DROP TYPE "public"."enum_pages_blocks_work_teaser_secondary_route_key";
  DROP TYPE "public"."enum_pages_blocks_work_teaser_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_cta_variant";
  DROP TYPE "public"."enum_pages_blocks_cta_primary_kind";
  DROP TYPE "public"."enum_pages_blocks_cta_primary_route_key";
  DROP TYPE "public"."enum_pages_blocks_cta_secondary_kind";
  DROP TYPE "public"."enum_pages_blocks_cta_secondary_route_key";
  DROP TYPE "public"."enum_pages_blocks_cta_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_contact_panel_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_brief_form_variant";
  DROP TYPE "public"."enum_pages_blocks_brief_form_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_map_embed_cta_kind";
  DROP TYPE "public"."enum_pages_blocks_map_embed_cta_route_key";
  DROP TYPE "public"."enum_pages_blocks_map_embed_locale_visibility";
  DROP TYPE "public"."enum_pages_system_key";
  DROP TYPE "public"."enum_pages_locale_state_ar_state";
  DROP TYPE "public"."enum_pages_locale_state_en_state";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_variant";
  DROP TYPE "public"."enum__pages_v_blocks_hero_primary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_hero_primary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_hero_secondary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_hero_secondary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_hero_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_page_header_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_legal_document_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_trust_statement_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_lands_system_variant";
  DROP TYPE "public"."enum__pages_v_blocks_lands_system_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_problems_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_process_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_why_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_cta_kind";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_cta_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_work_teaser_primary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_work_teaser_primary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_work_teaser_secondary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_work_teaser_secondary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_work_teaser_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_cta_variant";
  DROP TYPE "public"."enum__pages_v_blocks_cta_primary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_cta_primary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_cta_secondary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_cta_secondary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_cta_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_contact_panel_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_brief_form_variant";
  DROP TYPE "public"."enum__pages_v_blocks_brief_form_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_cta_kind";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_cta_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_map_embed_locale_visibility";
  DROP TYPE "public"."enum__pages_v_version_system_key";
  DROP TYPE "public"."enum__pages_v_version_locale_state_ar_state";
  DROP TYPE "public"."enum__pages_v_version_locale_state_en_state";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum__pages_v_published_locale";`)
}
