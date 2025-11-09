#!/usr/bin/env node

/**
 * Generate Supabase JWT Tokens for Self-Hosted Installation
 * 
 * This script generates the ANON_KEY and SERVICE_ROLE_KEY needed for Supabase.
 * Run with: node generate-supabase-keys.js
 */

import crypto from 'crypto';

// Generate a random JWT secret (or use your own)
// For production, you should save this secret and reuse it
const JWT_SECRET = process.argv[2] || crypto.randomBytes(32).toString('base64');

console.log('\n=== Supabase JWT Configuration ===\n');
console.log('JWT_SECRET (SAVE THIS!):', JWT_SECRET);
console.log('\n');

// Function to create JWT token
function createJWT(payload, secret) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// Generate ANON key (public key for client-side use)
const anonPayload = {
  role: 'anon',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const ANON_KEY = createJWT(anonPayload, JWT_SECRET);

// Generate SERVICE_ROLE key (secret key for server-side use)
const serviceRolePayload = {
  role: 'service_role',
  iss: 'supabase',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const SERVICE_ROLE_KEY = createJWT(serviceRolePayload, JWT_SECRET);

console.log('ANON_KEY (Public - use in client):\n', ANON_KEY);
console.log('\n');
console.log('SERVICE_ROLE_KEY (Secret - server only!):\n', SERVICE_ROLE_KEY);
console.log('\n');

console.log('=== Add these to your .env files ===\n');
console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}`);
console.log(`SUPABASE_SERVICE_KEY=${SERVICE_ROLE_KEY}`);
console.log('\n');

console.log('=== Configure Supabase with this JWT_SECRET ===');
console.log(`JWT_SECRET=${JWT_SECRET}`);
console.log('\n');
