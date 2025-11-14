# Enhanced Employee Form - Features Summary

## New Features Implemented

### 1. Profile Picture Upload
- **Compression**: Automatically compresses images to max 100KB
- **Preview**: Shows preview before upload
- **Format**: Converts to JPEG for optimal compression
- **UI**: Circular upload button with remove option

### 2. Employee ID (EID) System
- **Auto-generation**: YYMMXXX format (e.g., 2511001)
  - YY: Last 2 digits of year
  - MM: Month (01-12)
  - XXX: Sequential number for that month
- **Editable**: Admin can modify the generated ID if needed
- **Smart sequencing**: Automatically increments based on existing employees

### 3. Department Management
- **Default Departments**:
  1. Executive & Management Level
  2. Technical & Production Divisions
  3. Support & Innovation Divisions
  4. Business & Administrative Division
- **Add Custom**: Admin can add new departments on-the-fly
- **Persistent**: Custom departments saved to Firestore collection `custom_departments`
- **Available for future**: Once added, appears in dropdown for all future employees

### 4. Sub-Department Field
- **Dynamic**: Admin types new sub-department names
- **Auto-saved**: Stored in `custom_sub_departments` collection
- **Dropdown**: Available for selection in future forms
- **Plus button**: Quick add interface

### 5. Designation Management
- **Default Designations**:
  1. BIM Modeler
  2. Sr. BIM Modeler
  3. BIM Engineer
  4. Sr. BIM Engineer
  5. BIM Coordinator
  6. Sr. BIM Coordinator
  7. BIM Manager
  8. Admin
- **Add Custom**: Admin can add new designations
- **Persistent**: Saved to `custom_designations` collection
- **Future use**: Available in dropdown for next employees

### 6. Updated Salary Field
- **Changed**: "Basic Salary" → "Gross Salary"
- **Field name**: `grossSalary` in form, `gross_salary` in database

### 7. TIN Field
- **New field**: Tax Identification Number
- **Optional**: Not required but available for record keeping

### 8. Bank Routing Number
- **New field**: For complete bank details
- **Placeholder**: "9-digit routing number"

### 9. Emergency Contact Information
Three new fields:
1. **Emergency Person Name**
2. **Emergency Person Contact** (phone)
3. **Emergency Person Address**

### 10. Document Upload
- **Capacity**: Up to 3 documents
- **Size limit**: Each file max 2MB
- **Formats**: PDF, DOC, DOCX, JPG, JPEG, PNG
- **Management**: Can remove documents before submission
- **Storage**: Uploaded to R2 storage at `employees/documents/{eid}-{index}`

## Database Schema Updates

### Firestore Collection: `employees`
```typescript
{
  // Existing fields...
  tin: string | null,
  department: string | null,                    // Changed from department_id
  sub_department: string | null,                // NEW
  designation: string | null,                   // Changed from designation_id
  gross_salary: number | null,                  // Changed from salary/basicSalary
  bank_routing_number: string | null,           // NEW
  emergency_person_name: string | null,         // NEW
  emergency_person_contact: string | null,      // NEW
  emergency_person_address: string | null,      // NEW
  profile_image_url: string | null,             // NEW
  document_urls: string[],                      // NEW
}
```

### New Firestore Collections:
1. **`custom_departments`**
   ```typescript
   {
     name: string,
     createdAt: Date
   }
   ```

2. **`custom_sub_departments`**
   ```typescript
   {
     name: string,
     createdAt: Date
   }
   ```

3. **`custom_designations`**
   ```typescript
   {
     name: string,
     createdAt: Date
   }
   ```

## Form Sections

### 1. Profile Picture (Top)
- Circular upload zone
- Preview with remove button
- Automatic compression notification

### 2. Personal Information
- First Name*, Last Name*
- Email*, Password*
- Gender, Date of Birth
- National ID, TIN
- Phone, Address

### 3. Employment Details
- Joining Date* (auto-generates EID)
- Employee ID (EID)* - editable
- Department* (with + button to add new)
- Sub-Department (with + button to add new)
- Designation* (with + button to add new)
- Supervisor (dropdown of active employees)

### 4. Financial Information
- Gross Salary
- Bank Name
- Bank Account Number
- Bank Branch
- Bank Routing Number

### 5. Emergency Contact
- Emergency Person Name
- Emergency Person Contact
- Emergency Person Address

### 6. Documents
- File upload (multiple, max 3)
- Size validation (2MB each)
- File list with remove option

## User Experience Enhancements

1. **Visual Sections**: Clear headings with border separators
2. **Inline Add**: Add custom departments/designations without leaving form
3. **Auto-ID**: Employee ID auto-generates and updates when joining date changes
4. **File Preview**: See uploaded documents with size indicators
5. **Validation Messages**: Clear feedback for file size limits
6. **Compression Feedback**: Shows before/after size for profile images
7. **Loading States**: Form shows loading indicator while initializing

## Technical Implementation

### Image Compression
- Canvas-based compression
- Maintains aspect ratio
- Target: max 800px dimension
- Quality reduction until under 100KB

### File Uploads
- Uses existing `/api/upload-image` endpoint
- R2 storage paths:
  - Profile: `employees/profiles/{eid}`
  - Documents: `employees/documents/{eid}-{index}`

### Dynamic Options
- Loads existing custom options on form load
- Saves new options to Firestore immediately
- Updates dropdown in real-time

### API Integration
- Updated `/api/create-employee` route
- Handles all new fields
- Stores URLs for uploaded files

## Testing Checklist

- [ ] Profile picture upload and compression
- [ ] Employee ID auto-generation (different months)
- [ ] Add custom department
- [ ] Add custom sub-department
- [ ] Add custom designation
- [ ] Document upload (1, 2, 3 files)
- [ ] Document size validation
- [ ] Remove documents before submission
- [ ] Form submission with all fields
- [ ] Form submission with minimal required fields only
- [ ] Custom options persist for next employee

## Future Enhancements (Optional)

- Bulk employee import from CSV
- Profile picture crop/edit tool
- Document viewer/preview
- Employee ID format customization
- Department hierarchy (parent-child)
- Multiple emergency contacts
- Document expiry tracking
