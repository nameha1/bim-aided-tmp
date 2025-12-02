# Employee Profile Creation Fixes

## Issues Fixed

### 1. Profile Picture Upload Not Working

**Problem:**
- The upload API was being called with the wrong parameter name
- The `uploadFile` function was using `path` instead of `folder` parameter
- Missing proper error handling for upload failures

**Solution:**
- Updated `uploadFile` function in both `AddEmployeeForm.tsx` and `EditEmployeeDialog.tsx`
- Changed parameter from `path` to `folder` to match the API expectation
- Added comprehensive error handling with detailed error messages
- Added console logging to track upload progress

**Changes Made:**

1. **AddEmployeeForm.tsx:**
   ```typescript
   // Before:
   formDataUpload.append('path', path);
   
   // After:
   formDataUpload.append('folder', path);
   
   // Added error handling:
   if (!response.ok) {
     const errorData = await response.json();
     throw new Error(errorData.message || errorData.error || 'File upload failed');
   }
   
   const result = await response.json();
   if (!result.success || !result.url) {
     throw new Error(result.message || result.error || 'File upload failed - no URL returned');
   }
   ```

2. **EditEmployeeDialog.tsx:**
   - Applied the same fixes as AddEmployeeForm.tsx
   - Added try-catch blocks around document uploads with detailed error messages

### 2. Financial Information Visibility Not Working

**Problem:**
- The `can_view_financials` field was being saved to the database correctly
- However, the employee profile page was showing financial information regardless of the setting
- Bank information and salary details were always visible to employees

**Solution:**
- Updated `EmployeeProfile.tsx` to check the `can_view_financials` permission before displaying financial information
- Wrapped salary and bank information sections in a conditional check

**Changes Made:**

**EmployeeProfile.tsx:**
```typescript
{/* Financial Information - Only show if employee has permission */}
{(employee.can_view_financials || employee.canViewFinancials) && (
  <>
    {/* Employment Salary */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
      <Separator className="mb-4" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm text-muted-foreground">Gross Salary</Label>
          <p className="text-base font-medium">
            {employee.grossSalary || employee.gross_salary ? `৳${Number(employee.grossSalary || employee.gross_salary).toLocaleString()}` : "N/A"}
          </p>
        </div>
      </div>
    </div>

    {/* Bank Information */}
    <div>
      <h3 className="text-lg font-semibold mb-4">Bank Information</h3>
      <Separator className="mb-4" />
      {/* Bank details... */}
    </div>
  </>
)}
```

## How It Works Now

### Profile Picture Upload
1. Admin selects an image in the employee creation/edit form
2. Image is automatically compressed to max 100KB
3. When submitting the form, the image is uploaded to R2 storage using the correct API parameters
4. The upload function now properly validates the response and extracts the URL
5. If upload fails, a detailed error message is shown to the admin

### Financial Information Visibility
1. Admin creates/edits an employee profile
2. Admin can check/uncheck the "Allow employee to view their financial information" checkbox
3. This sets the `can_view_financials` field in Firestore
4. When an employee views their profile:
   - If `can_view_financials = true`: Shows salary and bank information
   - If `can_view_financials = false`: Hides all financial sections completely

## Testing Checklist

### Profile Picture Upload
- [ ] Create a new employee with a profile picture
- [ ] Verify the image appears in the preview
- [ ] Submit the form and check if the image is saved
- [ ] View the employee in the employee list - check if profile picture shows
- [ ] Edit an existing employee and change the profile picture
- [ ] Verify the new image replaces the old one

### Financial Visibility
- [ ] Create a new employee with "Allow financial view" UNCHECKED
- [ ] Login as that employee
- [ ] Go to "My Profile" tab
- [ ] Verify NO salary or bank information is visible
- [ ] Logout and login as admin
- [ ] Edit the employee and CHECK "Allow financial view"
- [ ] Login as that employee again
- [ ] Verify salary and bank information IS NOW visible

## Files Modified

1. `/components/admin/AddEmployeeForm.tsx`
   - Fixed `uploadFile` function parameter and error handling
   - Added logging for upload progress

2. `/components/admin/EditEmployeeDialog.tsx`
   - Fixed `uploadFile` function parameter and error handling
   - Added logging for upload progress

3. `/components/employee/EmployeeProfile.tsx`
   - Added conditional rendering for financial information sections
   - Respects `can_view_financials` field from database

## Database Fields

The following fields are checked for financial visibility:
- `can_view_financials` (snake_case - Firestore)
- `canViewFinancials` (camelCase - for compatibility)

Both formats are supported to ensure backward compatibility.
