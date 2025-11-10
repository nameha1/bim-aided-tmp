#!/usr/bin/env node
/**
 * Generate Supabase JWT tokens for self-hosted instances
 * Run: node scripts/generate-jwt-keys.js
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const jwtSecretMatch = envContent.match(/JWT_SECRET=(.+)/);
if (!jwtSecretMatch) {
  console.error('❌ JWT_SECRET not found in .env.local');
  process.exit(1);
}

const JWT_SECRET = jwtSecretMatch[1].trim();

if (JWT_SECRET === 'your-super-secret-jwt-token-with-at-least-32-characters-long') {
  console.error('❌ You are using the default JWT_SECRET!');
  console.error('⚠️  Please update JWT_SECRET in your .env.local with a secure random string');
  console.error('💡 You can generate one with: openssl rand -base64 32');
  process.exit(1);
}

console.log('🔐 JWT_SECRET found:', JWT_SECRET.substring(0, 10) + '...');

// Function to create JWT token
function createJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');

  return `${base64Header}.${base64Payload}.${signature}`;
}

// Generate anon key
const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const anonKey = createJWT(anonPayload, JWT_SECRET);

// Generate service_role key
const servicePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const serviceKey = createJWT(servicePayload, JWT_SECRET);

console.log('\n✅ Generated JWT tokens:\n');
console.log('📝 Copy these to your .env.local file:\n');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=' + anonKey);
console.log('\nSUPABASE_SERVICE_KEY=' + serviceKey);
console.log('\n⚠️  Keep these keys secret and never commit them to Git!\n');
