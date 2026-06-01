import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const adminConnectionString = "postgresql://postgres:123700@127.0.0.1:5433/postgres";
  console.log('Connecting to admin database:', adminConnectionString);
  
  const pool = new pg.Pool({ connectionString: adminConnectionString });

  try {
    const client = await pool.connect();
    console.log('Successfully connected to Postgres admin!');
    
    // Check if database exists
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname = 'patient_db'");
    if (res.rowCount === 0) {
      console.log('Creating database: patient_db');
      await client.query('CREATE DATABASE patient_db');
      console.log('Database created successfully!');
    } else {
      console.log('Database patient_db already exists.');
    }

    client.release();
  } catch (error: any) {
    console.error('PG ADMIN ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

main();
