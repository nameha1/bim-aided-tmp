import fs from 'fs';
import fetch from 'node-fetch';

// Read SQL file
const sql = fs.readFileSync('./setup-part1-tables.sql', 'utf8');

// Your Supabase configuration
const SUPABASE_URL = 'http://srv1095294.hstgr.cloud:8000';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY';

async function executeSql() {
  try {
    console.log('Executing SQL...');
    console.log('URL:', `${SUPABASE_URL}/rest/v1/rpc/exec`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({ query: sql })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', data);

    if (response.ok) {
      console.log('✅ SQL executed successfully!');
    } else {
      console.error('❌ SQL execution failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

executeSql();
