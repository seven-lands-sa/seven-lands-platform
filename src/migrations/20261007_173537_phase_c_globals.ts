import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_media_visibility" AS ENUM('private', 'public');
  CREATE TYPE "public"."enum_site_settings_localization_enabled_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_site_settings_localization_default_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__site_settings_v_version_localization_enabled_locales" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum__site_settings_v_version_localization_default_locale" AS ENUM('ar', 'en');
  CREATE TYPE "public"."enum_contact_settings_channels_type" AS ENUM('phone', 'whatsapp', 'email', 'custom');
  CREATE TYPE "public"."enum__contact_settings_v_version_channels_type" AS ENUM('phone', 'whatsapp', 'email', 'custom');
  CREATE TYPE "public"."enum_business_hours_week_day" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
  CREATE TYPE "public"."enum__business_hours_v_version_week_day" AS ENUM('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');
  CREATE TYPE "public"."enum_social_accounts_accounts_platform" AS ENUM('instagram', 'x', 'tiktok', 'snapchat', 'linkedin', 'youtube', 'facebook', 'threads', 'whatsapp', 'telegram', 'behance', 'dribbble', 'github', 'custom');
  CREATE TYPE "public"."enum__social_accounts_v_version_accounts_platform" AS ENUM('instagram', 'x', 'tiktok', 'snapchat', 'linkedin', 'youtube', 'facebook', 'threads', 'whatsapp', 'telegram', 'behance', 'dribbble', 'github', 'custom');
  CREATE TYPE "public"."enum_navigation_header_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_header_items_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_navigation_header_cta_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_navigation_header_cta_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__navigation_v_version_header_items_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__navigation_v_version_header_cta_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__navigation_v_version_header_cta_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_footer_groups_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_groups_items_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum_footer_legal_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum_footer_legal_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__footer_v_version_groups_items_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__footer_v_version_groups_items_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  CREATE TYPE "public"."enum__footer_v_version_legal_link_type" AS ENUM('internal', 'external');
  CREATE TYPE "public"."enum__footer_v_version_legal_route" AS ENUM('home', 'services', 'work', 'about', 'insights', 'contact', 'start-a-project', 'privacy', 'terms', 'capability:strategy-business-growth', 'capability:branding-creative', 'capability:content-production', 'capability:social-digital-presence', 'capability:performance-acquisition', 'capability:web-commerce-experiences', 'capability:software-automation-technology');
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'settings_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'contact_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'hours_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'social_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'navigation_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'footer_updated';
  ALTER TYPE "public"."enum_audit_events_action" ADD VALUE 'media_visibility_changed';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'site-settings';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'contact-settings';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'business-hours';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'social-accounts';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'navigation';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'footer';
  ALTER TYPE "public"."enum_audit_events_resource_type" ADD VALUE 'media';
  CREATE TABLE "site_settings_localization_enabled_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_site_settings_localization_enabled_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"brand_name_ar" varchar NOT NULL,
  	"brand_name_en" varchar NOT NULL,
  	"brand_logo_id" integer,
  	"brand_logo_light_id" integer,
  	"brand_logo_dark_id" integer,
  	"brand_favicon_id" integer,
  	"brand_default_og_image_id" integer,
  	"localization_default_locale" "enum_site_settings_localization_default_locale" DEFAULT 'ar',
  	"localization_timezone" varchar DEFAULT 'Asia/Riyadh' NOT NULL,
  	"location_country_code" varchar DEFAULT 'SA',
  	"location_maps_url" varchar,
  	"location_latitude" numeric,
  	"location_longitude" numeric,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "site_settings_locales" (
  	"brand_short_description" varchar,
  	"location_display" varchar,
  	"location_city" varchar,
  	"location_region" varchar,
  	"general_business_category" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_version_localization_enabled_locales" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__site_settings_v_version_localization_enabled_locales",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_brand_name_ar" varchar NOT NULL,
  	"version_brand_name_en" varchar NOT NULL,
  	"version_brand_logo_id" integer,
  	"version_brand_logo_light_id" integer,
  	"version_brand_logo_dark_id" integer,
  	"version_brand_favicon_id" integer,
  	"version_brand_default_og_image_id" integer,
  	"version_localization_default_locale" "enum__site_settings_v_version_localization_default_locale" DEFAULT 'ar',
  	"version_localization_timezone" varchar DEFAULT 'Asia/Riyadh' NOT NULL,
  	"version_location_country_code" varchar DEFAULT 'SA',
  	"version_location_maps_url" varchar,
  	"version_location_latitude" numeric,
  	"version_location_longitude" numeric,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_site_settings_v_locales" (
  	"version_brand_short_description" varchar,
  	"version_location_display" varchar,
  	"version_location_city" varchar,
  	"version_location_region" varchar,
  	"version_general_business_category" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "contact_settings_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_contact_settings_channels_type" DEFAULT 'phone' NOT NULL,
  	"value" varchar NOT NULL,
  	"href_override" varchar,
  	"icon" varchar,
  	"is_primary" boolean DEFAULT false,
  	"enabled" boolean DEFAULT true,
  	"normalized" varchar
  );
  
  CREATE TABLE "contact_settings_channels_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "contact_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_contact_settings_v_version_channels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"type" "enum__contact_settings_v_version_channels_type" DEFAULT 'phone' NOT NULL,
  	"value" varchar NOT NULL,
  	"href_override" varchar,
  	"icon" varchar,
  	"is_primary" boolean DEFAULT false,
  	"enabled" boolean DEFAULT true,
  	"normalized" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_contact_settings_v_version_channels_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_contact_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "business_hours_week_periods" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar
  );
  
  CREATE TABLE "business_hours_week" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"day" "enum_business_hours_week_day" NOT NULL,
  	"closed" boolean DEFAULT false,
  	"all_day" boolean DEFAULT false
  );
  
  CREATE TABLE "business_hours_week_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "business_hours_exceptions_periods" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar
  );
  
  CREATE TABLE "business_hours_exceptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"closed" boolean DEFAULT false
  );
  
  CREATE TABLE "business_hours_exceptions_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "business_hours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "business_hours_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_business_hours_v_version_week_periods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_business_hours_v_version_week" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"day" "enum__business_hours_v_version_week_day" NOT NULL,
  	"closed" boolean DEFAULT false,
  	"all_day" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_business_hours_v_version_week_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_business_hours_v_version_exceptions_periods" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar,
  	"to" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_business_hours_v_version_exceptions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"closed" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_business_hours_v_version_exceptions_locales" (
  	"note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_business_hours_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_business_hours_v_locales" (
  	"version_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "social_accounts_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_social_accounts_accounts_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"handle" varchar,
  	"icon_key" varchar,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "social_accounts_accounts_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "social_accounts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "_social_accounts_v_version_accounts" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__social_accounts_v_version_accounts_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"handle" varchar,
  	"icon_key" varchar,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_social_accounts_v_version_accounts_locales" (
  	"label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_social_accounts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "navigation_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_navigation_header_items_link_type" DEFAULT 'internal',
  	"route" "enum_navigation_header_items_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "navigation_header_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "navigation" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"header_cta_enabled" boolean DEFAULT true,
  	"header_cta_link_type" "enum_navigation_header_cta_link_type" DEFAULT 'internal',
  	"header_cta_route" "enum_navigation_header_cta_route",
  	"header_cta_url" varchar,
  	"header_cta_new_tab" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "navigation_locales" (
  	"header_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v_version_header_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__navigation_v_version_header_items_link_type" DEFAULT 'internal',
  	"route" "enum__navigation_v_version_header_items_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_navigation_v_version_header_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_navigation_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_header_cta_enabled" boolean DEFAULT true,
  	"version_header_cta_link_type" "enum__navigation_v_version_header_cta_link_type" DEFAULT 'internal',
  	"version_header_cta_route" "enum__navigation_v_version_header_cta_route",
  	"version_header_cta_url" varchar,
  	"version_header_cta_new_tab" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_navigation_v_locales" (
  	"version_header_cta_label" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "footer_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"marker" varchar,
  	"link_type" "enum_footer_groups_items_link_type" DEFAULT 'internal',
  	"route" "enum_footer_groups_items_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "footer_groups_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "footer_groups_locales" (
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_footer_legal_link_type" DEFAULT 'internal',
  	"route" "enum_footer_legal_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true
  );
  
  CREATE TABLE "footer_legal_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"show_contact" boolean DEFAULT true,
  	"show_social" boolean DEFAULT true,
  	"copyright_owner" varchar DEFAULT 'Seven Lands' NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "footer_locales" (
  	"statement" varchar,
  	"copyright_rights_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_groups_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"marker" varchar,
  	"link_type" "enum__footer_v_version_groups_items_link_type" DEFAULT 'internal',
  	"route" "enum__footer_v_version_groups_items_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_groups_items_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_groups_locales" (
  	"heading" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v_version_legal" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__footer_v_version_legal_link_type" DEFAULT 'internal',
  	"route" "enum__footer_v_version_legal_route",
  	"url" varchar,
  	"new_tab" boolean DEFAULT true,
  	"enabled" boolean DEFAULT true,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_footer_v_version_legal_locales" (
  	"label" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_footer_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_show_contact" boolean DEFAULT true,
  	"version_show_social" boolean DEFAULT true,
  	"version_copyright_owner" varchar DEFAULT 'Seven Lands' NOT NULL,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_footer_v_locales" (
  	"version_statement" varchar,
  	"version_copyright_rights_text" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "roles" ADD COLUMN "settings_general_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "settings_contact_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "settings_hours_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "settings_social_update" boolean DEFAULT false;
  ALTER TABLE "roles" ADD COLUMN "settings_navigation_update" boolean DEFAULT false;
  ALTER TABLE "media" ADD COLUMN "visibility" "enum_media_visibility" DEFAULT 'private' NOT NULL;
  ALTER TABLE "site_settings_localization_enabled_locales" ADD CONSTRAINT "site_settings_localization_enabled_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_id_media_id_fk" FOREIGN KEY ("brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_light_id_media_id_fk" FOREIGN KEY ("brand_logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_logo_dark_id_media_id_fk" FOREIGN KEY ("brand_logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_favicon_id_media_id_fk" FOREIGN KEY ("brand_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_brand_default_og_image_id_media_id_fk" FOREIGN KEY ("brand_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "site_settings_locales" ADD CONSTRAINT "site_settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_localization_enabled_locales" ADD CONSTRAINT "_site_settings_v_version_localization_enabled_locales_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_logo_id_media_id_fk" FOREIGN KEY ("version_brand_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_logo_light_id_media_id_fk" FOREIGN KEY ("version_brand_logo_light_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_logo_dark_id_media_id_fk" FOREIGN KEY ("version_brand_logo_dark_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_favicon_id_media_id_fk" FOREIGN KEY ("version_brand_favicon_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v" ADD CONSTRAINT "_site_settings_v_version_brand_default_og_image_id_media_id_fk" FOREIGN KEY ("version_brand_default_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_site_settings_v_locales" ADD CONSTRAINT "_site_settings_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_settings_channels" ADD CONSTRAINT "contact_settings_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "contact_settings_channels_locales" ADD CONSTRAINT "contact_settings_channels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."contact_settings_channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_settings_v_version_channels" ADD CONSTRAINT "_contact_settings_v_version_channels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_contact_settings_v_version_channels_locales" ADD CONSTRAINT "_contact_settings_v_version_channels_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_contact_settings_v_version_channels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_week_periods" ADD CONSTRAINT "business_hours_week_periods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours_week"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_week" ADD CONSTRAINT "business_hours_week_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_week_locales" ADD CONSTRAINT "business_hours_week_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours_week"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_exceptions_periods" ADD CONSTRAINT "business_hours_exceptions_periods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_exceptions" ADD CONSTRAINT "business_hours_exceptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_exceptions_locales" ADD CONSTRAINT "business_hours_exceptions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "business_hours_locales" ADD CONSTRAINT "business_hours_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."business_hours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_week_periods" ADD CONSTRAINT "_business_hours_v_version_week_periods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v_version_week"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_week" ADD CONSTRAINT "_business_hours_v_version_week_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_week_locales" ADD CONSTRAINT "_business_hours_v_version_week_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v_version_week"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_exceptions_periods" ADD CONSTRAINT "_business_hours_v_version_exceptions_periods_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v_version_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_exceptions" ADD CONSTRAINT "_business_hours_v_version_exceptions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_version_exceptions_locales" ADD CONSTRAINT "_business_hours_v_version_exceptions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v_version_exceptions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_business_hours_v_locales" ADD CONSTRAINT "_business_hours_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_business_hours_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_accounts_accounts" ADD CONSTRAINT "social_accounts_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_accounts_accounts_locales" ADD CONSTRAINT "social_accounts_accounts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_accounts_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_social_accounts_v_version_accounts" ADD CONSTRAINT "_social_accounts_v_version_accounts_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_social_accounts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_social_accounts_v_version_accounts_locales" ADD CONSTRAINT "_social_accounts_v_version_accounts_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_social_accounts_v_version_accounts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items" ADD CONSTRAINT "navigation_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_header_items_locales" ADD CONSTRAINT "navigation_header_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation_header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "navigation_locales" ADD CONSTRAINT "navigation_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."navigation"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items" ADD CONSTRAINT "_navigation_v_version_header_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_version_header_items_locales" ADD CONSTRAINT "_navigation_v_version_header_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v_version_header_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_navigation_v_locales" ADD CONSTRAINT "_navigation_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_navigation_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups_items" ADD CONSTRAINT "footer_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups_items_locales" ADD CONSTRAINT "footer_groups_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_groups_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups" ADD CONSTRAINT "footer_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_groups_locales" ADD CONSTRAINT "footer_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal" ADD CONSTRAINT "footer_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_locales" ADD CONSTRAINT "footer_legal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_legal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_locales" ADD CONSTRAINT "footer_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups_items" ADD CONSTRAINT "_footer_v_version_groups_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups_items_locales" ADD CONSTRAINT "_footer_v_version_groups_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_groups_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups" ADD CONSTRAINT "_footer_v_version_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_groups_locales" ADD CONSTRAINT "_footer_v_version_groups_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_groups"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal" ADD CONSTRAINT "_footer_v_version_legal_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_version_legal_locales" ADD CONSTRAINT "_footer_v_version_legal_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v_version_legal"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_footer_v_locales" ADD CONSTRAINT "_footer_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_footer_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_localization_enabled_locales_order_idx" ON "site_settings_localization_enabled_locales" USING btree ("order");
  CREATE INDEX "site_settings_localization_enabled_locales_parent_idx" ON "site_settings_localization_enabled_locales" USING btree ("parent_id");
  CREATE INDEX "site_settings_brand_brand_logo_idx" ON "site_settings" USING btree ("brand_logo_id");
  CREATE INDEX "site_settings_brand_brand_logo_light_idx" ON "site_settings" USING btree ("brand_logo_light_id");
  CREATE INDEX "site_settings_brand_brand_logo_dark_idx" ON "site_settings" USING btree ("brand_logo_dark_id");
  CREATE INDEX "site_settings_brand_brand_favicon_idx" ON "site_settings" USING btree ("brand_favicon_id");
  CREATE INDEX "site_settings_brand_brand_default_og_image_idx" ON "site_settings" USING btree ("brand_default_og_image_id");
  CREATE UNIQUE INDEX "site_settings_locales_locale_parent_id_unique" ON "site_settings_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_site_settings_v_version_localization_enabled_locales_order_idx" ON "_site_settings_v_version_localization_enabled_locales" USING btree ("order");
  CREATE INDEX "_site_settings_v_version_localization_enabled_locales_parent_idx" ON "_site_settings_v_version_localization_enabled_locales" USING btree ("parent_id");
  CREATE INDEX "_site_settings_v_version_brand_version_brand_logo_idx" ON "_site_settings_v" USING btree ("version_brand_logo_id");
  CREATE INDEX "_site_settings_v_version_brand_version_brand_logo_light_idx" ON "_site_settings_v" USING btree ("version_brand_logo_light_id");
  CREATE INDEX "_site_settings_v_version_brand_version_brand_logo_dark_idx" ON "_site_settings_v" USING btree ("version_brand_logo_dark_id");
  CREATE INDEX "_site_settings_v_version_brand_version_brand_favicon_idx" ON "_site_settings_v" USING btree ("version_brand_favicon_id");
  CREATE INDEX "_site_settings_v_version_brand_version_brand_default_og__idx" ON "_site_settings_v" USING btree ("version_brand_default_og_image_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_site_settings_v_locales_locale_parent_id_unique" ON "_site_settings_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "contact_settings_channels_order_idx" ON "contact_settings_channels" USING btree ("_order");
  CREATE INDEX "contact_settings_channels_parent_id_idx" ON "contact_settings_channels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "contact_settings_channels_locales_locale_parent_id_unique" ON "contact_settings_channels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_settings_v_version_channels_order_idx" ON "_contact_settings_v_version_channels" USING btree ("_order");
  CREATE INDEX "_contact_settings_v_version_channels_parent_id_idx" ON "_contact_settings_v_version_channels" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_contact_settings_v_version_channels_locales_locale_parent_i" ON "_contact_settings_v_version_channels_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_contact_settings_v_created_at_idx" ON "_contact_settings_v" USING btree ("created_at");
  CREATE INDEX "_contact_settings_v_updated_at_idx" ON "_contact_settings_v" USING btree ("updated_at");
  CREATE INDEX "business_hours_week_periods_order_idx" ON "business_hours_week_periods" USING btree ("_order");
  CREATE INDEX "business_hours_week_periods_parent_id_idx" ON "business_hours_week_periods" USING btree ("_parent_id");
  CREATE INDEX "business_hours_week_order_idx" ON "business_hours_week" USING btree ("_order");
  CREATE INDEX "business_hours_week_parent_id_idx" ON "business_hours_week" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "business_hours_week_locales_locale_parent_id_unique" ON "business_hours_week_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "business_hours_exceptions_periods_order_idx" ON "business_hours_exceptions_periods" USING btree ("_order");
  CREATE INDEX "business_hours_exceptions_periods_parent_id_idx" ON "business_hours_exceptions_periods" USING btree ("_parent_id");
  CREATE INDEX "business_hours_exceptions_order_idx" ON "business_hours_exceptions" USING btree ("_order");
  CREATE INDEX "business_hours_exceptions_parent_id_idx" ON "business_hours_exceptions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "business_hours_exceptions_locales_locale_parent_id_unique" ON "business_hours_exceptions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "business_hours_locales_locale_parent_id_unique" ON "business_hours_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_business_hours_v_version_week_periods_order_idx" ON "_business_hours_v_version_week_periods" USING btree ("_order");
  CREATE INDEX "_business_hours_v_version_week_periods_parent_id_idx" ON "_business_hours_v_version_week_periods" USING btree ("_parent_id");
  CREATE INDEX "_business_hours_v_version_week_order_idx" ON "_business_hours_v_version_week" USING btree ("_order");
  CREATE INDEX "_business_hours_v_version_week_parent_id_idx" ON "_business_hours_v_version_week" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_business_hours_v_version_week_locales_locale_parent_id_uniq" ON "_business_hours_v_version_week_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_business_hours_v_version_exceptions_periods_order_idx" ON "_business_hours_v_version_exceptions_periods" USING btree ("_order");
  CREATE INDEX "_business_hours_v_version_exceptions_periods_parent_id_idx" ON "_business_hours_v_version_exceptions_periods" USING btree ("_parent_id");
  CREATE INDEX "_business_hours_v_version_exceptions_order_idx" ON "_business_hours_v_version_exceptions" USING btree ("_order");
  CREATE INDEX "_business_hours_v_version_exceptions_parent_id_idx" ON "_business_hours_v_version_exceptions" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_business_hours_v_version_exceptions_locales_locale_parent_i" ON "_business_hours_v_version_exceptions_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_business_hours_v_created_at_idx" ON "_business_hours_v" USING btree ("created_at");
  CREATE INDEX "_business_hours_v_updated_at_idx" ON "_business_hours_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_business_hours_v_locales_locale_parent_id_unique" ON "_business_hours_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "social_accounts_accounts_order_idx" ON "social_accounts_accounts" USING btree ("_order");
  CREATE INDEX "social_accounts_accounts_parent_id_idx" ON "social_accounts_accounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "social_accounts_accounts_locales_locale_parent_id_unique" ON "social_accounts_accounts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_social_accounts_v_version_accounts_order_idx" ON "_social_accounts_v_version_accounts" USING btree ("_order");
  CREATE INDEX "_social_accounts_v_version_accounts_parent_id_idx" ON "_social_accounts_v_version_accounts" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_social_accounts_v_version_accounts_locales_locale_parent_id" ON "_social_accounts_v_version_accounts_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_social_accounts_v_created_at_idx" ON "_social_accounts_v" USING btree ("created_at");
  CREATE INDEX "_social_accounts_v_updated_at_idx" ON "_social_accounts_v" USING btree ("updated_at");
  CREATE INDEX "navigation_header_items_order_idx" ON "navigation_header_items" USING btree ("_order");
  CREATE INDEX "navigation_header_items_parent_id_idx" ON "navigation_header_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "navigation_header_items_locales_locale_parent_id_unique" ON "navigation_header_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "navigation_locales_locale_parent_id_unique" ON "navigation_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_version_header_items_order_idx" ON "_navigation_v_version_header_items" USING btree ("_order");
  CREATE INDEX "_navigation_v_version_header_items_parent_id_idx" ON "_navigation_v_version_header_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_navigation_v_version_header_items_locales_locale_parent_id_" ON "_navigation_v_version_header_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_navigation_v_created_at_idx" ON "_navigation_v" USING btree ("created_at");
  CREATE INDEX "_navigation_v_updated_at_idx" ON "_navigation_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_navigation_v_locales_locale_parent_id_unique" ON "_navigation_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_groups_items_order_idx" ON "footer_groups_items" USING btree ("_order");
  CREATE INDEX "footer_groups_items_parent_id_idx" ON "footer_groups_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_groups_items_locales_locale_parent_id_unique" ON "footer_groups_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_groups_order_idx" ON "footer_groups" USING btree ("_order");
  CREATE INDEX "footer_groups_parent_id_idx" ON "footer_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_groups_locales_locale_parent_id_unique" ON "footer_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "footer_legal_order_idx" ON "footer_legal" USING btree ("_order");
  CREATE INDEX "footer_legal_parent_id_idx" ON "footer_legal" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "footer_legal_locales_locale_parent_id_unique" ON "footer_legal_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "footer_locales_locale_parent_id_unique" ON "footer_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_groups_items_order_idx" ON "_footer_v_version_groups_items" USING btree ("_order");
  CREATE INDEX "_footer_v_version_groups_items_parent_id_idx" ON "_footer_v_version_groups_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_groups_items_locales_locale_parent_id_uniq" ON "_footer_v_version_groups_items_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_groups_order_idx" ON "_footer_v_version_groups" USING btree ("_order");
  CREATE INDEX "_footer_v_version_groups_parent_id_idx" ON "_footer_v_version_groups" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_groups_locales_locale_parent_id_unique" ON "_footer_v_version_groups_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_version_legal_order_idx" ON "_footer_v_version_legal" USING btree ("_order");
  CREATE INDEX "_footer_v_version_legal_parent_id_idx" ON "_footer_v_version_legal" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_footer_v_version_legal_locales_locale_parent_id_unique" ON "_footer_v_version_legal_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_footer_v_created_at_idx" ON "_footer_v" USING btree ("created_at");
  CREATE INDEX "_footer_v_updated_at_idx" ON "_footer_v" USING btree ("updated_at");
  CREATE UNIQUE INDEX "_footer_v_locales_locale_parent_id_unique" ON "_footer_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "media_visibility_idx" ON "media" USING btree ("visibility");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings_localization_enabled_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "site_settings_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_localization_enabled_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_settings_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_settings_channels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "contact_settings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_settings_v_version_channels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_settings_v_version_channels_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contact_settings_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_week_periods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_week" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_week_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_exceptions_periods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_exceptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_exceptions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "business_hours_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_week_periods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_week" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_week_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_exceptions_periods" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_exceptions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_version_exceptions_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_business_hours_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_accounts_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_accounts_accounts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_social_accounts_v_version_accounts" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_social_accounts_v_version_accounts_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_social_accounts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_header_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "navigation_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_version_header_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_version_header_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_navigation_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups_items_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_groups_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_version_legal_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_footer_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "site_settings_localization_enabled_locales" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TABLE "site_settings_locales" CASCADE;
  DROP TABLE "_site_settings_v_version_localization_enabled_locales" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP TABLE "_site_settings_v_locales" CASCADE;
  DROP TABLE "contact_settings_channels" CASCADE;
  DROP TABLE "contact_settings_channels_locales" CASCADE;
  DROP TABLE "contact_settings" CASCADE;
  DROP TABLE "_contact_settings_v_version_channels" CASCADE;
  DROP TABLE "_contact_settings_v_version_channels_locales" CASCADE;
  DROP TABLE "_contact_settings_v" CASCADE;
  DROP TABLE "business_hours_week_periods" CASCADE;
  DROP TABLE "business_hours_week" CASCADE;
  DROP TABLE "business_hours_week_locales" CASCADE;
  DROP TABLE "business_hours_exceptions_periods" CASCADE;
  DROP TABLE "business_hours_exceptions" CASCADE;
  DROP TABLE "business_hours_exceptions_locales" CASCADE;
  DROP TABLE "business_hours" CASCADE;
  DROP TABLE "business_hours_locales" CASCADE;
  DROP TABLE "_business_hours_v_version_week_periods" CASCADE;
  DROP TABLE "_business_hours_v_version_week" CASCADE;
  DROP TABLE "_business_hours_v_version_week_locales" CASCADE;
  DROP TABLE "_business_hours_v_version_exceptions_periods" CASCADE;
  DROP TABLE "_business_hours_v_version_exceptions" CASCADE;
  DROP TABLE "_business_hours_v_version_exceptions_locales" CASCADE;
  DROP TABLE "_business_hours_v" CASCADE;
  DROP TABLE "_business_hours_v_locales" CASCADE;
  DROP TABLE "social_accounts_accounts" CASCADE;
  DROP TABLE "social_accounts_accounts_locales" CASCADE;
  DROP TABLE "social_accounts" CASCADE;
  DROP TABLE "_social_accounts_v_version_accounts" CASCADE;
  DROP TABLE "_social_accounts_v_version_accounts_locales" CASCADE;
  DROP TABLE "_social_accounts_v" CASCADE;
  DROP TABLE "navigation_header_items" CASCADE;
  DROP TABLE "navigation_header_items_locales" CASCADE;
  DROP TABLE "navigation" CASCADE;
  DROP TABLE "navigation_locales" CASCADE;
  DROP TABLE "_navigation_v_version_header_items" CASCADE;
  DROP TABLE "_navigation_v_version_header_items_locales" CASCADE;
  DROP TABLE "_navigation_v" CASCADE;
  DROP TABLE "_navigation_v_locales" CASCADE;
  DROP TABLE "footer_groups_items" CASCADE;
  DROP TABLE "footer_groups_items_locales" CASCADE;
  DROP TABLE "footer_groups" CASCADE;
  DROP TABLE "footer_groups_locales" CASCADE;
  DROP TABLE "footer_legal" CASCADE;
  DROP TABLE "footer_legal_locales" CASCADE;
  DROP TABLE "footer" CASCADE;
  DROP TABLE "footer_locales" CASCADE;
  DROP TABLE "_footer_v_version_groups_items" CASCADE;
  DROP TABLE "_footer_v_version_groups_items_locales" CASCADE;
  DROP TABLE "_footer_v_version_groups" CASCADE;
  DROP TABLE "_footer_v_version_groups_locales" CASCADE;
  DROP TABLE "_footer_v_version_legal" CASCADE;
  DROP TABLE "_footer_v_version_legal_locales" CASCADE;
  DROP TABLE "_footer_v" CASCADE;
  DROP TABLE "_footer_v_locales" CASCADE;
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_action";
  CREATE TYPE "public"."enum_audit_events_action" AS ENUM('login', 'login_failed', 'logout', 'user_created', 'user_updated', 'user_suspended', 'user_reactivated', 'user_deleted', 'role_changed', 'role_created', 'role_updated', 'role_deleted');
  ALTER TABLE "audit_events" ALTER COLUMN "action" SET DATA TYPE "public"."enum_audit_events_action" USING "action"::"public"."enum_audit_events_action";
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE text;
  DROP TYPE "public"."enum_audit_events_resource_type";
  CREATE TYPE "public"."enum_audit_events_resource_type" AS ENUM('users', 'roles', 'audit', 'system');
  ALTER TABLE "audit_events" ALTER COLUMN "resource_type" SET DATA TYPE "public"."enum_audit_events_resource_type" USING "resource_type"::"public"."enum_audit_events_resource_type";
  DROP INDEX "media_visibility_idx";
  ALTER TABLE "roles" DROP COLUMN "settings_general_update";
  ALTER TABLE "roles" DROP COLUMN "settings_contact_update";
  ALTER TABLE "roles" DROP COLUMN "settings_hours_update";
  ALTER TABLE "roles" DROP COLUMN "settings_social_update";
  ALTER TABLE "roles" DROP COLUMN "settings_navigation_update";
  ALTER TABLE "media" DROP COLUMN "visibility";
  DROP TYPE "public"."enum_media_visibility";
  DROP TYPE "public"."enum_site_settings_localization_enabled_locales";
  DROP TYPE "public"."enum_site_settings_localization_default_locale";
  DROP TYPE "public"."enum__site_settings_v_version_localization_enabled_locales";
  DROP TYPE "public"."enum__site_settings_v_version_localization_default_locale";
  DROP TYPE "public"."enum_contact_settings_channels_type";
  DROP TYPE "public"."enum__contact_settings_v_version_channels_type";
  DROP TYPE "public"."enum_business_hours_week_day";
  DROP TYPE "public"."enum__business_hours_v_version_week_day";
  DROP TYPE "public"."enum_social_accounts_accounts_platform";
  DROP TYPE "public"."enum__social_accounts_v_version_accounts_platform";
  DROP TYPE "public"."enum_navigation_header_items_link_type";
  DROP TYPE "public"."enum_navigation_header_items_route";
  DROP TYPE "public"."enum_navigation_header_cta_link_type";
  DROP TYPE "public"."enum_navigation_header_cta_route";
  DROP TYPE "public"."enum__navigation_v_version_header_items_link_type";
  DROP TYPE "public"."enum__navigation_v_version_header_items_route";
  DROP TYPE "public"."enum__navigation_v_version_header_cta_link_type";
  DROP TYPE "public"."enum__navigation_v_version_header_cta_route";
  DROP TYPE "public"."enum_footer_groups_items_link_type";
  DROP TYPE "public"."enum_footer_groups_items_route";
  DROP TYPE "public"."enum_footer_legal_link_type";
  DROP TYPE "public"."enum_footer_legal_route";
  DROP TYPE "public"."enum__footer_v_version_groups_items_link_type";
  DROP TYPE "public"."enum__footer_v_version_groups_items_route";
  DROP TYPE "public"."enum__footer_v_version_legal_link_type";
  DROP TYPE "public"."enum__footer_v_version_legal_route";`)
}
