/** @type {import('next').NextConfig} */

// Allow self-signed certificates in development (for self-hosted Supabase)
// ⚠️ WARNING: Remove this in production! Use proper SSL certificates.
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

export default nextConfig;
