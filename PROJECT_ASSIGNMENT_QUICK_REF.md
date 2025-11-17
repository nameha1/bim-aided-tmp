# Project Assignment Quick Reference

## Adding a New Project

### Option 1: With Existing Client
1. Go to **Admin Panel → Clients Tab**
2. Click **"Add New Project"**
3. Select client from dropdown
4. Fill in project details
5. (Optional) Assign supervisor
6. (Optional) Add team members
7. Click **"Add Project"**
8. ✅ Emails sent automatically

### Option 2: With Manual Client Name
1. Go to **Admin Panel → Clients Tab**
2. Click **"Add New Project"**
3. ✅ Check **"Enter client name manually"**
4. Type client name
5. Fill in project details
6. (Optional) Assign team
7. Click **"Add Project"**
8. ✅ Emails sent automatically

## Team Assignment

### Assigning a Supervisor
- Select from **Supervisor Email** dropdown
- Shows: Name (email@domain.com)
- Only one supervisor per project
- Optional

### Adding Team Members
1. Click **team member dropdown**
2. Select member
3. Repeat to add more
4. Click **×** on badge to remove
5. Multiple members allowed
6. Optional

### Email Notification
Recipients receive:
```
Subject: New Project Assigned: [Project Name]

A new project has been created for you 
in the BIMaided portal.

Project Details:
• Project Name: [Name]
• Client: [Client Name]
• Start Date: [Date]

[View Project Button]
```

## Field Reference

### Required Fields
- ✅ Client (dropdown OR manual name)
- ✅ Project Name
- ✅ Start Date  
- ✅ Budget

### Optional Fields
- End Date
- Project Type
- Status (defaults to Planning)
- Currency (defaults to USD)
- Description
- Supervisor
- Team Members

## Important Notes

⚠️ **Email Notifications**
- Only sent for NEW projects
- NOT sent when editing existing projects
- Sent to supervisor + all team members
- Email failure doesn't block project creation

⚠️ **Client Selection**
- Choose ONE: Database client OR manual name
- Cannot use both simultaneously
- Manual entry = not linked to client database

⚠️ **Team Assignment**
- Supervisor is optional
- Team members are optional
- Can add multiple team members
- Supervisor can't also be team member

## Validation Errors

❌ **"Please select a client or use manual entry"**
- Solution: Either select client OR check manual box

❌ **"Please enter a client name"**
- Solution: Type client name in manual field

❌ **"Project name is required"**
- Solution: Enter project name

❌ **"Please enter a valid supervisor email"**
- Solution: Check email format or select from dropdown

## Quick Tips

💡 Use **manual entry** for:
- One-time clients
- Clients not yet in database
- Quick project creation

💡 Use **database client** for:
- Regular clients
- When you need client details
- Better reporting and tracking

💡 **Email assignments** when:
- Project is ready to start
- Team needs immediate notification
- Clear ownership required

💡 **Skip email** by:
- Leaving supervisor and team members empty
- Perfect for planning-stage projects
