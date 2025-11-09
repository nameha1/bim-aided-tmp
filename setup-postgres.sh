#!/bin/bash

# PostgreSQL + MinIO Setup Script

echo "🚀 Setting up PostgreSQL + MinIO for BIMaided"
echo ""

# Install required npm packages
echo "📦 Installing required packages..."
npm install pg @aws-sdk/client-s3 @aws-sdk/s3-request-presigner bcryptjs
npm install -D @types/pg @types/bcryptjs

echo ""
echo "✅ Packages installed!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Deploy PostgreSQL + MinIO on Coolify:"
echo "   - Upload postgres-compose.yml to Coolify"
echo "   - Set environment variables"
echo "   - Deploy"
echo ""
echo "2. Access MinIO Console: http://srv1095294.hstgr.cloud:9001"
echo "   - Create buckets: project-images, employee-avatars, documents"
echo "   - Set public access for buckets"
echo ""
echo "3. Access pgAdmin: http://srv1095294.hstgr.cloud:5050"
echo "   - Connect to PostgreSQL"
echo "   - Run database/postgres-schema.sql"
echo ""
echo "4. Update .env.local with database and MinIO credentials"
echo ""
echo "5. Test locally: npm run dev"
echo ""
echo "📖 See POSTGRES_MIGRATION_GUIDE.md for detailed instructions"
