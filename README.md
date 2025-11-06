# BIMSync Portal

A modern employee management and project portal built with React, TypeScript, and Supabase.

## Features

- 🔐 Role-based authentication (Admin/Employee)
- 👥 Employee management
- 📊 Project showcase and management
- 📅 Attendance tracking
- 📋 Assignment management
- 💼 Career portal with job applications
- 🖼️ Image upload and storage

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **State Management**: React Query
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+ and npm
- Supabase account (cloud or self-hosted)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd bimsync-portal

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Update .env with your Supabase credentials
# VITE_SUPABASE_URL=your-supabase-url
# VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── admin/         # Admin-specific components
│   ├── employee/      # Employee-specific components
│   └── ui/            # shadcn/ui components
├── pages/             # Route pages
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── services/          # API services
└── integrations/      # Third-party integrations
```

## Database Setup

Set up your Supabase database with the required tables and policies. The schema includes:

- Users and roles
- Employees and departments
- Projects and assignments
- Attendance records
- Leave management
- Career postings

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Private project - All rights reserved
