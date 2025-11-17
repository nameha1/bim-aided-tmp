export interface InvoiceItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface CompanyProfile {
  id?: string;
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
  signatureName?: string;
  signatureImage?: string;
  isDefault?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface BankDetails {
  id?: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber?: string;
  swiftCode?: string;
  branchName?: string;
  branchAddress?: string;
  currency: 'USD' | 'BDT';
  isDefault?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface ClientInfo {
  name: string;
  address: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  email?: string;
  phone?: string;
  taxId?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  
  // Company details
  fromProfileId: string;
  fromProfile?: CompanyProfile;
  
  // Client details
  billedTo: ClientInfo;
  
  // Items
  items: InvoiceItem[];
  
  // Calculations
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxType: 'percentage' | 'fixed';
  taxValue: number;
  taxAmount: number;
  total: number;
  
  // Currency
  currency: 'USD' | 'BDT';
  
  // Bank details
  bankDetailsId?: string;
  bankDetails?: BankDetails;
  
  // Additional information
  notes?: string;
  terms?: string;
  
  // Status
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  
  // Metadata
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
}

export interface InvoiceFormData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  fromProfileId: string;
  billedTo: ClientInfo;
  items: InvoiceItem[];
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  taxType: 'percentage' | 'fixed';
  taxValue: number;
  currency: 'USD' | 'BDT';
  bankDetailsId?: string;
  notes?: string;
  terms?: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}
