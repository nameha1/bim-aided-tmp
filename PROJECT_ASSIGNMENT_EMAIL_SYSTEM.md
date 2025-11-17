# Client Work Project Assignment & Email Notifications

## Overview
Enhanced the client work (projects) system to support team assignments with supervisor and team members, flexible client linking (database or manual entry), and automatic email notifications when new projects are created.

## Features Implemented

### 1. **Flexible Client Linking**
Projects can now be linked to clients in two ways:
- **Database Link**: Select from existing clients in the database
- **Manual Entry**: Enter client name manually without database linkage

This allows for one-time projects or clients not yet added to the system.

### 2. **Team Assignment**
Each project can have:
- **Supervisor**: One supervisor assigned to oversee the project
- **Team Members**: Multiple team members who will work on the project
- Employee selection from database with email addresses

### 3. **Email Notifications**
When a new project is created, automatic email notifications are sent to:
- The assigned supervisor
- All team members

Email includes:
- Project name
- Client name (if available)
- Start date
- Link to view project in BIMaided portal

## Technical Implementation

### Type Definitions (`/types/client.ts`)

Updated `ClientWork` interface:
```typescript
export interface ClientWork {
  id: string;
  client_id: string | null;           // NULL if manual entry
  client_name_manual: string | null;  // Manual client name
  project_name: string;
  project_type: string;
  start_date: string;
  end_date: string | null;
  status: "planning" | "in-progress" | "completed" | "on-hold" | "cancelled";
  budget: number;
  currency: string;
  description: string | null;
  supervisor_id: string | null;       // NEW
  supervisor_email: string | null;    // NEW
  team_member_ids: string[];          // NEW
  team_member_emails: string[];       // NEW
  created_at: string;
  updated_at: string;
}
```

### Email API (`/app/api/send-project-notification/route.ts`)

New endpoint for sending project notifications:
- **Method**: POST
- **Endpoint**: `/api/send-project-notification`
- **Payload**:
  ```json
  {
    "projectName": "Office Building Renovation",
    "supervisorEmail": "supervisor@example.com",
    "teamMemberEmails": ["member1@example.com", "member2@example.com"],
    "startDate": "2024-01-15",
    "clientName": "ABC Corporation"
  }
  ```

Features:
- Uses existing nodemailer configuration
- Professional HTML email template
- Sends to all recipients in one batch
- Includes project details and portal link
- Error handling without blocking project creation

### ClientManager Component Updates

#### New State Variables
```typescript
const [manualClientName, setManualClientName] = useState("");
const [useManualClient, setUseManualClient] = useState(false);
const [supervisorEmail, setSupervisorEmail] = useState("");
const [teamMemberEmails, setTeamMemberEmails] = useState<string[]>([]);
const [currentTeamEmail, setCurrentTeamEmail] = useState("");
const [employees, setEmployees] = useState<any[]>([]);
```

#### New Functions

**fetchEmployees()**
- Fetches all employees from Firestore
- Used to populate supervisor and team member dropdowns

**Enhanced handleSubmitWork()**
- Validates client selection (database or manual)
- Validates email addresses
- Saves team assignment data
- Sends email notifications for new projects only
- Continues project creation even if email fails

#### UI Enhancements

**Client Selection Section**
```tsx
<input type="checkbox" id="useManualClient" ... />
<Label>Enter client name manually (not linked to database)</Label>

{useManualClient ? (
  <Input placeholder="Enter client name" ... />
) : (
  <Select>Select a client</Select>
)}
```

**Team Assignment Section**
- Supervisor dropdown (filtered by role)
- Team member multi-select
- Visual badges for selected team members
- Remove team member functionality
- Filters out already-selected members

## User Workflow

### Creating a Project with Database Client
1. Click "Add New Project" in Clients tab
2. Leave "Enter client name manually" unchecked
3. Select client from dropdown
4. Fill in project details
5. Select supervisor (optional)
6. Add team members (optional)
7. Click "Add Project"
8. System sends email notifications automatically

