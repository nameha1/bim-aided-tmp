# Invoice Generator Feature

## Overview
Simple and professional invoice generation tool in the admin panel with PDF export functionality.

## Features

### Invoice Details
- **Invoice Number**: Custom invoice numbering
- **Invoice Date**: Automatic (current date) or custom
- **Due Date**: Optional payment due date

### Client Information
- Client Name (required)
- Client Email
- Client Phone
- Client Address (multi-line)

### Invoice Items
- **Dynamic Item List**: Add/remove items as needed
- **Fields per item**:
  - Description (service/product details)
  - Quantity
  - Rate (price per unit)
  - Amount (auto-calculated)

### Financial Calculations
- **Subtotal**: Automatic sum of all items
- **Tax**: Configurable tax rate (percentage)
- **Total**: Final amount with tax

### Additional Features
- **Notes/Terms**: Add payment terms, thank you messages, or other notes
- **Company Branding**: Automatically includes BIM-AIDED logo
- **Professional Layout**: Clean, business-ready PDF format

## How to Use

1. **Navigate to Invoice Tab**
   - Go to Admin Panel
   - Click on "Finance" section in sidebar
   - Select "Invoices"

2. **Fill Invoice Details**
   - Enter invoice number (e.g., INV-001)
   - Dates are pre-filled but can be changed

3. **Add Client Information**
   - Enter client name (required)
   - Add optional contact details

4. **Add Invoice Items**
   - Fill in description, quantity, and rate
   - Amount calculates automatically
   - Click "Add Item" to add more lines
   - Click trash icon to remove items

5. **Configure Tax**
   - Enter tax rate if applicable (e.g., 13 for 13%)
   - Total updates automatically

6. **Add Notes** (Optional)
   - Payment terms (e.g., "Due within 30 days")
   - Thank you message
   - Bank details or payment instructions

7. **Generate PDF**
   - Click "Generate PDF Invoice" button
   - PDF downloads automatically
   - Filename: `Invoice_[number].pdf`

## PDF Layout

### Header
- Company logo (top left)
- Company information (top right)
  - Name: BIM-AIDED
  - Address, phone, email

### Invoice Details
- Invoice number
- Issue date
- Due date

### Bill To Section
- Client name and address
- Contact information

### Items Table
- Professional table with columns:
  - Description
  - Quantity
  - Rate
  - Amount
- Striped rows for readability

### Totals Section
- Subtotal
- Tax (if applicable)
- **Bold Total Amount**

### Footer
- Custom notes/terms
- "Thank you for your business!" message

## Technical Details

### Dependencies
- `jspdf`: PDF generation library
- `jspdf-autotable`: Table generation plugin

### File Location
- Component: `/components/admin/InvoiceGenerator.tsx`
- Admin Panel: `/app/admin/page.tsx`

### Logo
- Location: `/public/Logo-BIMaided.png`
- Automatically included in PDF header

## Customization

### Company Information
To update company details in the PDF, edit lines in `InvoiceGenerator.tsx`:

```typescript
doc.text("BIM-AIDED", 200, 20, { align: "right" });
doc.text("Your Company Address", 200, 25, { align: "right" });
doc.text("Phone: Your Phone Number", 200, 30, { align: "right" });
doc.text("Email: info@bim-aided.com", 200, 35, { align: "right" });
```

### Colors
- Header color: Blue (#3b82f6)
- Can be customized in `headStyles: { fillColor: [59, 130, 246] }`

### Logo Size
- Current: 40mm width x 15mm height
- Adjust in: `doc.addImage(logoUrl, "PNG", 15, 15, 40, 15)`

## Future Enhancements (Optional)

- [ ] Save invoices to Firebase
- [ ] Invoice templates (different designs)
- [ ] Multi-currency support
- [ ] Email invoice directly to client
- [ ] Invoice history/list view
- [ ] Recurring invoices
- [ ] Payment tracking
- [ ] Custom logo upload per invoice
- [ ] Multiple tax rates
- [ ] Discount fields

## Example Use Case

**Scenario**: Creating an invoice for BIM modeling services

1. Invoice Number: `INV-2025-001`
2. Client: ABC Construction Ltd.
3. Items:
   - BIM Modeling - Architectural: Qty 1, Rate $5,000
   - MEP Coordination: Qty 1, Rate $3,000
   - Clash Detection Report: Qty 1, Rate $1,500
4. Tax: 13%
5. Notes: "Payment due within 30 days. Thank you for your business!"
6. Total: $10,735 (including tax)

Click "Generate PDF Invoice" and the PDF is ready to send to the client!
