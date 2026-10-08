import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_page_header_variant" AS ENUM('default', 'wide', 'withArt');
  CREATE TYPE "public"."enum_pages_blocks_rich_text_variant" AS ENUM('split');
  CREATE TYPE "public"."enum_pages_blocks_services_teaser_variant" AS ENUM('index');
  CREATE TYPE "public"."enum_pages_blocks_contact_panel_aside_project_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_contact_panel_aside_project_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_operations_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_note_section_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum_pages_blocks_button_row_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_button_row_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_button_row_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_button_row_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_pages_blocks_button_row_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_page_header_variant" AS ENUM('default', 'wide', 'withArt');
  CREATE TYPE "public"."enum__pages_v_blocks_rich_text_variant" AS ENUM('split');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_variant" AS ENUM('index');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_panel_aside_project_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_contact_panel_aside_project_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_operations_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_note_section_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TYPE "public"."enum__pages_v_blocks_button_row_primary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_button_row_primary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_button_row_secondary_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_button_row_secondary_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_button_row_locale_visibility" AS ENUM('both', 'ar', 'en');
  CREATE TABLE "pages_blocks_brief_form_aside_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_brief_form_aside_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_operations_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_operations_steps_locales" (
  	"label" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_operations_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_operations_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_operations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_operations_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_operations_locales" (
  	"heading" varchar,
  	"location_heading" varchar,
  	"location_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_note_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_note_section_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_note_section_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_button_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"primary_kind" "enum_pages_blocks_button_row_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum_pages_blocks_button_row_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum_pages_blocks_button_row_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum_pages_blocks_button_row_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum_pages_blocks_button_row_locale_visibility" DEFAULT 'both',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_button_row_locales" (
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_brief_form_aside_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_brief_form_aside_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_operations_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_operations_steps_locales" (
  	"label" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_operations_facts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_operations_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_operations" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_operations_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_operations_locales" (
  	"heading" varchar,
  	"location_heading" varchar,
  	"location_body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_note_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_note_section_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_note_section_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_button_row" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"primary_kind" "enum__pages_v_blocks_button_row_primary_kind" DEFAULT 'internal',
  	"primary_page_id" integer,
  	"primary_route_key" "enum__pages_v_blocks_button_row_primary_route_key",
  	"primary_url" varchar,
  	"primary_new_tab" boolean DEFAULT false,
  	"secondary_kind" "enum__pages_v_blocks_button_row_secondary_kind" DEFAULT 'internal',
  	"secondary_page_id" integer,
  	"secondary_route_key" "enum__pages_v_blocks_button_row_secondary_route_key",
  	"secondary_url" varchar,
  	"secondary_new_tab" boolean DEFAULT false,
  	"label" varchar,
  	"enabled" boolean DEFAULT true,
  	"locale_visibility" "enum__pages_v_blocks_button_row_locale_visibility" DEFAULT 'both',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_button_row_locales" (
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "pages_blocks_services_teaser" DROP CONSTRAINT "pages_blocks_services_teaser_cta_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP CONSTRAINT "_pages_v_blocks_services_teaser_cta_page_id_pages_id_fk";
  
  DROP INDEX "pages_blocks_services_teaser_cta_cta_page_idx";
  DROP INDEX "_pages_v_blocks_services_teaser_cta_cta_page_idx";
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "variant" "enum_pages_blocks_page_header_variant" DEFAULT 'default';
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "variant" "enum_pages_blocks_rich_text_variant" DEFAULT 'split';
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "variant" "enum_pages_blocks_services_teaser_variant" DEFAULT 'index';
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "aside_project_cta_kind" "enum_pages_blocks_contact_panel_aside_project_cta_kind" DEFAULT 'internal';
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "aside_project_cta_page_id" integer;
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "aside_project_cta_route_key" "enum_pages_blocks_contact_panel_aside_project_cta_route_key";
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "aside_project_cta_url" varchar;
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "aside_project_cta_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "channels_heading" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "form_heading" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "form_help" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "aside_project_heading" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "aside_project_body" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "aside_project_cta_label" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "aside_directions_heading" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "aside_directions_body" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "aside_heading" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "aside_note" varchar;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "variant" "enum__pages_v_blocks_page_header_variant" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "variant" "enum__pages_v_blocks_rich_text_variant" DEFAULT 'split';
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "variant" "enum__pages_v_blocks_services_teaser_variant" DEFAULT 'index';
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "aside_project_cta_kind" "enum__pages_v_blocks_contact_panel_aside_project_cta_kind" DEFAULT 'internal';
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "aside_project_cta_page_id" integer;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "aside_project_cta_route_key" "enum__pages_v_blocks_contact_panel_aside_project_cta_route_key";
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "aside_project_cta_url" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "aside_project_cta_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "channels_heading" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "form_heading" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "form_help" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "aside_project_heading" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "aside_project_body" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "aside_project_cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "aside_directions_heading" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "aside_directions_body" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "aside_heading" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "aside_note" varchar;
  ALTER TABLE "pages_blocks_brief_form_aside_points" ADD CONSTRAINT "pages_blocks_brief_form_aside_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_brief_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_brief_form_aside_points_locales" ADD CONSTRAINT "pages_blocks_brief_form_aside_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_brief_form_aside_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations_steps" ADD CONSTRAINT "pages_blocks_operations_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations_steps_locales" ADD CONSTRAINT "pages_blocks_operations_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_operations_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations_facts" ADD CONSTRAINT "pages_blocks_operations_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations_facts_locales" ADD CONSTRAINT "pages_blocks_operations_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_operations_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations" ADD CONSTRAINT "pages_blocks_operations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_operations_locales" ADD CONSTRAINT "pages_blocks_operations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_note_section" ADD CONSTRAINT "pages_blocks_note_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_note_section_locales" ADD CONSTRAINT "pages_blocks_note_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_note_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_row" ADD CONSTRAINT "pages_blocks_button_row_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_row" ADD CONSTRAINT "pages_blocks_button_row_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_row" ADD CONSTRAINT "pages_blocks_button_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_button_row_locales" ADD CONSTRAINT "pages_blocks_button_row_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_button_row"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brief_form_aside_points" ADD CONSTRAINT "_pages_v_blocks_brief_form_aside_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_brief_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brief_form_aside_points_locales" ADD CONSTRAINT "_pages_v_blocks_brief_form_aside_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_brief_form_aside_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations_steps" ADD CONSTRAINT "_pages_v_blocks_operations_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations_steps_locales" ADD CONSTRAINT "_pages_v_blocks_operations_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_operations_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations_facts" ADD CONSTRAINT "_pages_v_blocks_operations_facts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations_facts_locales" ADD CONSTRAINT "_pages_v_blocks_operations_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_operations_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations" ADD CONSTRAINT "_pages_v_blocks_operations_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_operations_locales" ADD CONSTRAINT "_pages_v_blocks_operations_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_operations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_note_section" ADD CONSTRAINT "_pages_v_blocks_note_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_note_section_locales" ADD CONSTRAINT "_pages_v_blocks_note_section_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_note_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_row" ADD CONSTRAINT "_pages_v_blocks_button_row_primary_page_id_pages_id_fk" FOREIGN KEY ("primary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_row" ADD CONSTRAINT "_pages_v_blocks_button_row_secondary_page_id_pages_id_fk" FOREIGN KEY ("secondary_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_row" ADD CONSTRAINT "_pages_v_blocks_button_row_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_button_row_locales" ADD CONSTRAINT "_pages_v_blocks_button_row_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_button_row"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_brief_form_aside_points_order_idx" ON "pages_blocks_brief_form_aside_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_brief_form_aside_points_parent_id_idx" ON "pages_blocks_brief_form_aside_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_brief_form_aside_points_locales_locale_parent_i" ON "pages_blocks_brief_form_aside_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_operations_steps_order_idx" ON "pages_blocks_operations_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_operations_steps_parent_id_idx" ON "pages_blocks_operations_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_operations_steps_locales_locale_parent_id_uniqu" ON "pages_blocks_operations_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_operations_facts_order_idx" ON "pages_blocks_operations_facts" USING btree ("_order");
  CREATE INDEX "pages_blocks_operations_facts_parent_id_idx" ON "pages_blocks_operations_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_operations_facts_locales_locale_parent_id_uniqu" ON "pages_blocks_operations_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_operations_order_idx" ON "pages_blocks_operations" USING btree ("_order");
  CREATE INDEX "pages_blocks_operations_parent_id_idx" ON "pages_blocks_operations" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_operations_path_idx" ON "pages_blocks_operations" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_operations_locales_locale_parent_id_unique" ON "pages_blocks_operations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_note_section_order_idx" ON "pages_blocks_note_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_note_section_parent_id_idx" ON "pages_blocks_note_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_note_section_path_idx" ON "pages_blocks_note_section" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_blocks_note_section_locales_locale_parent_id_unique" ON "pages_blocks_note_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "pages_blocks_button_row_order_idx" ON "pages_blocks_button_row" USING btree ("_order");
  CREATE INDEX "pages_blocks_button_row_parent_id_idx" ON "pages_blocks_button_row" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_button_row_path_idx" ON "pages_blocks_button_row" USING btree ("_path");
  CREATE INDEX "pages_blocks_button_row_primary_primary_page_idx" ON "pages_blocks_button_row" USING btree ("primary_page_id");
  CREATE INDEX "pages_blocks_button_row_secondary_secondary_page_idx" ON "pages_blocks_button_row" USING btree ("secondary_page_id");
  CREATE UNIQUE INDEX "pages_blocks_button_row_locales_locale_parent_id_unique" ON "pages_blocks_button_row_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_brief_form_aside_points_order_idx" ON "_pages_v_blocks_brief_form_aside_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_brief_form_aside_points_parent_id_idx" ON "_pages_v_blocks_brief_form_aside_points" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_brief_form_aside_points_locales_locale_paren" ON "_pages_v_blocks_brief_form_aside_points_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_operations_steps_order_idx" ON "_pages_v_blocks_operations_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_operations_steps_parent_id_idx" ON "_pages_v_blocks_operations_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_operations_steps_locales_locale_parent_id_un" ON "_pages_v_blocks_operations_steps_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_operations_facts_order_idx" ON "_pages_v_blocks_operations_facts" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_operations_facts_parent_id_idx" ON "_pages_v_blocks_operations_facts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_operations_facts_locales_locale_parent_id_un" ON "_pages_v_blocks_operations_facts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_operations_order_idx" ON "_pages_v_blocks_operations" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_operations_parent_id_idx" ON "_pages_v_blocks_operations" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_operations_path_idx" ON "_pages_v_blocks_operations" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_operations_locales_locale_parent_id_unique" ON "_pages_v_blocks_operations_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_note_section_order_idx" ON "_pages_v_blocks_note_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_note_section_parent_id_idx" ON "_pages_v_blocks_note_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_note_section_path_idx" ON "_pages_v_blocks_note_section" USING btree ("_path");
  CREATE UNIQUE INDEX "_pages_v_blocks_note_section_locales_locale_parent_id_unique" ON "_pages_v_blocks_note_section_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_pages_v_blocks_button_row_order_idx" ON "_pages_v_blocks_button_row" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_button_row_parent_id_idx" ON "_pages_v_blocks_button_row" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_button_row_path_idx" ON "_pages_v_blocks_button_row" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_button_row_primary_primary_page_idx" ON "_pages_v_blocks_button_row" USING btree ("primary_page_id");
  CREATE INDEX "_pages_v_blocks_button_row_secondary_secondary_page_idx" ON "_pages_v_blocks_button_row" USING btree ("secondary_page_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_button_row_locales_locale_parent_id_unique" ON "_pages_v_blocks_button_row_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_blocks_contact_panel" ADD CONSTRAINT "pages_blocks_contact_panel_aside_project_cta_page_id_pages_id_fk" FOREIGN KEY ("aside_project_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD CONSTRAINT "_pages_v_blocks_contact_panel_aside_project_cta_page_id_pages_id_fk" FOREIGN KEY ("aside_project_cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_contact_panel_aside_project_cta_aside_proje_idx" ON "pages_blocks_contact_panel" USING btree ("aside_project_cta_page_id");
  CREATE INDEX "_pages_v_blocks_contact_panel_aside_project_cta_aside_pr_idx" ON "_pages_v_blocks_contact_panel" USING btree ("aside_project_cta_page_id");
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_kind";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_page_id";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_route_key";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_url";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_new_tab";
  ALTER TABLE "pages_blocks_services_teaser_locales" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_kind";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_page_id";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_route_key";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_url";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_new_tab";
  ALTER TABLE "_pages_v_blocks_services_teaser_locales" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "intro";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_cta_kind";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_cta_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_cta_kind";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_cta_route_key";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_teaser_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum_pages_blocks_services_teaser_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_cta_kind" AS ENUM('internal', 'external', 'whatsapp', 'phone', 'email');
  CREATE TYPE "public"."enum__pages_v_blocks_services_teaser_cta_route_key" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  ALTER TABLE "pages_blocks_brief_form_aside_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_brief_form_aside_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_operations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_note_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_note_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_button_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_button_row_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brief_form_aside_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brief_form_aside_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations_facts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_operations_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_note_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_note_section_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_button_row" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_button_row_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_brief_form_aside_points" CASCADE;
  DROP TABLE "pages_blocks_brief_form_aside_points_locales" CASCADE;
  DROP TABLE "pages_blocks_operations_steps" CASCADE;
  DROP TABLE "pages_blocks_operations_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_operations_facts" CASCADE;
  DROP TABLE "pages_blocks_operations_facts_locales" CASCADE;
  DROP TABLE "pages_blocks_operations" CASCADE;
  DROP TABLE "pages_blocks_operations_locales" CASCADE;
  DROP TABLE "pages_blocks_note_section" CASCADE;
  DROP TABLE "pages_blocks_note_section_locales" CASCADE;
  DROP TABLE "pages_blocks_button_row" CASCADE;
  DROP TABLE "pages_blocks_button_row_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_brief_form_aside_points" CASCADE;
  DROP TABLE "_pages_v_blocks_brief_form_aside_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_operations_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_operations_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_operations_facts" CASCADE;
  DROP TABLE "_pages_v_blocks_operations_facts_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_operations" CASCADE;
  DROP TABLE "_pages_v_blocks_operations_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_note_section" CASCADE;
  DROP TABLE "_pages_v_blocks_note_section_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_button_row" CASCADE;
  DROP TABLE "_pages_v_blocks_button_row_locales" CASCADE;
  ALTER TABLE "pages_blocks_contact_panel" DROP CONSTRAINT "pages_blocks_contact_panel_aside_project_cta_page_id_pages_id_fk";
  
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP CONSTRAINT "_pages_v_blocks_contact_panel_aside_project_cta_page_id_pages_id_fk";
  
  DROP INDEX "pages_blocks_contact_panel_aside_project_cta_aside_proje_idx";
  DROP INDEX "_pages_v_blocks_contact_panel_aside_project_cta_aside_pr_idx";
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_kind" "enum_pages_blocks_services_teaser_cta_kind" DEFAULT 'internal';
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_route_key" "enum_pages_blocks_services_teaser_cta_route_key";
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_new_tab" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_services_teaser_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_kind" "enum__pages_v_blocks_services_teaser_cta_kind" DEFAULT 'internal';
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_page_id" integer;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_route_key" "enum__pages_v_blocks_services_teaser_cta_route_key";
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_url" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_new_tab" boolean DEFAULT false;
  ALTER TABLE "_pages_v_blocks_services_teaser_locales" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD CONSTRAINT "pages_blocks_services_teaser_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD CONSTRAINT "_pages_v_blocks_services_teaser_cta_page_id_pages_id_fk" FOREIGN KEY ("cta_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_services_teaser_cta_cta_page_idx" ON "pages_blocks_services_teaser" USING btree ("cta_page_id");
  CREATE INDEX "_pages_v_blocks_services_teaser_cta_cta_page_idx" ON "_pages_v_blocks_services_teaser" USING btree ("cta_page_id");
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "variant";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "aside_project_cta_kind";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "aside_project_cta_page_id";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "aside_project_cta_route_key";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "aside_project_cta_url";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "aside_project_cta_new_tab";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "channels_heading";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "form_heading";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "form_help";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "aside_project_heading";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "aside_project_body";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "aside_project_cta_label";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "aside_directions_heading";
  ALTER TABLE "pages_blocks_contact_panel_locales" DROP COLUMN "aside_directions_body";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "aside_heading";
  ALTER TABLE "pages_blocks_brief_form_locales" DROP COLUMN "aside_note";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "variant";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "aside_project_cta_kind";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "aside_project_cta_page_id";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "aside_project_cta_route_key";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "aside_project_cta_url";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "aside_project_cta_new_tab";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "channels_heading";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "form_heading";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "form_help";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "aside_project_heading";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "aside_project_body";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "aside_project_cta_label";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "aside_directions_heading";
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DROP COLUMN "aside_directions_body";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "aside_heading";
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DROP COLUMN "aside_note";
  DROP TYPE "public"."enum_pages_blocks_page_header_variant";
  DROP TYPE "public"."enum_pages_blocks_rich_text_variant";
  DROP TYPE "public"."enum_pages_blocks_services_teaser_variant";
  DROP TYPE "public"."enum_pages_blocks_contact_panel_aside_project_cta_kind";
  DROP TYPE "public"."enum_pages_blocks_contact_panel_aside_project_cta_route_key";
  DROP TYPE "public"."enum_pages_blocks_operations_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_note_section_locale_visibility";
  DROP TYPE "public"."enum_pages_blocks_button_row_primary_kind";
  DROP TYPE "public"."enum_pages_blocks_button_row_primary_route_key";
  DROP TYPE "public"."enum_pages_blocks_button_row_secondary_kind";
  DROP TYPE "public"."enum_pages_blocks_button_row_secondary_route_key";
  DROP TYPE "public"."enum_pages_blocks_button_row_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_page_header_variant";
  DROP TYPE "public"."enum__pages_v_blocks_rich_text_variant";
  DROP TYPE "public"."enum__pages_v_blocks_services_teaser_variant";
  DROP TYPE "public"."enum__pages_v_blocks_contact_panel_aside_project_cta_kind";
  DROP TYPE "public"."enum__pages_v_blocks_contact_panel_aside_project_cta_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_operations_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_note_section_locale_visibility";
  DROP TYPE "public"."enum__pages_v_blocks_button_row_primary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_button_row_primary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_button_row_secondary_kind";
  DROP TYPE "public"."enum__pages_v_blocks_button_row_secondary_route_key";
  DROP TYPE "public"."enum__pages_v_blocks_button_row_locale_visibility";`)
}
