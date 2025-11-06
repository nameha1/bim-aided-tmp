// Direct SQL Execution via Supabase Client
// This bypasses the broken Studio API
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = 'http://srv1095294.hstgr.cloud:8000';
const SUPABASE_ANON_KEY = 'IV50D3wm2O1lDS4RkbMgX3bmsZqwbVGGBzMLtwjN2yyMTm1yuHqPg8lbpDb1N6';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read SQL file
const sqlFile = join(__dirname, '..', 'setup-part1-tables.sql');
const fullSql = fs.readFileSync(sqlFile, 'utf8');

// Split SQL into individual statements (rough split)
const statements = fullSql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

async function executeStatements() {
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    // Skip comments
    if (statement.trim().startsWith('--')) continue;
    
    console.log(`\n[${i + 1}/${statements.length}] Executing...`);
    console.log(statement.substring(0, 80) + '...\n');
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        sql: statement 
      });
      
      if (error) {
        console.error('❌ Error:', error.message);
        // Try alternative method
        console.log('Trying alternative method...');
        await executeViaFetch(statement);
      } else {
        console.log('✅ Success');
      }
    } catch (err) {
      console.error('❌ Exception:', err.message);
    }
    
    // Small delay between statements
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n✅ All statements processed!');
  console.log('\nCheck Table Editor to verify tables were created.');
}

async function executeViaFetch(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({ sql })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    console.log('✅ Alternative method succeeded');
  } catch (error) {
    console.error('❌ Alternative method failed:', error.message);
  }
}

executeStatements();
