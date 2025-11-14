# Leave Policy Management System

## Overview
A comprehensive leave policy management system has been added to the admin panel, allowing administrators to configure different types of leaves with specific allowances and salary impact rules.

## Features

### 1. **Leave Policy Configuration**
- Define custom leave types (e.g., Casual Leave, Sick Leave, Maternity Leave)
- Set annual day allowances for each leave type
- Configure salary impact rules for each leave type
- Add descriptions for each leave policy

### 2. **Salary Impact Control**
Each leave type can be configured with a "Impacts Salary" toggle:
- **Enabled (true)**: When employees exceed their allocated days, salary deductions apply
- **Disabled (false)**: Leave days do not impact employee salary, regardless of usage

### 3. **Admin Panel Integration**
New "Leave Policies" tab added under the HR section of the admin dashboard, providing:
- Easy-to-use interface for creating leave types
- Real-time editing of existing policies
- Delete functionality with safety checks
- Clear visual indicators for salary impact status

## Default Leave Types

Run the setup script to initialize default leave policies:

```bash
node scripts/setup-leave-policies.cjs
```

This will create the following default policies:

| Leave Type | Days Allowed | Impacts Salary | Description |
|------------|--------------|----------------|-------------|
| Casual Leave | 10 | Yes | Annual casual leave allowance for personal matters |
| Sick Leave | 14 | Yes | Medical leave for illness or health-related issues |
| Paid Leave | 15 | No | Fully paid leave that does not impact salary |
| Maternity Leave | 120 | No | Maternity leave as per company policy |
| Paternity Leave | 10 | No | Paternity leave for new fathers |

## API Endpoints

### GET `/api/leave-policies`
Fetches all leave policies
- **Auth**: Admin only
- **Response**: Array of leave policy objects

### POST `/api/leave-policies`
Creates a new leave policy
- **Auth**: Admin only
- **Body**: 
  ```json
  {
    "name": "Casual Leave",
    "days_allowed": 10,
    "impacts_salary": true,
    "description": "Optional description"
  }
  ```

### PUT `/api/leave-policies`
Updates an existing leave policy
- **Auth**: Admin only
- **Body**: 
  ```json
  {
    "id": "policy_id",
    "name": "Updated Name",
    "days_allowed": 15,
    "impacts_salary": false,
    "description": "Updated description"
  }
  ```

### DELETE `/api/leave-policies`
Deletes a leave policy
- **Auth**: Admin only
- **Body**: 
  ```json
  {
    "id": "policy_id"
  }
  ```
- **Note**: Cannot delete policies that are currently used by leave requests

## Database Schema

### Collection: `leave_policies`

```typescript
{
  id: string;                  // Auto-generated document ID
  name: string;                // Leave type name (unique)
  days_allowed: number;        // Annual allowance
  impacts_salary: boolean;     // Whether exceeding impacts salary
  description?: string;        // Optional description
  created_at: string;          // ISO timestamp
  updated_at: string;          // ISO timestamp
  created_by?: string;         // Admin user ID who created it
  updated_by?: string;         // Admin user ID who last updated it
}
```

## Security

All leave policy API endpoints are protected with admin authentication:
- Requests require valid `firebase-token` cookie
- User must have `admin` role in the `user_roles` collection
- Unauthorized access returns 401 (Unauthorized)
- Non-admin access returns 403 (Forbidden)

## Usage in Leave Request System

Leave policies integrate with the leave request system:
1. When employees request leave, they select from available leave types
2. The system tracks used days against the policy allowance
3. If `impacts_salary` is enabled and allowance is exceeded, salary deductions apply during payroll processing
4. Admins can view leave balance and policy details when reviewing requests

## Future Enhancements

Potential improvements:
- Carry-forward unused leave days to next year
- Prorated leave allocation for mid-year joiners
- Department-specific leave policies
- Automatic leave balance notifications
- Leave policy effective date ranges
- Historical leave policy tracking

## Files Modified/Created

### New Files:
- `components/admin/LeavePolicyManager.tsx` - Main component for managing leave policies
- `app/api/leave-policies/route.ts` - API endpoints for CRUD operations
- `scripts/setup-leave-policies.cjs` - Script to initialize default policies
- `lib/firebase/auth-helpers.ts` - Authentication helper functions
- `middleware.ts` - Next.js middleware for route protection
- `app/admin/layout.tsx` - Admin route protection wrapper
- `app/employee/layout.tsx` - Employee route protection wrapper

### Modified Files:
- `app/admin/page.tsx` - Added Leave Policies tab and navigation
- `app/api/create-employee/route.ts` - Added admin auth protection
- `app/api/delete-employee/route.ts` - Added admin auth protection
- `app/api/toggle-admin-role/route.ts` - Added admin auth protection
- `app/api/payroll/generate/route.ts` - Added admin auth protection
- `app/api/create-project/route.ts` - Added admin auth protection

## Testing

To test the leave policy system:

1. **Setup Default Policies**:
   ```bash
   node scripts/setup-leave-policies.cjs
   ```

2. **Access Admin Panel**:
   - Login as admin at `/login`
   - Navigate to HR > Leave Policies

3. **Create New Policy**:
   - Fill in the form with leave type details
   - Toggle salary impact setting
   - Click "Add Leave Type"

4. **Edit Existing Policy**:
   - Click on any field in the table
   - Modify the value
   - Click outside to save (auto-save on blur)

5. **Delete Policy**:
   - Click the trash icon
   - Confirm deletion
   - Note: Cannot delete if used by leave requests

## Support

For issues or questions:
- Check Firestore console for data verification
- Review API logs for error messages
- Verify admin authentication is working
- Ensure Firebase rules allow admin access to `leave_policies` collection
