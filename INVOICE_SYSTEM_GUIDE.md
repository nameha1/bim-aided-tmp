# Invoice Management System - Complete Guide

## Overview

A comprehensive invoice management system integrated into the BIMaided admin dashboard with PDF generation capabilities, multi-currency support, and complete data persistence.

## Features

### ✅ Company Profile Management
- Create and manage multiple company profiles
- Store complete company information (name, address, contact details, tax ID)
- Set default profile for quick invoice creation
- Reuse saved profiles across multiple invoices

### ✅ Bank Details Management
- Manage multiple bank accounts
- Support for USD and BDT currencies
- Store complete banking information (account numbers, SWIFT codes, routing numbers)
- Set default bank accounts per currency
- Display bank details on invoices for payment instructions

### ✅ Invoice Creation & Editing
- Auto-generated invoice numbers with format: `INV-YEAR-####`
- Set invoice date and due date
- Select company profile (From section)
- Add client information (Billed To section)
- Add multiple line items with descriptions
- Automatic calculations:
  - Subtotal
  - Discount (percentage or fixed amount)
  - Tax/AIT (percentage or fixed amount)
  - Grand Total
- Currency selection (USD or BDT)
- Invoice status management (Draft, Sent, Paid, Overdue, Cancelled)
- Add notes and terms & conditions
- Edit existing invoices

### ✅ Invoice List & Search
- View all invoices in a sortable table
- Search by invoice number, client name, email, or status
- Filter and sort invoices
- Quick actions:
  - Preview PDF
  - Download PDF
  - Edit invoice
  - Delete invoice
- Visual status badges with color coding

### ✅ PDF Generation
- Professional invoice PDF layout
- Company logo support (top right)
- Complete company and client information
- Itemized line items with descriptions
- Summary section with discount and tax breakdown
- Bank details for payment
- Notes and terms & conditions
- Preview before download
- Download anytime from saved invoices
- Regenerate PDFs from any saved invoice

## How to Use

### 1. Initial Setup

#### Set Up Company Profile
1. Navigate to Admin Dashboard → Invoices
2. Click on "Company" tab
3. Click "Add Profile"
4. Enter your company information:
   - Company name (required)
   - Address (required)
   - City, State, Zip, Country
   - Email, Phone, Website
   - Tax ID
5. Check "Set as default profile" for your main company
6. Click "Save Profile"

#### Set Up Bank Details
1. Go to "Bank Details" tab
2. Click "Add Bank Details"
3. Enter banking information:
   - Bank name (required)
   - Account name (required)
   - Account number (required)
   - Routing number, SWIFT code
   - Branch name and address
   - Currency (USD or BDT)
4. Check "Set as default" for your primary account per currency
5. Click "Save Bank Details"

### 2. Creating an Invoice

1. Go to Admin Dashboard → Invoices
2. Click "Create Invoice" button or go to "Create/Edit" tab
3. Fill in invoice information:
   - Invoice number (auto-generated, editable)
   - Invoice date (defaults to today)
   - Due date (optional)
   - Select company profile (From)
   - Select currency (USD or BDT)
   - Set status (Draft, Sent, etc.)

4. Enter client information (Billed To):
   - Client name (required)
   - Address (required)
   - City, State, Zip, Country
   - Email, Phone, Tax ID

5. Add invoice items:
   - Click "Add Item" for multiple items
   - Enter item name (required)
   - Add description (optional)
   - Set quantity (required)
   - Set rate/price (required)
   - Amount is calculated automatically

6. Configure discount and tax:
   - Select discount type (percentage or fixed)
   - Enter discount value
   - Select tax/AIT type (percentage or fixed)
   - Enter tax value
   - Totals update automatically

7. Select bank details (optional)
   - Choose appropriate bank account for the currency
   - Bank details will appear on the invoice PDF

8. Add additional information:
   - Notes (optional)
   - Terms & Conditions (optional)

