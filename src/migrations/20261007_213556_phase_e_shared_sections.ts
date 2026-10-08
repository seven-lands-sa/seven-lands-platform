import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "pages_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"title1" varchar,
  	"title2" varchar,
  	"title_accent" varchar,
  	"support" varchar,
  	"path_caption" varchar,
  	"whatsapp_line" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_page_header_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"lede" varchar,
  	"support" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_rich_text_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_legal_document_sections_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_legal_document_locales" (
  	"intro" varchar,
  	"draft_notice" varchar,
  	"last_updated_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_trust_statement_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_trust_statement_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_lands_system_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_problems_items_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_problems_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"explore" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_steps_locales" (
  	"label" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_process_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_why_items_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_why_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_services_teaser_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_work_teaser_empty_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_work_teaser_locales" (
  	"eyebrow" varchar,
  	"selected" varchar,
  	"all_work" varchar,
  	"work_page" varchar,
  	"empty_title" varchar,
  	"empty_body" varchar,
  	"primary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_cta_locales" (
  	"eyebrow" varchar,
  	"heading1" varchar,
  	"heading2" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_contact_panel_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_brief_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "pages_blocks_map_embed_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_locales" (
  	"eyebrow" varchar,
  	"title1" varchar,
  	"title2" varchar,
  	"title_accent" varchar,
  	"support" varchar,
  	"path_caption" varchar,
  	"whatsapp_line" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_page_header_locales" (
  	"eyebrow" varchar,
  	"title" varchar,
  	"lede" varchar,
  	"support" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_rich_text_locales" (
  	"heading" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_legal_document_sections_locales" (
  	"title" varchar,
  	"body" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_legal_document_locales" (
  	"intro" varchar,
  	"draft_notice" varchar,
  	"last_updated_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_trust_statement_facts_locales" (
  	"label" varchar,
  	"value" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_trust_statement_locales" (
  	"heading" varchar,
  	"body" varchar,
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_lands_system_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_problems_items_locales" (
  	"question" varchar,
  	"answer" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_problems_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"explore" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_locales" (
  	"label" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_process_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_why_items_locales" (
  	"title" varchar,
  	"body" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_why_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_services_teaser_locales" (
  	"eyebrow" varchar,
  	"heading" varchar,
  	"lede" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_work_teaser_empty_points_locales" (
  	"text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_work_teaser_locales" (
  	"eyebrow" varchar,
  	"selected" varchar,
  	"all_work" varchar,
  	"work_page" varchar,
  	"empty_title" varchar,
  	"empty_body" varchar,
  	"primary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_cta_locales" (
  	"eyebrow" varchar,
  	"heading1" varchar,
  	"heading2" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"secondary_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_contact_panel_locales" (
  	"heading" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_brief_form_locales" (
  	"heading" varchar,
  	"intro" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_map_embed_locales" (
  	"heading" varchar,
  	"note" varchar,
  	"cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  DROP INDEX "pages_blocks_hero_locale_idx";
  DROP INDEX "pages_blocks_page_header_locale_idx";
  DROP INDEX "pages_blocks_rich_text_locale_idx";
  DROP INDEX "pages_blocks_legal_document_sections_locale_idx";
  DROP INDEX "pages_blocks_legal_document_locale_idx";
  DROP INDEX "pages_blocks_trust_statement_facts_locale_idx";
  DROP INDEX "pages_blocks_trust_statement_locale_idx";
  DROP INDEX "pages_blocks_lands_system_locale_idx";
  DROP INDEX "pages_blocks_problems_items_locale_idx";
  DROP INDEX "pages_blocks_problems_locale_idx";
  DROP INDEX "pages_blocks_process_steps_locale_idx";
  DROP INDEX "pages_blocks_process_locale_idx";
  DROP INDEX "pages_blocks_why_items_locale_idx";
  DROP INDEX "pages_blocks_why_locale_idx";
  DROP INDEX "pages_blocks_services_teaser_locale_idx";
  DROP INDEX "pages_blocks_work_teaser_empty_points_locale_idx";
  DROP INDEX "pages_blocks_work_teaser_locale_idx";
  DROP INDEX "pages_blocks_cta_locale_idx";
  DROP INDEX "pages_blocks_contact_panel_locale_idx";
  DROP INDEX "pages_blocks_brief_form_locale_idx";
  DROP INDEX "pages_blocks_map_embed_locale_idx";
  DROP INDEX "_pages_v_blocks_hero_locale_idx";
  DROP INDEX "_pages_v_blocks_page_header_locale_idx";
  DROP INDEX "_pages_v_blocks_rich_text_locale_idx";
  DROP INDEX "_pages_v_blocks_legal_document_sections_locale_idx";
  DROP INDEX "_pages_v_blocks_legal_document_locale_idx";
  DROP INDEX "_pages_v_blocks_trust_statement_facts_locale_idx";
  DROP INDEX "_pages_v_blocks_trust_statement_locale_idx";
  DROP INDEX "_pages_v_blocks_lands_system_locale_idx";
  DROP INDEX "_pages_v_blocks_problems_items_locale_idx";
  DROP INDEX "_pages_v_blocks_problems_locale_idx";
  DROP INDEX "_pages_v_blocks_process_steps_locale_idx";
  DROP INDEX "_pages_v_blocks_process_locale_idx";
  DROP INDEX "_pages_v_blocks_why_items_locale_idx";
  DROP INDEX "_pages_v_blocks_why_locale_idx";
  DROP INDEX "_pages_v_blocks_services_teaser_locale_idx";
  DROP INDEX "_pages_v_blocks_work_teaser_empty_points_locale_idx";
  DROP INDEX "_pages_v_blocks_work_teaser_locale_idx";
  DROP INDEX "_pages_v_blocks_cta_locale_idx";
  DROP INDEX "_pages_v_blocks_contact_panel_locale_idx";
  DROP INDEX "_pages_v_blocks_brief_form_locale_idx";
  DROP INDEX "_pages_v_blocks_map_embed_locale_idx";
  ALTER TABLE "pages_blocks_hero_locales" ADD CONSTRAINT "pages_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_page_header_locales" ADD CONSTRAINT "pages_blocks_page_header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_page_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_rich_text_locales" ADD CONSTRAINT "pages_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_document_sections_locales" ADD CONSTRAINT "pages_blocks_legal_document_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_legal_document_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_legal_document_locales" ADD CONSTRAINT "pages_blocks_legal_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_legal_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_statement_facts_locales" ADD CONSTRAINT "pages_blocks_trust_statement_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_statement_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_trust_statement_locales" ADD CONSTRAINT "pages_blocks_trust_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_trust_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_lands_system_locales" ADD CONSTRAINT "pages_blocks_lands_system_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_lands_system"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_problems_items_locales" ADD CONSTRAINT "pages_blocks_problems_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_problems_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_problems_locales" ADD CONSTRAINT "pages_blocks_problems_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_locales" ADD CONSTRAINT "pages_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_locales" ADD CONSTRAINT "pages_blocks_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_items_locales" ADD CONSTRAINT "pages_blocks_why_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_why_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_why_locales" ADD CONSTRAINT "pages_blocks_why_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_why"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_teaser_locales" ADD CONSTRAINT "pages_blocks_services_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser_empty_points_locales" ADD CONSTRAINT "pages_blocks_work_teaser_empty_points_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_work_teaser_empty_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_work_teaser_locales" ADD CONSTRAINT "pages_blocks_work_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_work_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_locales" ADD CONSTRAINT "pages_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_panel_locales" ADD CONSTRAINT "pages_blocks_contact_panel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_contact_panel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_brief_form_locales" ADD CONSTRAINT "pages_blocks_brief_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_brief_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_map_embed_locales" ADD CONSTRAINT "pages_blocks_map_embed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_locales" ADD CONSTRAINT "_pages_v_blocks_hero_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_header_locales" ADD CONSTRAINT "_pages_v_blocks_page_header_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_page_header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" ADD CONSTRAINT "_pages_v_blocks_rich_text_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_rich_text"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_document_sections_locales" ADD CONSTRAINT "_pages_v_blocks_legal_document_sections_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_legal_document_sections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_legal_document_locales" ADD CONSTRAINT "_pages_v_blocks_legal_document_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_legal_document"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts_locales" ADD CONSTRAINT "_pages_v_blocks_trust_statement_facts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_statement_facts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_trust_statement_locales" ADD CONSTRAINT "_pages_v_blocks_trust_statement_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_trust_statement"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_lands_system_locales" ADD CONSTRAINT "_pages_v_blocks_lands_system_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_lands_system"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_problems_items_locales" ADD CONSTRAINT "_pages_v_blocks_problems_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_problems_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_problems_locales" ADD CONSTRAINT "_pages_v_blocks_problems_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_problems"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_locales" ADD CONSTRAINT "_pages_v_blocks_process_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_locales" ADD CONSTRAINT "_pages_v_blocks_process_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_items_locales" ADD CONSTRAINT "_pages_v_blocks_why_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_why_locales" ADD CONSTRAINT "_pages_v_blocks_why_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_why"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_teaser_locales" ADD CONSTRAINT "_pages_v_blocks_services_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points_locales" ADD CONSTRAINT "_pages_v_blocks_work_teaser_empty_points_locales_parent_i_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_work_teaser_empty_points"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_work_teaser_locales" ADD CONSTRAINT "_pages_v_blocks_work_teaser_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_work_teaser"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_cta_locales" ADD CONSTRAINT "_pages_v_blocks_cta_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" ADD CONSTRAINT "_pages_v_blocks_contact_panel_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_contact_panel"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" ADD CONSTRAINT "_pages_v_blocks_brief_form_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_brief_form"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_map_embed_locales" ADD CONSTRAINT "_pages_v_blocks_map_embed_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_map_embed"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "pages_blocks_hero_locales_locale_parent_id_unique" ON "pages_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_page_header_locales_locale_parent_id_unique" ON "pages_blocks_page_header_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_rich_text_locales_locale_parent_id_unique" ON "pages_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_legal_document_sections_locales_locale_parent_i" ON "pages_blocks_legal_document_sections_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_legal_document_locales_locale_parent_id_unique" ON "pages_blocks_legal_document_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_trust_statement_facts_locales_locale_parent_id_" ON "pages_blocks_trust_statement_facts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_trust_statement_locales_locale_parent_id_unique" ON "pages_blocks_trust_statement_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_lands_system_locales_locale_parent_id_unique" ON "pages_blocks_lands_system_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_problems_items_locales_locale_parent_id_unique" ON "pages_blocks_problems_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_problems_locales_locale_parent_id_unique" ON "pages_blocks_problems_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_process_steps_locales_locale_parent_id_unique" ON "pages_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_process_locales_locale_parent_id_unique" ON "pages_blocks_process_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_why_items_locales_locale_parent_id_unique" ON "pages_blocks_why_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_why_locales_locale_parent_id_unique" ON "pages_blocks_why_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_services_teaser_locales_locale_parent_id_unique" ON "pages_blocks_services_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_work_teaser_empty_points_locales_locale_parent_" ON "pages_blocks_work_teaser_empty_points_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_work_teaser_locales_locale_parent_id_unique" ON "pages_blocks_work_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_cta_locales_locale_parent_id_unique" ON "pages_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_contact_panel_locales_locale_parent_id_unique" ON "pages_blocks_contact_panel_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_brief_form_locales_locale_parent_id_unique" ON "pages_blocks_brief_form_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "pages_blocks_map_embed_locales_locale_parent_id_unique" ON "pages_blocks_map_embed_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_hero_locales_locale_parent_id_unique" ON "_pages_v_blocks_hero_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_page_header_locales_locale_parent_id_unique" ON "_pages_v_blocks_page_header_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_rich_text_locales_locale_parent_id_unique" ON "_pages_v_blocks_rich_text_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_legal_document_sections_locales_locale_paren" ON "_pages_v_blocks_legal_document_sections_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_legal_document_locales_locale_parent_id_uniq" ON "_pages_v_blocks_legal_document_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_trust_statement_facts_locales_locale_parent_" ON "_pages_v_blocks_trust_statement_facts_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_trust_statement_locales_locale_parent_id_uni" ON "_pages_v_blocks_trust_statement_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_lands_system_locales_locale_parent_id_unique" ON "_pages_v_blocks_lands_system_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_problems_items_locales_locale_parent_id_uniq" ON "_pages_v_blocks_problems_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_problems_locales_locale_parent_id_unique" ON "_pages_v_blocks_problems_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_steps_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_process_steps_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_process_locales_locale_parent_id_unique" ON "_pages_v_blocks_process_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_why_items_locales_locale_parent_id_unique" ON "_pages_v_blocks_why_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_why_locales_locale_parent_id_unique" ON "_pages_v_blocks_why_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_services_teaser_locales_locale_parent_id_uni" ON "_pages_v_blocks_services_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_work_teaser_empty_points_locales_locale_pare" ON "_pages_v_blocks_work_teaser_empty_points_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_work_teaser_locales_locale_parent_id_unique" ON "_pages_v_blocks_work_teaser_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_cta_locales_locale_parent_id_unique" ON "_pages_v_blocks_cta_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_contact_panel_locales_locale_parent_id_uniqu" ON "_pages_v_blocks_contact_panel_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_brief_form_locales_locale_parent_id_unique" ON "_pages_v_blocks_brief_form_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "_pages_v_blocks_map_embed_locales_locale_parent_id_unique" ON "_pages_v_blocks_map_embed_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "title1";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "title2";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "title_accent";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "support";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "path_caption";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "whatsapp_line";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "primary_label";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "secondary_label";
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_page_header" DROP COLUMN "support";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_rich_text" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_legal_document_sections" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_legal_document_sections" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_legal_document_sections" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_legal_document" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_legal_document" DROP COLUMN "intro";
  ALTER TABLE "pages_blocks_legal_document" DROP COLUMN "draft_notice";
  ALTER TABLE "pages_blocks_legal_document" DROP COLUMN "last_updated_label";
  ALTER TABLE "pages_blocks_trust_statement_facts" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_trust_statement_facts" DROP COLUMN "label";
  ALTER TABLE "pages_blocks_trust_statement_facts" DROP COLUMN "value";
  ALTER TABLE "pages_blocks_trust_statement" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_trust_statement" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_trust_statement" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_trust_statement" DROP COLUMN "note";
  ALTER TABLE "pages_blocks_lands_system" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_lands_system" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_lands_system" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_lands_system" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_problems_items" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_problems_items" DROP COLUMN "question";
  ALTER TABLE "pages_blocks_problems_items" DROP COLUMN "answer";
  ALTER TABLE "pages_blocks_problems" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_problems" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_problems" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_problems" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_problems" DROP COLUMN "explore";
  ALTER TABLE "pages_blocks_process_steps" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_process_steps" DROP COLUMN "label";
  ALTER TABLE "pages_blocks_process_steps" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_process" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_why_items" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_why_items" DROP COLUMN "title";
  ALTER TABLE "pages_blocks_why_items" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_why" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_why" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_why" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_why" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "lede";
  ALTER TABLE "pages_blocks_services_teaser" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_work_teaser_empty_points" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_work_teaser_empty_points" DROP COLUMN "text";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "selected";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "all_work";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "work_page";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "empty_title";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "empty_body";
  ALTER TABLE "pages_blocks_work_teaser" DROP COLUMN "primary_label";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "eyebrow";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "heading1";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "heading2";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "body";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "primary_label";
  ALTER TABLE "pages_blocks_cta" DROP COLUMN "secondary_label";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_contact_panel" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_brief_form" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_brief_form" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_brief_form" DROP COLUMN "intro";
  ALTER TABLE "pages_blocks_map_embed" DROP COLUMN "_locale";
  ALTER TABLE "pages_blocks_map_embed" DROP COLUMN "heading";
  ALTER TABLE "pages_blocks_map_embed" DROP COLUMN "note";
  ALTER TABLE "pages_blocks_map_embed" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "title1";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "title2";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "title_accent";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "support";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "path_caption";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "whatsapp_line";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "primary_label";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "secondary_label";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_page_header" DROP COLUMN "support";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_rich_text" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_legal_document_sections" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_legal_document_sections" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_legal_document_sections" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_legal_document" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_legal_document" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_legal_document" DROP COLUMN "draft_notice";
  ALTER TABLE "_pages_v_blocks_legal_document" DROP COLUMN "last_updated_label";
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" DROP COLUMN "label";
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" DROP COLUMN "value";
  ALTER TABLE "_pages_v_blocks_trust_statement" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_trust_statement" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_trust_statement" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_trust_statement" DROP COLUMN "note";
  ALTER TABLE "_pages_v_blocks_lands_system" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_lands_system" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_lands_system" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_lands_system" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_problems_items" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_problems_items" DROP COLUMN "question";
  ALTER TABLE "_pages_v_blocks_problems_items" DROP COLUMN "answer";
  ALTER TABLE "_pages_v_blocks_problems" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_problems" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_problems" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_problems" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_problems" DROP COLUMN "explore";
  ALTER TABLE "_pages_v_blocks_process_steps" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_process_steps" DROP COLUMN "label";
  ALTER TABLE "_pages_v_blocks_process_steps" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_process" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_why_items" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_why_items" DROP COLUMN "title";
  ALTER TABLE "_pages_v_blocks_why_items" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_why" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_why" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_why" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_why" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "lede";
  ALTER TABLE "_pages_v_blocks_services_teaser" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" DROP COLUMN "text";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "selected";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "all_work";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "work_page";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "empty_title";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "empty_body";
  ALTER TABLE "_pages_v_blocks_work_teaser" DROP COLUMN "primary_label";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "eyebrow";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "heading1";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "heading2";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "body";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "primary_label";
  ALTER TABLE "_pages_v_blocks_cta" DROP COLUMN "secondary_label";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_contact_panel" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_brief_form" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_brief_form" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_brief_form" DROP COLUMN "intro";
  ALTER TABLE "_pages_v_blocks_map_embed" DROP COLUMN "_locale";
  ALTER TABLE "_pages_v_blocks_map_embed" DROP COLUMN "heading";
  ALTER TABLE "_pages_v_blocks_map_embed" DROP COLUMN "note";
  ALTER TABLE "_pages_v_blocks_map_embed" DROP COLUMN "cta_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_page_header_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_legal_document_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_legal_document_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_statement_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_trust_statement_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_lands_system_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_problems_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_problems_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_why_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_teaser_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_teaser_empty_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_work_teaser_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_panel_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_brief_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_map_embed_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_hero_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_page_header_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_rich_text_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_legal_document_sections_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_legal_document_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_trust_statement_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_lands_system_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_problems_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_problems_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_why_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_teaser_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_work_teaser_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_cta_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_panel_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_brief_form_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_map_embed_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_hero_locales" CASCADE;
  DROP TABLE "pages_blocks_page_header_locales" CASCADE;
  DROP TABLE "pages_blocks_rich_text_locales" CASCADE;
  DROP TABLE "pages_blocks_legal_document_sections_locales" CASCADE;
  DROP TABLE "pages_blocks_legal_document_locales" CASCADE;
  DROP TABLE "pages_blocks_trust_statement_facts_locales" CASCADE;
  DROP TABLE "pages_blocks_trust_statement_locales" CASCADE;
  DROP TABLE "pages_blocks_lands_system_locales" CASCADE;
  DROP TABLE "pages_blocks_problems_items_locales" CASCADE;
  DROP TABLE "pages_blocks_problems_locales" CASCADE;
  DROP TABLE "pages_blocks_process_steps_locales" CASCADE;
  DROP TABLE "pages_blocks_process_locales" CASCADE;
  DROP TABLE "pages_blocks_why_items_locales" CASCADE;
  DROP TABLE "pages_blocks_why_locales" CASCADE;
  DROP TABLE "pages_blocks_services_teaser_locales" CASCADE;
  DROP TABLE "pages_blocks_work_teaser_empty_points_locales" CASCADE;
  DROP TABLE "pages_blocks_work_teaser_locales" CASCADE;
  DROP TABLE "pages_blocks_cta_locales" CASCADE;
  DROP TABLE "pages_blocks_contact_panel_locales" CASCADE;
  DROP TABLE "pages_blocks_brief_form_locales" CASCADE;
  DROP TABLE "pages_blocks_map_embed_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_page_header_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_rich_text_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_document_sections_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_legal_document_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_statement_facts_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_trust_statement_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_lands_system_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_problems_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_problems_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_process_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_why_items_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_why_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_services_teaser_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_work_teaser_empty_points_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_work_teaser_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_cta_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_panel_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_brief_form_locales" CASCADE;
  DROP TABLE "_pages_v_blocks_map_embed_locales" CASCADE;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "title1" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "title2" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "title_accent" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "support" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "path_caption" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "whatsapp_line" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "secondary_label" varchar;
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_page_header" ADD COLUMN "support" varchar;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_rich_text" ADD COLUMN "body" jsonb;
  ALTER TABLE "pages_blocks_legal_document_sections" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_legal_document_sections" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_legal_document_sections" ADD COLUMN "body" jsonb;
  ALTER TABLE "pages_blocks_legal_document" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_legal_document" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_blocks_legal_document" ADD COLUMN "draft_notice" varchar;
  ALTER TABLE "pages_blocks_legal_document" ADD COLUMN "last_updated_label" varchar;
  ALTER TABLE "pages_blocks_trust_statement_facts" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_trust_statement_facts" ADD COLUMN "label" varchar;
  ALTER TABLE "pages_blocks_trust_statement_facts" ADD COLUMN "value" varchar;
  ALTER TABLE "pages_blocks_trust_statement" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_trust_statement" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_trust_statement" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_blocks_trust_statement" ADD COLUMN "note" varchar;
  ALTER TABLE "pages_blocks_lands_system" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_lands_system" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_lands_system" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_lands_system" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_problems_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_problems_items" ADD COLUMN "question" varchar;
  ALTER TABLE "pages_blocks_problems_items" ADD COLUMN "answer" varchar;
  ALTER TABLE "pages_blocks_problems" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_problems" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_problems" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_problems" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_problems" ADD COLUMN "explore" varchar;
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "label" varchar;
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_blocks_process" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_process" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_process" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_process" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_why_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_why_items" ADD COLUMN "title" varchar;
  ALTER TABLE "pages_blocks_why_items" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_blocks_why" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_why" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_why" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_why" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "lede" varchar;
  ALTER TABLE "pages_blocks_services_teaser" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "pages_blocks_work_teaser_empty_points" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_work_teaser_empty_points" ADD COLUMN "text" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "selected" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "all_work" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "work_page" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "empty_title" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "empty_body" varchar;
  ALTER TABLE "pages_blocks_work_teaser" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "heading1" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "heading2" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "body" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "pages_blocks_cta" ADD COLUMN "secondary_label" varchar;
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_contact_panel" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_brief_form" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_brief_form" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_brief_form" ADD COLUMN "intro" varchar;
  ALTER TABLE "pages_blocks_map_embed" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "pages_blocks_map_embed" ADD COLUMN "heading" varchar;
  ALTER TABLE "pages_blocks_map_embed" ADD COLUMN "note" varchar;
  ALTER TABLE "pages_blocks_map_embed" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "title1" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "title2" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "title_accent" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "support" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "path_caption" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "whatsapp_line" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "secondary_label" varchar;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_page_header" ADD COLUMN "support" varchar;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN "body" jsonb;
  ALTER TABLE "_pages_v_blocks_legal_document_sections" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_legal_document_sections" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_legal_document_sections" ADD COLUMN "body" jsonb;
  ALTER TABLE "_pages_v_blocks_legal_document" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_legal_document" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_blocks_legal_document" ADD COLUMN "draft_notice" varchar;
  ALTER TABLE "_pages_v_blocks_legal_document" ADD COLUMN "last_updated_label" varchar;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_blocks_trust_statement_facts" ADD COLUMN "value" varchar;
  ALTER TABLE "_pages_v_blocks_trust_statement" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_trust_statement" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_trust_statement" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_blocks_trust_statement" ADD COLUMN "note" varchar;
  ALTER TABLE "_pages_v_blocks_lands_system" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_lands_system" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_lands_system" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_lands_system" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_problems_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_problems_items" ADD COLUMN "question" varchar;
  ALTER TABLE "_pages_v_blocks_problems_items" ADD COLUMN "answer" varchar;
  ALTER TABLE "_pages_v_blocks_problems" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_problems" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_problems" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_problems" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_problems" ADD COLUMN "explore" varchar;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "label" varchar;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_process" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_why_items" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_why_items" ADD COLUMN "title" varchar;
  ALTER TABLE "_pages_v_blocks_why_items" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_blocks_why" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_why" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_why" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_why" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "lede" varchar;
  ALTER TABLE "_pages_v_blocks_services_teaser" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_work_teaser_empty_points" ADD COLUMN "text" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "selected" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "all_work" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "work_page" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "empty_title" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "empty_body" varchar;
  ALTER TABLE "_pages_v_blocks_work_teaser" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "eyebrow" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "heading1" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "heading2" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "body" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "primary_label" varchar;
  ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN "secondary_label" varchar;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_contact_panel" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_brief_form" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_brief_form" ADD COLUMN "intro" varchar;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD COLUMN "_locale" "_locales" NOT NULL;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD COLUMN "heading" varchar;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD COLUMN "note" varchar;
  ALTER TABLE "_pages_v_blocks_map_embed" ADD COLUMN "cta_label" varchar;
  CREATE INDEX "pages_blocks_hero_locale_idx" ON "pages_blocks_hero" USING btree ("_locale");
  CREATE INDEX "pages_blocks_page_header_locale_idx" ON "pages_blocks_page_header" USING btree ("_locale");
  CREATE INDEX "pages_blocks_rich_text_locale_idx" ON "pages_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "pages_blocks_legal_document_sections_locale_idx" ON "pages_blocks_legal_document_sections" USING btree ("_locale");
  CREATE INDEX "pages_blocks_legal_document_locale_idx" ON "pages_blocks_legal_document" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_statement_facts_locale_idx" ON "pages_blocks_trust_statement_facts" USING btree ("_locale");
  CREATE INDEX "pages_blocks_trust_statement_locale_idx" ON "pages_blocks_trust_statement" USING btree ("_locale");
  CREATE INDEX "pages_blocks_lands_system_locale_idx" ON "pages_blocks_lands_system" USING btree ("_locale");
  CREATE INDEX "pages_blocks_problems_items_locale_idx" ON "pages_blocks_problems_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_problems_locale_idx" ON "pages_blocks_problems" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_steps_locale_idx" ON "pages_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "pages_blocks_process_locale_idx" ON "pages_blocks_process" USING btree ("_locale");
  CREATE INDEX "pages_blocks_why_items_locale_idx" ON "pages_blocks_why_items" USING btree ("_locale");
  CREATE INDEX "pages_blocks_why_locale_idx" ON "pages_blocks_why" USING btree ("_locale");
  CREATE INDEX "pages_blocks_services_teaser_locale_idx" ON "pages_blocks_services_teaser" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_teaser_empty_points_locale_idx" ON "pages_blocks_work_teaser_empty_points" USING btree ("_locale");
  CREATE INDEX "pages_blocks_work_teaser_locale_idx" ON "pages_blocks_work_teaser" USING btree ("_locale");
  CREATE INDEX "pages_blocks_cta_locale_idx" ON "pages_blocks_cta" USING btree ("_locale");
  CREATE INDEX "pages_blocks_contact_panel_locale_idx" ON "pages_blocks_contact_panel" USING btree ("_locale");
  CREATE INDEX "pages_blocks_brief_form_locale_idx" ON "pages_blocks_brief_form" USING btree ("_locale");
  CREATE INDEX "pages_blocks_map_embed_locale_idx" ON "pages_blocks_map_embed" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_hero_locale_idx" ON "_pages_v_blocks_hero" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_page_header_locale_idx" ON "_pages_v_blocks_page_header" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_rich_text_locale_idx" ON "_pages_v_blocks_rich_text" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_legal_document_sections_locale_idx" ON "_pages_v_blocks_legal_document_sections" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_legal_document_locale_idx" ON "_pages_v_blocks_legal_document" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_statement_facts_locale_idx" ON "_pages_v_blocks_trust_statement_facts" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_trust_statement_locale_idx" ON "_pages_v_blocks_trust_statement" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_lands_system_locale_idx" ON "_pages_v_blocks_lands_system" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_problems_items_locale_idx" ON "_pages_v_blocks_problems_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_problems_locale_idx" ON "_pages_v_blocks_problems" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_steps_locale_idx" ON "_pages_v_blocks_process_steps" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_process_locale_idx" ON "_pages_v_blocks_process" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_why_items_locale_idx" ON "_pages_v_blocks_why_items" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_why_locale_idx" ON "_pages_v_blocks_why" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_services_teaser_locale_idx" ON "_pages_v_blocks_services_teaser" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_teaser_empty_points_locale_idx" ON "_pages_v_blocks_work_teaser_empty_points" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_work_teaser_locale_idx" ON "_pages_v_blocks_work_teaser" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_cta_locale_idx" ON "_pages_v_blocks_cta" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_contact_panel_locale_idx" ON "_pages_v_blocks_contact_panel" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_brief_form_locale_idx" ON "_pages_v_blocks_brief_form" USING btree ("_locale");
  CREATE INDEX "_pages_v_blocks_map_embed_locale_idx" ON "_pages_v_blocks_map_embed" USING btree ("_locale");`)
}
