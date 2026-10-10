import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_QN7ZbC1ldDec@ep-polished-surf-b4sk4z7d-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require'
});

async function main() {
  const res = await pool.query('SELECT id, email, name FROM users');
  console.log('Registered Users in Neon:', res.rows);
  await pool.end();
}

main().catch(console.error);