### Creating a Project with Manual Client
1. Click "Add New Project"
2. Check "Enter client name manually"
3. Type client name in text field
4. Fill in project details
5. Assign team (optional)
6. Click "Add Project"
7. Email notifications sent

### Email Notification Example
```
Subject: New Project Assigned: Office Building Renovation

A new project has been created for you in the BIMaided portal.

Project Details:
- Project Name: Office Building Renovation
- Client: ABC Corporation
- Start Date: January 15, 2024

Please log in to the BIMaided portal to view complete project details.

[View Project Button]
```

## Database Structure

### client_works Collection
```typescript
{
  id: "work_123",
  client_id: "client_456" | null,
  client_name_manual: null | "One-Time Client",
  project_name: "Office Renovation",
  project_type: "BIM Modeling",
  start_date: "2024-01-15",
  end_date: "2024-06-30",
  status: "planning",
  budget: 50000,
  currency: "USD",
  description: "Complete BIM modeling...",
  supervisor_id: null,                    // For future employee lookup
  supervisor_email: "supervisor@co.com",
  team_member_ids: [],                    // For future employee lookup
  team_member_emails: [
    "member1@co.com",
    "member2@co.com"
  ],
  created_at: "2024-01-01T10:00:00Z",
  updated_at: "2024-01-01T10:00:00Z"
}
```

## Email Configuration

Requires environment variables (same as contact form):
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@bimaided.com
SMTP_PASS=your_password
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Validation Rules

### Client Selection
- Must either select database client OR enter manual client name
- Cannot leave both empty

### Email Addresses
- Supervisor email must be valid format
- Team member emails must be valid format
- No duplicate team members
- Supervisor cannot be added as team member

### Project Details
- Project name: Required
- Start date: Required
- Budget: Required, must be >= 0
- Other fields: Optional

## Benefits

✅ **Flexibility**: Support both database and ad-hoc clients
✅ **Team Collaboration**: Clear assignment of supervisor and team
✅ **Communication**: Automatic notifications keep team informed
✅ **User Friendly**: Easy dropdown selection for team members
✅ **Reliable**: Email failures don't block project creation
✅ **Professional**: Well-formatted HTML emails with branding

## Error Handling

1. **Email Validation**: Frontend validates email format before submission
2. **API Errors**: Logged to console, doesn't block project creation
3. **Missing Recipients**: API returns 400 if no recipients specified
4. **Network Errors**: Caught and logged, user still sees success message

## Future Enhancements

1. **Employee ID Lookup**: Match emails to employee IDs for better tracking
2. **Role Filtering**: Only show supervisors with actual supervisor role
3. **Email Templates**: Customizable email templates per project type
4. **Digest Emails**: Daily/weekly summary of new assignments
5. **In-App Notifications**: Real-time notifications within portal
6. **SMS Notifications**: Optional SMS for urgent projects
7. **Calendar Integration**: Auto-add project to supervisor's calendar
8. **Project Dashboard**: Dedicated view for assigned projects

## Testing Checklist

- [ ] Create project with database client
- [ ] Create project with manual client name
- [ ] Assign supervisor only
- [ ] Assign team members only
- [ ] Assign both supervisor and team members
- [ ] Verify email sent to supervisor
- [ ] Verify email sent to all team members
- [ ] Test with invalid email addresses
- [ ] Test with no team assignments
- [ ] Edit existing project (should not resend emails)
- [ ] Test email failure doesn't block project creation
- [ ] Verify email content is correct
- [ ] Test remove team member functionality
- [ ] Verify supervisor can't be added as team member

## Files Modified

1. `/types/client.ts` - Extended ClientWork interface
2. `/components/admin/ClientManager.tsx` - Updated form and logic
3. `/app/api/send-project-notification/route.ts` - NEW email API

## Dependencies

- `nodemailer` - Already installed for contact form
- Existing Firestore setup
- Existing employee collection
