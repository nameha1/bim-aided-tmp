# Invoice Management System

## Overview
The invoice management system allows admins to create, save, and manage professional invoices with company branding. Invoice data is persisted to Firebase Firestore, and PDFs can be generated on-demand from saved data.

## Features

### 1. **Create Invoices**
- Invoice number, dates, client information
- Multiple line items with description, quantity, and rate
- Automatic calculation of subtotal, tax, and total
- Custom tax rate configuration
- Additional notes/terms section

### 2. **Save to Database**
- All invoice data saved to Firestore `invoices` collection
- No PDF files stored - only structured data
- Metadata tracking (created by, created at)
- Status field (draft, sent, paid)

### 3. **Invoice List View**
- Table view of all saved invoices
- Sort by creation date (newest first)
- Quick view of invoice number, client, dates, amount, status
- Action buttons for each invoice

### 4. **PDF Generation On-Demand**
- Generate PDF from saved invoice data
- Professional layout with company logo
- Detailed invoice table
- Tax calculations and totals
- Download to local machine

### 5. **Invoice Management**
- Delete invoices
- Status badges (color-coded)
- Responsive design

## Architecture

### Database Schema

**Collection:** `invoices`

**Document Structure:**
```json
{
  "invoiceNumber": "INV-001",
  "invoiceDate": "2024-01-15",
  "dueDate": "2024-02-15",
  "clientName": "Client Name",
  "clientAddress": "123 Street, City",
  "clientEmail": "client@example.com",
  "clientPhone": "+91 9876543210",
  "items": [
    {
      "description": "Service/Product Name",
      "quantity": 10,
      "rate": 1000,
      "amount": 10000
    }
  ],
  "subtotal": 10000,
  "taxRate": 18,
  "taxAmount": 1800,
  "total": 11800,
  "notes": "Payment terms and conditions",
  "status": "draft",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "createdBy": "admin@example.com"
}
```

### API Endpoints

#### **GET /api/invoices**
Fetch all invoices (admin only)
- Returns: Array of invoice objects
- Sorted by `createdAt` descending

#### **POST /api/invoices**
Create a new invoice (admin only)
- Body: Invoice data (see schema above)
- Returns: Created invoice with ID

#### **GET /api/invoices/[id]**
Fetch a single invoice by ID (admin only)
- Returns: Invoice object

#### **PUT /api/invoices/[id]**
Update an invoice (admin only)
- Body: Updated invoice data
- Returns: Success status

#### **DELETE /api/invoices?id=[id]**
Delete an invoice (admin only)
- Returns: Success status

### Components

#### **InvoiceTabView.tsx**
Main container component that toggles between list and create views
- State: `view` ("list" | "create")
- Callbacks: Switch between views

#### **InvoiceList.tsx**
Displays all saved invoices in a table
- Features:
  - Fetch invoices on mount
  - Generate PDF from saved data
  - Delete invoices
  - Status badges
  - "Create New" button

#### **InvoiceGenerator.tsx**
Form for creating new invoices
- Features:
  - Invoice metadata input
  - Dynamic line items (add/remove)
  - Auto-calculation of amounts
  - Tax rate configuration
  - Two save options:
    1. Save only
    2. Save & Download PDF
  - Form reset after save
  - Callback to parent on successful save

### PDF Generation

Uses **jsPDF** and **jspdf-autotable** libraries

**Features:**
- Company logo from `/Logo-BIMaided.png`
- Company details
- Client information
- Itemized table
- Subtotal, tax, and total
- Notes/terms
- Professional layout

**Function:** `generatePDF(invoice: Invoice)`
- Can be called from InvoiceList (for saved invoices)
- Or from InvoiceGenerator (after saving)

## Usage Flow

### Creating an Invoice

1. Admin navigates to **Finance > Invoices** tab
2. Clicks **"Create New Invoice"** button
3. Fills in:
   - Invoice number (unique)
   - Invoice date and due date
   - Client information
   - Line items (description, quantity, rate)
   - Tax rate (%)
   - Notes/terms
