export interface User {
  id: string;
  email: string;
  name: string;
  role: 'proveedor' | 'operaciones' | 'aprobador';
  company?: string;
  ruc?: string;
  avatar?: string;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Supplier {
  id: string;
  portalUserId: string;
  ruc: string;
  businessName: string;
  tradeName?: string;
  personType?: 'natural' | 'juridica';
  country?: string;
  customCountry?: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  contractedService?: string;
  documentType?: 'factura' | 'rhe';
  rucFileUrl?: string;
  bankAccounts: BankAccount[];
  // Additional fields for juridica
  employeeCount?: string;
  hasDiversity?: boolean;
  diversityPercentage?: string;
  annualRevenue?: string;
  referenceClients?: string;
  certifications?: string;
  // Status and dates
  status: 'pending' | 'approved' | 'rejected' | 'disabled' | 'pending_configuration';
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountType: 'corriente' | 'ahorros';
  currency: 'PEN' | 'USD';
  cci?: string;
}

export interface Document {
  id: string;
  supplierId: string;
  type: 'factura' | 'boleta' | 'recibo' | 'otro';
  number: string;
  amount: number;
  currency: 'PEN' | 'USD';
  hasDetraction: boolean;
  detractionPercentage?: number;
  detractionAmount?: number;
  detractionCode?: string;
  approverEmail: string;
  fileUrl: string;
  deliverables?: string;
  servicePerformed?: string;
  deliverablesFiles?: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }[];
  status: 'pendiente' | 'aprobado' | 'rechazado';
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  estimatedPaymentDate?: Date;
  paymentStatus: 'pendiente' | 'programado' | 'pagado';
  code?: string;
  budget?: string;
}

export interface CompanyDocument {
  id: string;
  name: string;
  type: 'contrato' | 'orden_compra' | 'acuerdo_confidencialidad' | 'manual_guia' | 'otro';
  fileUrl: string;
  supplierId?: string;
  uploadedBy: string;
  uploadedAt: Date;
  description?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'operativo' | 'financiero' | 'otro';
  targetRole?: 'proveedor' | 'operaciones' | 'aprobador' | 'all';
  targetSupplier?: string;
  isUrgent?: boolean;
  scheduledDate?: Date;
  attachments?: {
    name: string;
    url: string;
    type: string;
  }[];
  createdBy: string;
  createdAt: Date;
  isActive: boolean;
}

export interface FeedbackSurvey {
  id: string;
  supplierId: string;
  supplierName: string;
  rating: number;
  communication: number;
  paymentTiming: number;
  platformUsability: number;
  overallSatisfaction: number;
  comments?: string;
  suggestions?: string;
  submittedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
}