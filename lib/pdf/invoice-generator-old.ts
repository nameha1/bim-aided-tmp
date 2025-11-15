import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

// Initialize pdfMake with fonts
pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  const symbol = currency === 'USD' ? '$' : '৳';
  return symbol + amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export async function generateInvoicePDF(invoice: Invoice): Promise<TDocumentDefinitions> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  let yPos = 20;
  
  // Try to load company logo
  const logoUrl = invoice.fromProfile?.logo || await getLogoDataUrl();
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', pageWidth - 65, 10, 55, 22);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }
  
  // Add company logo if available (top right)
  if (invoice.fromProfile?.logo) {
    try {
      // Logo in top right corner
      doc.addImage(invoice.fromProfile.logo, 'PNG', pageWidth - 60, 10, 50, 20);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }
  
  // Title
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(14, 165, 233); // Cyan color
  doc.text('INVOICE', 20, yPos);
  
  // Invoice details (right aligned) - Start at same level as title
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const rightColX = pageWidth - 20;
  let rightYPos = 18;
  doc.text('Invoice #: ' + invoice.invoiceNumber, rightColX, rightYPos, { align: 'right' });
  rightYPos += 6;
  doc.text('Date: ' + format(new Date(invoice.invoiceDate), 'MMM dd, yyyy'), rightColX, rightYPos, { align: 'right' });
  rightYPos += 6;
  if (invoice.dueDate) {
    doc.text('Due Date: ' + format(new Date(invoice.dueDate), 'MMM dd, yyyy'), rightColX, rightYPos, { align: 'right' });
  }
  
  yPos += 15;
  
  // From section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('FROM:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  if (invoice.fromProfile) {
    doc.text(invoice.fromProfile.name, 20, yPos);
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const fromLines = [];
    if (invoice.fromProfile.address) fromLines.push(invoice.fromProfile.address);
    if (invoice.fromProfile.city || invoice.fromProfile.state || invoice.fromProfile.zipCode) {
      fromLines.push([invoice.fromProfile.city, invoice.fromProfile.state, invoice.fromProfile.zipCode].filter(Boolean).join(', '));
    }
    if (invoice.fromProfile.country) fromLines.push(invoice.fromProfile.country);
    if (invoice.fromProfile.email) fromLines.push('Email: ' + invoice.fromProfile.email);
    if (invoice.fromProfile.phone) fromLines.push('Phone: ' + invoice.fromProfile.phone);
    if (invoice.fromProfile.taxId) fromLines.push('Tax ID: ' + invoice.fromProfile.taxId);
    
    fromLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 5;
    });
  }
  
  // Billed To section
  yPos += 8;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BILLED TO:', 20, yPos);
  yPos += 7;
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(invoice.billedTo.name, 20, yPos);
  yPos += 6;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const billedToLines = [];
  if (invoice.billedTo.address) billedToLines.push(invoice.billedTo.address);
  if (invoice.billedTo.city || invoice.billedTo.state || invoice.billedTo.zipCode) {
    billedToLines.push([invoice.billedTo.city, invoice.billedTo.state, invoice.billedTo.zipCode].filter(Boolean).join(', '));
  }
  if (invoice.billedTo.country) billedToLines.push(invoice.billedTo.country);
  if (invoice.billedTo.email) billedToLines.push('Email: ' + invoice.billedTo.email);
  if (invoice.billedTo.phone) billedToLines.push('Phone: ' + invoice.billedTo.phone);
  if (invoice.billedTo.taxId) billedToLines.push('Tax ID: ' + invoice.billedTo.taxId);
  
  billedToLines.forEach(line => {
    doc.text(line, 20, yPos);
    yPos += 5;
  });
  
  yPos += 12;
  
  // Items table
  const tableData = invoice.items.map((item, index) => [
    String(index + 1),
    item.name + (item.description ? `\n${item.description}` : ''),
    String(item.quantity),
    formatCurrency(item.rate, invoice.currency),
    formatCurrency(item.amount, invoice.currency),
  ]);
  
  autoTable(doc, {
    startY: yPos,
    head: [['#', 'Description', 'Qty', 'Rate', 'Amount']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [14, 165, 233], // Cyan color
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 35, halign: 'right' },
    },
  });
  
  // Get the final Y position after the table
  yPos = (doc as any).lastAutoTable.finalY + 15;
  
  // Summary section (right aligned)
  const summaryX = pageWidth - 85;
  const labelX = summaryX;
  const valueX = pageWidth - 20;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  // Subtotal
  doc.text('Subtotal:', labelX, yPos);
  doc.text(formatCurrency(invoice.subtotal, invoice.currency), valueX, yPos, { align: 'right' });
  yPos += 7;
  
  // Discount
  if (invoice.discountAmount > 0) {
    const discountLabel = invoice.discountType === 'percentage' 
      ? 'Discount (' + invoice.discountValue + '%):'
      : 'Discount:';
    doc.text(discountLabel, labelX, yPos);
    doc.text('-' + formatCurrency(invoice.discountAmount, invoice.currency), valueX, yPos, { align: 'right' });
    yPos += 7;
  }
  
  // Tax/AIT
  if (invoice.taxAmount > 0) {
    const taxLabel = invoice.taxType === 'percentage' 
      ? 'Tax/AIT (' + invoice.taxValue + '%):'
      : 'Tax/AIT:';
    doc.text(taxLabel, labelX, yPos);
    doc.text(formatCurrency(invoice.taxAmount, invoice.currency), valueX, yPos, { align: 'right' });
    yPos += 7;
  }
  
  // Total line
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(summaryX, yPos - 2, pageWidth - 20, yPos - 2);
  yPos += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('TOTAL:', labelX, yPos);
  doc.text(formatCurrency(invoice.total, invoice.currency), valueX, yPos, { align: 'right' });
  yPos += 15;
  
  // Bank details
  if (invoice.bankDetails) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BANK DETAILS:', 20, yPos);
    yPos += 7;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const bankLines = [
      'Bank Name: ' + invoice.bankDetails.bankName,
      'Account Name: ' + invoice.bankDetails.accountName,
      'Account Number: ' + invoice.bankDetails.accountNumber,
    ];
    
    if (invoice.bankDetails.routingNumber) {
      bankLines.push('Routing Number: ' + invoice.bankDetails.routingNumber);
    }
    if (invoice.bankDetails.swiftCode) {
      bankLines.push('SWIFT Code: ' + invoice.bankDetails.swiftCode);
    }
    if (invoice.bankDetails.branchName) {
      bankLines.push('Branch: ' + invoice.bankDetails.branchName);
    }
    if (invoice.bankDetails.branchAddress) {
      bankLines.push('Branch Address: ' + invoice.bankDetails.branchAddress);
    }
    
    bankLines.forEach(line => {
      doc.text(line, 20, yPos);
      yPos += 6;
    });
    yPos += 5;
  }
  
  // Notes
  if (invoice.notes) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTES:', 20, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, pageWidth - 40);
    doc.text(noteLines, 20, yPos);
    yPos += (noteLines.length * 5);
  }
  
  // Terms
  if (invoice.terms) {
    yPos += 5;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 20, yPos);
    yPos += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const termLines = doc.splitTextToSize(invoice.terms, pageWidth - 40);
    doc.text(termLines, 20, yPos);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' }
  );
  
  if (invoice.fromProfile?.website) {
    doc.text(
      invoice.fromProfile.website,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }
  
  return doc;
}

function formatCurrency(amount: number, currency: 'USD' | 'BDT'): string {
  const symbol = currency === 'USD' ? '$' : '৳';
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export async function downloadInvoicePDF(invoice: Invoice): Promise<void> {
  const doc = await generateInvoicePDF(invoice);
  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
}

export async function previewInvoicePDF(invoice: Invoice): Promise<void> {
  const doc = await generateInvoicePDF(invoice);
  const pdfBlob = doc.output('blob');
  const pdfUrl = URL.createObjectURL(pdfBlob);
  window.open(pdfUrl, '_blank');
}
