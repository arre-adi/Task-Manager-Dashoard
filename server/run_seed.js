import fs from 'fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runSeed() {
  const schemaSql = fs.readFileSync('./database/schema.sql', 'utf8');
  const seedSql = fs.readFileSync('./database/seed.sql', 'utf8');
  try {
    console.log('Updating schema...');
    await pool.query(schemaSql);
    console.log('Starting database seed...');
    await pool.query(seedSql);
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

runSeed();