4. Clicks either:
   - **"Save Invoice"** - Saves to database only
   - **"Save & Download PDF"** - Saves and generates PDF immediately
5. View switches back to invoice list

### Viewing & Downloading Invoices

1. Admin sees table of all saved invoices
2. Each row shows:
   - Invoice number
   - Client name
   - Invoice date
   - Due date
   - Total amount
   - Status badge
3. Action buttons:
   - **Download** - Generates and downloads PDF
   - **Delete** - Removes invoice from database

### Generating PDF from Saved Data

1. Click download button on any invoice row
2. System fetches invoice data from the row
3. PDF generated using jsPDF with invoice data
4. Browser downloads file as `Invoice_[number].pdf`

## Setup

### 1. Initialize Firestore Collection

```bash
node scripts/setup-invoices.cjs
```

This creates/verifies the `invoices` collection structure.

### 2. API Routes

Already created at:
- `/app/api/invoices/route.ts`
- `/app/api/invoices/[id]/route.ts`

All routes protected with `verifyAdminAuth()`.

### 3. Admin Panel Integration

Already integrated in `/app/admin/page.tsx`:
- Import: `InvoiceTabView`
- Tab: `value="invoices"`
- Navigation: Finance section

## Security

- ✅ All API routes require admin authentication
- ✅ Firebase Admin SDK used for server-side operations
- ✅ Client-side validation before submission
- ✅ Server-side validation in API routes
- ✅ No direct Firestore access from client

## Status Options

- **draft** - Invoice created but not sent (gray badge)
- **sent** - Invoice sent to client (blue badge)
- **paid** - Invoice paid by client (green badge)

*Note: Status changes must be implemented separately if needed.*

## Data Persistence

**What is Saved:**
- ✅ All invoice data (numbers, dates, client info, items, totals)
- ✅ Metadata (created by, created at)
- ✅ Status

**What is NOT Saved:**
- ❌ PDF files
- ❌ Binary data
- ❌ Images (only paths)

**Why?**
- Reduces storage costs
- Faster queries
- Easy data updates
- PDFs generated on-demand from fresh data

## Future Enhancements

1. **Status Management**
   - Mark as sent/paid
   - Email sending integration

2. **Invoice Editing**
   - Edit saved invoices
   - Version history

3. **Advanced Features**
   - Invoice templates
   - Recurring invoices
   - Payment tracking
   - Client portal

4. **Reporting**
   - Revenue reports
   - Outstanding invoices
   - Tax summaries

## Troubleshooting

### Issue: Invoices not loading
- Check Firebase Admin SDK initialization
- Verify `invoices` collection exists in Firestore
- Check browser console for errors
- Verify admin authentication

### Issue: PDF generation fails
- Check `/Logo-BIMaided.png` exists in public folder
- Check browser console for jsPDF errors
- Verify invoice data structure

### Issue: Save fails
- Check required fields (invoice number, client name, items)
- Verify API route authentication
- Check server logs for errors

## Files Modified/Created

### Created:
- `/app/api/invoices/route.ts`
- `/app/api/invoices/[id]/route.ts`
- `/components/admin/InvoiceList.tsx`
- `/components/admin/InvoiceTabView.tsx`
- `/scripts/setup-invoices.cjs`

### Modified:
- `/components/admin/InvoiceGenerator.tsx` (added save functionality)
- `/app/admin/page.tsx` (integrated InvoiceTabView)

## Summary

The invoice system now:
1. ✅ Saves invoice data to Firestore (not files)
2. ✅ Displays all saved invoices in a list
3. ✅ Generates PDFs on-demand from saved data
4. ✅ Allows creating, viewing, and deleting invoices
5. ✅ Provides professional PDF output
6. ✅ Includes proper authentication and validation
