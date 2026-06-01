import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  console.log('Testing pg connection to:', connectionString);
  
  const pool = new pg.Pool({ connectionString });

  try {
    const client = await pool.connect();
    console.log('Successfully connected to Postgres!');
    
    const res = await client.query('SELECT current_database(), current_user');
    console.log('Database Info:', res.rows[0]);

    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in public schema:', tables.rows.map(r => r.table_name));

    client.release();
  } catch (error: any) {
    console.error('PG CONNECTION ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

main();
