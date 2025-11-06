import 'dotenv/config';
import sql from './db.js';

async function testConnection() {
  try {
    console.log('Testing PostgreSQL connection...');
    console.log('Database URL:', process.env.DATABASE_URL ? 'Set ✓' : 'Not set ✗');
    
    const result = await sql`SELECT version()`;
    console.log('✅ Connection successful!');
    console.log('PostgreSQL version:', result[0].version);
    
    // Test creating extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ UUID extension ready');
    
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error);
    console.error('Full error:', JSON.stringify(error, null, 2));
    process.exit(1);
  }
}

testConnection();
