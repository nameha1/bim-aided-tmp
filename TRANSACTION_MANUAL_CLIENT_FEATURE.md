# Transaction Manual Client Feature

## Overview
Added the ability to manually enter a client name in the Transaction Manager without linking it to a specific client project in the database.

## Implementation Date
November 18, 2025

## Feature Details

### File Modified
`/components/admin/TransactionManager.tsx`

### New Functionality

**Manual Client Name Input:**
- Admins can now choose between:
  1. **Selecting a Client Project** (linked to database)
  2. **Manually entering a Client Name** (free text, not linked)

### UI Changes

1. **Checkbox Toggle:**
   - Added checkbox: "Enter client name manually (not linked to project)"
   - Clicking checkbox switches between dropdown and text input

2. **Conditional Display:**
   - When checkbox is **checked**: Shows text input for manual client name
   - When checkbox is **unchecked**: Shows dropdown for client projects

3. **Mutual Exclusivity:**
   - Selecting manual input clears the project dropdown
   - Selecting project dropdown clears manual input

### Data Handling

**Storage Method:**
- Manual client name is prepended to the Notes field
- Format: `Client: [Client Name]\n[Original Notes]`
- This preserves the client name without requiring database changes

**Example:**
```
Manual Client Name: "ABC Corporation"
Notes: "Payment for consulting services"

Stored as:
"Client: ABC Corporation
Payment for consulting services"
```

### State Management

**New State Variables:**
```typescript
const [useManualClient, setUseManualClient] = useState(false);
const [manualClientName, setManualClientName] = useState("");
```

**Reset Logic:**
- Both states reset when dialog is opened/closed
- States are mutually exclusive (changing one clears the other)

### Code Changes

1. **Added State Variables** (Lines ~88-89)
2. **Updated resetForm()** - Clears manual client states
3. **Updated handleEditTransaction()** - Initializes manual client states
4. **Updated handleSubmit()** - Prepends client name to notes
5. **Updated UI** - Added checkbox and conditional rendering

### Benefits

✅ **Flexibility:** Enter any client name without creating a client record  
✅ **Quick Entry:** Fast data entry for one-off clients  
✅ **No Database Changes:** Works with existing schema  
✅ **Data Preserved:** Client name stored in notes for reference  
✅ **Backward Compatible:** Existing transactions unaffected  

### Use Cases

- Recording transactions from clients not in the system
- One-time transactions that don't need client tracking
- Quick entries where full client setup is unnecessary
- Historical data entry where client details are limited

### Testing Checklist

- [ ] Toggle between manual and project selection
- [ ] Enter manual client name and submit
- [ ] Verify client name appears in notes
- [ ] Switch from manual to project selection (both clear properly)
- [ ] Edit existing transaction (states initialize correctly)
- [ ] Submit without client information (both options empty)

## Future Enhancements (Optional)

1. **Separate Field:** Create dedicated `manual_client_name` field in database
2. **Auto-Complete:** Suggest previously entered manual client names
3. **Convert to Client:** Add button to create client record from manual name
4. **Client Search:** Search both manual names and client projects
5. **Reporting:** Separate reporting for manual vs. linked clients

## Technical Notes

- No database schema changes required
- Client name stored in `notes` field with prefix "Client: "
- Parsing client name from notes: `/^Client: (.+?)\n/`
- Compatible with existing transaction queries and filters
