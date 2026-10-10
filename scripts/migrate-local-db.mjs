import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgres://seven_lands:sl_dev_phase_a@127.0.0.1:5432/seven_lands_dev'
});

async function run() {
  try {
    await pool.query('ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_enabled" boolean DEFAULT true');
    await pool.query('ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_model" varchar DEFAULT \'auto\'');
    await pool.query('ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_ghostmind_api_key" varchar');
    await pool.query('ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "ai_system_prompt_override" text');
    await pool.query('ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_ai_enabled" boolean DEFAULT true');
    await pool.query('ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_ai_model" varchar DEFAULT \'auto\'');
    await pool.query('ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_ai_ghostmind_api_key" varchar');
    await pool.query('ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_ai_system_prompt_override" text');
    console.log('SUCCESS: Local DB migrated');
  } catch (err) {
    console.error('Migration error:', err.message);
  } finally {
    await pool.end();
  }
}

run();