9. Save and generate:
   - Click "Preview PDF" to see before saving
   - Click "Save Draft" to save without downloading
   - Click "Save & Download PDF" to save and get PDF immediately

### 3. Managing Invoices

#### Search Invoices
- Use the search bar in the Invoices tab
- Search by:
  - Invoice number
  - Client name
  - Client email
  - Status

#### View Invoice Details
- Click the eye icon to preview PDF
- Click download icon to get PDF

#### Edit Invoice
- Click the edit icon in the invoice list
- Make necessary changes
- Save updates

#### Delete Invoice
- Click the trash icon
- Confirm deletion
- Invoice is permanently removed

#### Download PDF from Saved Invoice
- Any saved invoice can generate a PDF at any time
- Click download or preview icons in the invoice list
- PDF is regenerated with current invoice data

### 4. Invoice Statuses

- **Draft**: Invoice is being prepared, not yet sent
- **Sent**: Invoice has been sent to client
- **Paid**: Payment has been received
- **Overdue**: Payment is past due date
- **Cancelled**: Invoice is cancelled

## Technical Details

### Database Collections

#### `company_profiles`
```typescript
{
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  email?: string;
  phone?: string;
  website?: string;
  taxId?: string;
  logo?: string;
  isDefault?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `bank_details`
```typescript
{
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  branchName?: string;
  branchAddress?: string;
  currency: 'USD' | 'BDT';
  isDefault?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### `invoices`
```typescript
{
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  fromProfileId: string;
  fromProfile?: CompanyProfile;
  billedTo: ClientInfo;
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxType: 'percentage' | 'fixed';
  taxValue: number;
  taxAmount: number;
  total: number;
  currency: 'USD' | 'BDT';
  bankDetailsId?: string;
  bankDetails?: BankDetails;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Components

- **InvoiceManager**: Main container component with tabs
- **InvoiceForm**: Create and edit invoice form
- **InvoiceList**: Display and search invoices
- **CompanyProfileManager**: Manage company profiles
- **BankDetailsManager**: Manage bank account details

### PDF Generation

Uses `jspdf` and `jspdf-autotable` libraries:
- Professional layout with company branding
- Automatic page formatting
- Table generation for line items
- Currency formatting
- Logo support

## Files Created

### Types
- `/types/invoice.ts` - TypeScript interfaces

### Components
- `/components/admin/InvoiceManager.tsx` - Main manager
- `/components/admin/InvoiceForm.tsx` - Invoice creation/editing
- `/components/admin/InvoiceList.tsx` - Invoice listing and search
- `/components/admin/CompanyProfileManager.tsx` - Company profiles
- `/components/admin/BankDetailsManager.tsx` - Bank details

### Utilities
- `/lib/pdf/invoice-generator.ts` - PDF generation

### Configuration
- Updated `/firestore.indexes.json` - Firestore indexes
- Updated `/app/admin/page.tsx` - Admin dashboard integration

## Dependencies

Already included in the project:
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF tables
- `date-fns` - Date formatting
- `firebase/firestore` - Database

## Access

Admin Dashboard → Finance Section → Invoices

## Security Notes

Currently using development Firestore rules (open access). For production:
1. Implement proper authentication
2. Add role-based access control
3. Restrict invoice operations to admin users
4. Add data validation rules

## Future Enhancements (Optional)

- Email invoice directly to clients
- Recurring invoices
- Invoice templates with custom designs
- Multi-language support
- Payment tracking and reminders
- Invoice analytics and reports
- Export invoices to Excel/CSV
- Client portal for viewing invoices
- Digital signatures
- Invoice approval workflow

## Support

For issues or questions:
1. Check Firestore console for data
2. Check browser console for errors
3. Verify company profiles and bank details are set up
4. Ensure invoice date format is correct
5. Test PDF generation with preview first

---

**System Status**: ✅ Fully Implemented and Integrated
**Last Updated**: November 2024
