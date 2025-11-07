# BIMSync Portal

A modern employee management and project portal built with React, TypeScript, and Supabase.

## Features

- 🔐 Role-based authentication (Admin/Employee)
- 👥 Employee management
- 📊 Project showcase and management
- 📅 Attendance tracking with check-in/check-out
- 📋 Assignment management
- 🏖️ Leave request system
- 💼 Career portal with job applications
- 🖼️ Image upload and storage
- 📧 Contact form

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation

## Prerequisites

- Node.js 18+ and npm
- Supabase account (get one free at https://supabase.com)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project.
2. Go to Project Settings → API and copy your project URL and anon key.
3. Go to Project Settings → Database and copy your project's connection string.
4. Install the Supabase CLI: `npm install -g supabase`

### 3. Configure Environment

Update `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Link Your Local Project to Supabase

In your terminal, run:
```bash
supabase login
supabase link --project-ref <your-project-ref>
```
This will connect your local project to your Supabase project. You will be prompted for your database password.

### 5. Set Up Database Schema

Run the SQL migrations in your Supabase SQL Editor:

```bash
# See supabase/migrations/ for all migration files:
# - 00_complete_schema.sql - Main database schema (15 tables)
# - 15_fix_infinite_recursion.sql - RLS policy fixes
# - 16_add_job_applications.sql - Job applications table
```
See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.

### 6. Deploy the Edge Function

The `create-employee` action requires a secure Edge Function.

**a. Set the Service Role Key as a Secret:**
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<your_service_role_key>
```
⚠️ **IMPORTANT**: This is a highly privileged key. Never expose it publicly.

**b. Deploy the function:**
```bash
supabase functions deploy create-employee
```

### 7. Run Development Server

```bash
npm run dev
```

Open http://localhost:8094 to view the app.

## Available Scripts

```bash
# Development
npm run dev        # Start frontend dev server (port 8094)
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint

# Supabase Functions
supabase functions deploy create-employee # Deploy the function
supabase secrets set <NAME> <VALUE>     # Set secrets for functions
supabase secrets list                   # List all secrets
```

## Architecture

This project uses Supabase Edge Functions for secure backend operations.

1.  **Frontend** (Vite/React)
    *   User interface, runs in the browser.
    *   Uses the public Supabase `anon` key for safe operations (reading data, logging in).

2.  **Edge Functions** (Deno/TypeScript)
    *   Secure, server-side logic that runs on Supabase's infrastructure.
    *   Can safely use the `service_role` key to perform privileged actions.
    *   The `create-employee` function is used to create new users with auto-confirmed emails, a task that requires admin privileges.

This architecture is secure because the highly sensitive `SERVICE_ROLE_KEY` is never exposed to the browser. It is stored as a secret within Supabase and only accessible by the Edge Function.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin dashboard components
│   ├── employee/      # Employee portal components
│   └── ui/            # shadcn/ui base components
├── pages/             # Route pages
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── integrations/      # Supabase integration
│   └── supabase/      # Supabase client & types
└── assets/            # Static assets
```

## Authentication

The app uses Supabase Auth with the following default credentials structure:

- **Admin Role**: Full access to all features
- **Employee Role**: Limited to employee portal features

Configure Row Level Security (RLS) policies in Supabase for data protection.

## Storage

Supabase Storage is used for:
- Project images
- Employee profile pictures
- Document uploads

Set up storage buckets in your Supabase dashboard.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private project - All rights reserved
