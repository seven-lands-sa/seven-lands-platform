import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" 
      ADD COLUMN IF NOT EXISTS "ai_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "ai_model" varchar DEFAULT 'auto',
      ADD COLUMN IF NOT EXISTS "ai_ghostmind_api_key" varchar,
      ADD COLUMN IF NOT EXISTS "ai_system_prompt_override" varchar;

    ALTER TABLE "_site_settings_v" 
      ADD COLUMN IF NOT EXISTS "version_ai_enabled" boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS "version_ai_model" varchar DEFAULT 'auto',
      ADD COLUMN IF NOT EXISTS "version_ai_ghostmind_api_key" varchar,
      ADD COLUMN IF NOT EXISTS "version_ai_system_prompt_override" varchar;
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "site_settings" 
      DROP COLUMN IF EXISTS "ai_enabled",
      DROP COLUMN IF EXISTS "ai_model",
      DROP COLUMN IF EXISTS "ai_ghostmind_api_key",
      DROP COLUMN IF EXISTS "ai_system_prompt_override";

    ALTER TABLE "_site_settings_v" 
      DROP COLUMN IF EXISTS "version_ai_enabled",
      DROP COLUMN IF EXISTS "version_ai_model",
      DROP COLUMN IF EXISTS "version_ai_ghostmind_api_key",
      DROP COLUMN IF EXISTS "version_ai_system_prompt_override";
  `);
}
