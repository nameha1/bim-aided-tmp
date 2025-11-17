# Client Management System - Quick Reference

## Overview
A comprehensive client management system has been added to the admin panel to manage clients, their information, and related work/projects.

## Location
**Admin Panel → Projects & Work → Clients**

## Features

### 1. Client Management Tab
Manage your client directory with full contact information:

**Client Information:**
- Client Name (required)
- Company Name
- Email (required)
- Phone
- Address
- Country
- Industry (dropdown selection)
- Status (Active/Inactive/Potential)
- Notes

**Available Actions:**
- ✅ Add new clients
- ✅ Edit existing client information
- ✅ Delete clients (with confirmation)
- ✅ Search clients by name, company, or email
- ✅ View number of projects per client

### 2. Related Work Tab
Track and manage all projects/work done for clients:

**Project Information:**
- Client (dropdown selection from existing clients)
- Project Name (required)
- Project Type (BIM Modeling, Architectural Design, etc.)
- Start Date (required)
- End Date (optional)
- Budget (required)
- Currency (USD, EUR, GBP, CAD, AUD, BDT, INR)
- Status (Planning/In Progress/Completed/On Hold/Cancelled)
- Description

**Available Actions:**
- ✅ Add new projects
- ✅ Edit existing projects
- ✅ Delete projects
- ✅ View all projects with client information
- ✅ Track project timelines and budgets

## Data Structure

### Firestore Collections

**Collection: `clients`**
```
{
  id: string (auto-generated)
  client_name: string
  company_name: string
  email: string
  phone: string
  address: string
  country: string
  industry: string
  status: "active" | "inactive" | "potential"
  notes: string | null
  created_at: string (ISO timestamp)
  updated_at: string (ISO timestamp)
}
```

**Collection: `client_works`**
```
{
  id: string (auto-generated)
  client_id: string (references clients collection)
  project_name: string
  project_type: string
  start_date: string (YYYY-MM-DD)
  end_date: string | null (YYYY-MM-DD)
  status: "planning" | "in-progress" | "completed" | "on-hold" | "cancelled"
  budget: number
  currency: string
  description: string | null
  created_at: string (ISO timestamp)
  updated_at: string (ISO timestamp)
}
```

## Industry Options
- Architecture
- Construction
- Engineering
- Real Estate
- Manufacturing
- Government
- Healthcare
- Education
- Hospitality
- Retail
- Other

## Project Types
- BIM Modeling
- Architectural Design
- Structural Engineering
- MEP Design
- Construction Documentation
- Project Coordination
- Facility Management
- Renovation
- Consulting
- Other

## Supported Currencies
USD, EUR, GBP, CAD, AUD, BDT, INR

## Usage Flow

### Adding a New Client
1. Navigate to Admin Panel → Projects & Work → Clients
2. Click "Add Client" button
3. Fill in required fields (Client Name, Email)
4. Optionally add company, contact details, industry, etc.
5. Set client status (Active/Inactive/Potential)
6. Add any notes
7. Click "Add Client"

### Adding a Project for a Client
1. Navigate to the "Related Work" tab
2. Click "Add Project" button
3. Select the client from dropdown
4. Enter project details (name, type, dates, budget)
5. Set project status
6. Click "Add Project"

### Searching Clients
Use the search bar in the Clients tab to filter by:
- Client name
- Company name
- Email address

### Editing/Deleting
- Click the Edit icon (pencil) to modify client or project details
- Click the Delete icon (trash) to remove (with confirmation dialog)

## Status Badges
- **Active/In Progress**: Green badge
- **Inactive/Completed**: Gray badge
- **Potential/Planning**: Outlined badge
- **On Hold/Cancelled**: Red badge

## Integration Points
- Fully integrated with existing admin panel navigation
- Uses the same Firebase Firestore backend
- Follows the same UI/UX patterns as other admin features
- Lazy-loaded for optimal performance

## Files Created/Modified

**New Files:**
- `/types/client.ts` - TypeScript type definitions
- `/components/admin/ClientManager.tsx` - Main component

**Modified Files:**
- `/app/admin/page.tsx` - Added Clients tab and navigation

## Notes
- Email validation is enforced
- Budget must be a positive number
- Deleting a client will prompt about associated projects
- All dates are stored in ISO format
- Search is case-insensitive
- Data is sorted by creation date (newest first)
