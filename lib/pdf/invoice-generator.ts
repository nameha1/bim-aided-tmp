import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces';

// Initialize pdfMake with fonts
if (pdfFonts && (pdfFonts as any).pdfMake) {
  (pdfMake as any).vfs = (pdfFonts as any).pdfMake.vfs;
} else {
  (pdfMake as any).vfs = pdfFonts;
}

// Helper to load logo from public folder
async function getLogoDataUrl(): Promise<string | null> {
  try {
    const response = await fetch('/Logo-BIMaided.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
    return null;
  }
}

function formatCurrency(amount: number, currency: 'USD' | 'BDT'): string {
  const formatted = amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (currency === 'USD') {
    return '$' + formatted;
  } else {
    return 'BDT ' + formatted;
  }
}

export async function generateInvoicePDF(invoice: Invoice): Promise<TDocumentDefinitions> {
  // Load logo
  const logoUrl = invoice.fromProfile?.logo || await getLogoDataUrl();

  // Build document content
  const content: Content[] = [];

  // Header with logo and invoice details - all in one line
  const headerContent: any = {
    columns: [
      {
        width: logoUrl ? 150 : 200,
        stack: [
          ...(logoUrl ? [{
            image: logoUrl,
            width: 120,
            alignment: 'left' as const,
            margin: [-5, -5, 0, 0] as [number, number, number, number]
          }] : [
            { text: 'INVOICE', style: 'title', color: '#0ea5e9', margin: [0, 5, 0, 0] as [number, number, number, number] }
          ])
        ]
      },
      {
        width: '*',
        text: ''
      },
      {
        width: 'auto',
        stack: [
          { text: [
            { text: 'Invoice #: ', bold: false },
            { text: invoice.invoiceNumber, bold: true }
          ], style: 'invoiceDetails', alignment: 'right' as const, margin: [0, 15, 0, 0] as [number, number, number, number] },
          { text: [
            { text: 'Date: ', bold: false },
            { text: format(new Date(invoice.invoiceDate), 'MMM dd, yyyy'), bold: true }
          ], style: 'invoiceDetails', alignment: 'right' as const },
          ...(invoice.dueDate ? [{ text: [
            { text: 'Due Date: ', bold: false },
            { text: format(new Date(invoice.dueDate), 'MMM dd, yyyy'), bold: true, color: '#dc2626' }
          ], style: 'invoiceDetails', alignment: 'right' as const }] : [])
        ]
      }
    ],
    margin: [0, 0, 0, 30] as [number, number, number, number]
  };

  content.push(headerContent);

  // FROM and BILLED TO sections
  const fromToContent: any = {
    columns: [
      {
        width: '50%',
        stack: [
          { text: 'FROM:', style: 'sectionHeader' },
          { text: invoice.fromProfile?.name || '', style: 'companyName' },
          ...(invoice.fromProfile ? [
            { text: invoice.fromProfile.address, style: 'addressText' },
            ...(invoice.fromProfile.city || invoice.fromProfile.state || invoice.fromProfile.zipCode ? 
              [{ text: [invoice.fromProfile.city, invoice.fromProfile.state, invoice.fromProfile.zipCode].filter(Boolean).join(', '), style: 'addressText' }] 
              : []),
            ...(invoice.fromProfile.country ? [{ text: invoice.fromProfile.country, style: 'addressText' }] : []),
            ...(invoice.fromProfile.email ? [{ text: 'Email: ' + invoice.fromProfile.email, style: 'addressText' }] : []),
            ...(invoice.fromProfile.phone ? [{ text: 'Phone: ' + invoice.fromProfile.phone, style: 'addressText' }] : []),
            ...(invoice.fromProfile.taxId ? [{ text: 'Tax ID: ' + invoice.fromProfile.taxId, style: 'addressText' }] : [])
          ] : [])
        ]
      },
      {
        width: '50%',
        stack: [
          { text: 'BILLED TO:', style: 'sectionHeader' },
          { text: invoice.billedTo.name, style: 'companyName' },
          { text: invoice.billedTo.address, style: 'addressText' },
          ...(invoice.billedTo.city || invoice.billedTo.state || invoice.billedTo.zipCode ? 
            [{ text: [invoice.billedTo.city, invoice.billedTo.state, invoice.billedTo.zipCode].filter(Boolean).join(', '), style: 'addressText' }] 
            : []),
          ...(invoice.billedTo.country ? [{ text: invoice.billedTo.country, style: 'addressText' }] : []),
          ...(invoice.billedTo.email ? [{ text: 'Email: ' + invoice.billedTo.email, style: 'addressText' }] : []),
          ...(invoice.billedTo.phone ? [{ text: 'Phone: ' + invoice.billedTo.phone, style: 'addressText' }] : []),
          ...(invoice.billedTo.taxId ? [{ text: 'Tax ID: ' + invoice.billedTo.taxId, style: 'addressText' }] : [])
        ]
      }
    ],
    margin: [0, 0, 0, 30] as [number, number, number, number]
  };

  content.push(fromToContent);

  // Items table - no header row, just colored border
  const tableBody: TableCell[][] = [];

  invoice.items.forEach((item, index) => {
    tableBody.push([
      { text: (index + 1).toString(), alignment: 'center' as const, style: 'tableCell' },
      { 
        stack: [
          { text: item.name, style: 'tableCell', bold: true },
          ...(item.description ? [{ text: item.description, style: 'tableCellSmall', color: '#666666' }] : [])
        ]
      },
      { text: item.quantity.toString(), alignment: 'center' as const, style: 'tableCell' },
      { text: formatCurrency(item.rate, invoice.currency), alignment: 'right' as const, style: 'tableCell' },
      { text: formatCurrency(item.amount, invoice.currency), alignment: 'right' as const, style: 'tableCell' }
    ]);
  });

  // Add header labels above table - using table layout for perfect alignment
  content.push({
    table: {
      widths: [30, '*', 50, 80, 80],
      body: [[
        { text: 'SL', style: 'tableHeaderLabel', alignment: 'center' as const, border: [false, false, false, false] },
        { text: 'DESCRIPTION', style: 'tableHeaderLabel', border: [false, false, false, false] },
        { text: 'QTY', style: 'tableHeaderLabel', alignment: 'center' as const, border: [false, false, false, false] },
        { text: 'RATE', style: 'tableHeaderLabel', alignment: 'right' as const, border: [false, false, false, false] },
        { text: 'AMOUNT', style: 'tableHeaderLabel', alignment: 'right' as const, border: [false, false, false, false] }
      ]]
    },
    layout: {
      paddingLeft: (i: number) => 12,
      paddingRight: (i: number) => 12,
      paddingTop: () => 0,
      paddingBottom: () => 0
    },
    margin: [0, 0, 0, 8] as [number, number, number, number]
  });

  content.push({
    table: {
      headerRows: 0,
      widths: [30, '*', 50, 80, 80],
      body: tableBody
    },
    layout: {
      fillColor: (rowIndex: number) => (rowIndex % 2 === 1 ? '#f7f9fc' : null),
      hLineWidth: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? 2 : 0.5,
      vLineWidth: () => 0,
      hLineColor: (i: number, node: any) => (i === 0 || i === node.table.body.length) ? '#0ea5e9' : '#e5e7eb',
      vLineColor: () => '#e0e0e0',
      paddingLeft: (i: number) => 12,
      paddingRight: (i: number) => 12,
      paddingTop: () => 8,
      paddingBottom: () => 8
    },
    margin: [0, 0, 0, 10] as [number, number, number, number]
  });

  // Summary section - aligned with table (QTY + RATE + AMOUNT = 50 + 80 + 80 = 210)
  const summaryWidth = 210;
  const labelWidth = 130;
  const valueWidth = 80;
  
  const summaryContent: any = {
    columns: [
      { width: '*', text: '' },
      {
        width: summaryWidth,
        stack: [
          {
            columns: [
              { text: 'Subtotal:', style: 'summaryLabel', width: labelWidth },
              { text: formatCurrency(invoice.subtotal, invoice.currency), style: 'summaryValue', alignment: 'right' as const, width: valueWidth }
            ],
            margin: [0, 0, 0, 6] as [number, number, number, number]
          },
          ...(invoice.discountAmount > 0 ? [{
            columns: [
              { 
                text: 'Discount (' + (invoice.discountType === 'percentage' ? invoice.discountValue + '%' : 'Fixed') + '):', 
                style: 'summaryLabel', 
                width: labelWidth 
              },
              { text: '-' + formatCurrency(invoice.discountAmount, invoice.currency), style: 'summaryValue', alignment: 'right' as const, width: valueWidth }
            ],
            margin: [0, 0, 0, 6] as [number, number, number, number]
          }] : []),
          ...(invoice.taxAmount > 0 ? [{
            columns: [
              { 
                text: 'Tax/AIT (' + (invoice.taxType === 'percentage' ? invoice.taxValue + '%' : 'Fixed') + '):', 
                style: 'summaryLabel', 
                width: labelWidth 
              },
              { text: formatCurrency(invoice.taxAmount, invoice.currency), style: 'summaryValue', alignment: 'right' as const, width: valueWidth }
            ],
            margin: [0, 0, 0, 8] as [number, number, number, number]
          }] : []),
          {
            canvas: [
              {
                type: 'line',
                x1: 0, y1: 0,
                x2: summaryWidth, y2: 0,
                lineWidth: 1.5,
                lineColor: '#0ea5e9'
              }
            ],
            margin: [0, 0, 0, 8] as [number, number, number, number]
          },
          {
            columns: [
              { text: 'TOTAL:', style: 'totalLabel', width: labelWidth, bold: true },
              { text: formatCurrency(invoice.total, invoice.currency), style: 'totalValue', alignment: 'right' as const, width: valueWidth, bold: true }
            ]
          }
        ]
      }
    ],
    margin: [0, 0, 0, 10] as [number, number, number, number]
  };

  content.push(summaryContent);

  // Notes
  if (invoice.notes) {
    content.push({
      stack: [
        { text: 'NOTES:', style: 'sectionHeader' },
        { text: invoice.notes, style: 'notes' }
      ],
      margin: [0, 8, 0, 6] as [number, number, number, number]
    });
  }

  // Terms
  if (invoice.terms) {
    content.push({
      stack: [
        { text: 'TERMS & CONDITIONS:', style: 'sectionHeader' },
        { text: invoice.terms, style: 'notes' }
      ],
      margin: [0, 0, 0, 10] as [number, number, number, number]
    });
  }

  // Bank details - fixed at bottom of page using absolute positioning
  if (invoice.bankDetails) {
    content.push({
      stack: [
        { text: 'BANK DETAILS:', style: 'sectionHeader', margin: [0, 0, 0, 4] as [number, number, number, number] },
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: 'Bank Name: ' + invoice.bankDetails.bankName, style: 'bankDetails' },
                { text: 'Account Name: ' + invoice.bankDetails.accountName, style: 'bankDetails' },
                { text: 'Account Number: ' + invoice.bankDetails.accountNumber, style: 'bankDetails' }
              ]
            },
            {
              width: '50%',
              stack: [
                ...(invoice.bankDetails.routingNumber ? [{ text: 'Routing Number: ' + invoice.bankDetails.routingNumber, style: 'bankDetails' }] : []),
                ...(invoice.bankDetails.swiftCode ? [{ text: 'SWIFT Code: ' + invoice.bankDetails.swiftCode, style: 'bankDetails' }] : []),
                ...(invoice.bankDetails.branchName ? [{ text: 'Branch: ' + invoice.bankDetails.branchName, style: 'bankDetails' }] : [])
              ]
            }
          ]
        },
        ...(invoice.bankDetails.branchAddress ? [{ text: 'Branch Address: ' + invoice.bankDetails.branchAddress, style: 'bankDetails', margin: [0, 2, 0, 0] as [number, number, number, number] }] : [])
      ],
      absolutePosition: { x: 40, y: 700 }
    });
  }

  // Footer - fixed at absolute bottom of page
  content.push({
    stack: [
      { 
        canvas: [
          {
            type: 'line',
            x1: 0, y1: 0,
            x2: 515, y2: 0,
            lineWidth: 1,
            lineColor: '#0ea5e9'
          }
        ],
        margin: [0, 0, 0, 6] as [number, number, number, number]
      },
      { text: 'Thank you for your business!', style: 'footer', alignment: 'center' as const, bold: true },
      ...(invoice.fromProfile?.website ? [{ text: invoice.fromProfile.website, style: 'footer', alignment: 'center' as const, margin: [0, 1, 0, 0] as [number, number, number, number], color: '#0ea5e9' }] : [])
    ],
    absolutePosition: { x: 40, y: 780 }
  });

  const docDefinition: TDocumentDefinitions = {
    content,
    styles: {
      title: {
        fontSize: 28,
        bold: true,
        margin: [0, 0, 0, 3] as [number, number, number, number]
      },
      invoiceDetails: {
        fontSize: 10,
        margin: [0, 2, 0, 0] as [number, number, number, number],
        lineHeight: 1.2
      },
      sectionHeader: {
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 4] as [number, number, number, number]
      },
      companyName: {
        fontSize: 11,
        bold: true,
        margin: [0, 0, 0, 3] as [number, number, number, number]
      },
      addressText: {
        fontSize: 9,
        margin: [0, 1, 0, 0] as [number, number, number, number],
        lineHeight: 1.2
      },
      tableHeaderLabel: {
        fontSize: 10,
        bold: true,
        color: '#0ea5e9'
      },
      tableCell: {
        fontSize: 10,
        margin: [0, 0, 0, 0] as [number, number, number, number],
        lineHeight: 1.1
      },
      tableCellSmall: {
        fontSize: 8,
        margin: [0, 2, 0, 0] as [number, number, number, number],
        lineHeight: 1.1
      },
      summaryLabel: {
        fontSize: 10,
        lineHeight: 1.1
      },
      summaryValue: {
        fontSize: 10,
        lineHeight: 1.1
      },
      totalLabel: {
        fontSize: 12,
        bold: true
      },
      totalValue: {
        fontSize: 13,
        bold: true,
        color: '#0ea5e9'
      },
      bankDetails: {
        fontSize: 9,
        margin: [0, 2, 0, 0] as [number, number, number, number],
        lineHeight: 1.2
      },
      notes: {
        fontSize: 9,
        margin: [0, 1, 0, 0] as [number, number, number, number],
        lineHeight: 1.2
      },
      footer: {
        fontSize: 9,
        color: '#666666',
        margin: [0, 1, 0, 0] as [number, number, number, number]
      }
    },
    defaultStyle: {
      font: 'Roboto'
    },
    pageMargins: [40, 30, 40, 30] as [number, number, number, number]
  };

  return docDefinition;
}

export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  const docDefinition = await generateInvoicePDF(invoice);
  pdfMake.createPdf(docDefinition).download('Invoice_' + invoice.invoiceNumber + '.pdf');
}

export async function previewInvoicePDF(invoice: Invoice): Promise<void> {
  const docDefinition = await generateInvoicePDF(invoice);
  pdfMake.createPdf(docDefinition).open();
}
