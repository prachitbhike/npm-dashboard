import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'npm_dashboard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
  try {
    const client = await pool.connect();

    // Check if packages table exists
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'packages'
      );
    `);

    if (!result.rows[0].exists) {
      console.log('Creating database tables...');
      // Read and execute schema.sql
      const fs = await import('fs/promises');
      const path = await import('path');
      const schemaPath = path.join(process.cwd(), 'schema.sql');
      const schema = await fs.readFile(schemaPath, 'utf-8');
      await client.query(schema);
      console.log('Database tables created successfully');
    } else {
      console.log('Database tables already exist');
    }

    client.release();
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default pool;