#!/bin/bash

# Database Export Script for BIM Portal
# This script helps you export your current database schema and data

echo "🗄️  BIM Portal Database Export Tool"
echo "======================================"

# Set your Supabase details
SUPABASE_URL="http://supabasekong-i480ws8cosk4kwkskssck8o8.72.60.222.97.sslip.io"
SUPABASE_HOST="supabase-db"  # Internal hostname
SUPABASE_PORT="5432"
SUPABASE_DB="postgres"
SUPABASE_USER="postgres"
SUPABASE_PASSWORD="417wIu14OxPmnQNpUCeieTSZ7IN6pYSa"

# Output files
SCHEMA_FILE="exported_schema.sql"
DATA_FILE="exported_data.sql"
FULL_EXPORT_FILE="full_database_export.sql"

echo "📋 Available export options:"
echo "1. Export Schema Only (tables, functions, policies)"
echo "2. Export Data Only (table contents)"
echo "3. Export Complete Database (schema + data)"
echo "4. Export specific table"
echo "5. Generate migration for new Supabase project"

read -p "Choose option (1-5): " choice

case $choice in
    1)
        echo "🔧 Exporting database schema..."
        pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB \
            --schema-only \
            --no-owner \
            --no-privileges \
            -f $SCHEMA_FILE
        echo "✅ Schema exported to $SCHEMA_FILE"
        ;;
    2)
        echo "📊 Exporting database data..."
        pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB \
            --data-only \
            --no-owner \
            --no-privileges \
            -f $DATA_FILE
        echo "✅ Data exported to $DATA_FILE"
        ;;
    3)
        echo "🗃️  Exporting complete database..."
        pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB \
            --clean \
            --no-owner \
            --no-privileges \
            -f $FULL_EXPORT_FILE
        echo "✅ Complete database exported to $FULL_EXPORT_FILE"
        ;;
    4)
        read -p "Enter table name to export: " table_name
        echo "📊 Exporting table: $table_name"
        pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB \
            --table=$table_name \
            --no-owner \
            --no-privileges \
            -f "${table_name}_export.sql"
        echo "✅ Table $table_name exported to ${table_name}_export.sql"
        ;;
    5)
        echo "🚀 Generating migration for new Supabase project..."
        
        # Create a comprehensive migration file
        cat > supabase_migration.sql << 'EOF'
-- ===========================================
-- BIM PORTAL - SUPABASE MIGRATION SCRIPT
-- ===========================================
-- Run this in your new Supabase project's SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'employee');

-- Export current schema structure
EOF

        # Export only the public schema tables and functions
        pg_dump -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB \
            --schema-only \
            --schema=public \
            --no-owner \
            --no-privileges \
            --no-tablespaces \
            >> supabase_migration.sql
            
        echo "✅ Migration file created: supabase_migration.sql"
        echo "📝 To use this migration:"
        echo "   1. Create new Supabase project"
        echo "   2. Go to SQL Editor"
        echo "   3. Run supabase_migration.sql"
        echo "   4. Create storage buckets manually (project-images, cvs)"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎯 Export completed!"
echo "📁 Files are saved in current directory"

# Show what tables exist in the database
echo ""
echo "📊 Current database tables:"
psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "
SELECT 
    schemaname,
    tablename,
    tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;"

echo ""
echo "🔧 Current functions:"
psql -h $SUPABASE_HOST -p $SUPABASE_PORT -U $SUPABASE_USER -d $SUPABASE_DB -c "
SELECT 
    routine_name,
    routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
ORDER BY routine_name;"

echo ""
echo "💡 Next steps for deployment:"
echo "   • Use the exported files to set up your production database"
echo "   • Update connection strings in your app"
echo "   • Run database migrations in production"
echo "   • Set up storage buckets and policies"