import { Pool } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-polished-surf-b4sk4z7d-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  const res = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'site_settings' ORDER BY ordinal_position"
  );
  console.log('site_settings columns count:', res.rows.length);
  console.log(res.rows);
  await pool.end();
}

main().catch(console.error);
