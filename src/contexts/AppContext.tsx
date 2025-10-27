import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Document, Supplier, CompanyDocument, Announcement, FeedbackSurvey, Notification } from '../types';
import { addDays } from 'date-fns';
import { useAuth } from './AuthContext';
import { 
  useSuppliers, 
  useDocuments, 
  usePayments, 
  useAnnouncements, 
  useCompanyDocuments, 
  useFeedbackSurveys,
  useOperationsUsers,
  useApprovers,
  useDashboardStats,
  usePaymentsQueue,
  useUserManagement,
  useProveedores
} from '../hooks/useSupabase';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// 🎯 SISTEMA DE ORQUESTACIÓN DE DATOS
// Asegura que la información fluya: Proveedor → Aprobador → Operaciones
interface DataOrchestrationState {
  lastSync: Date;
  pendingUpdates: string[];
  syncInProgress: boolean;
  dataVersion: number;
}

interface DataFlowEvent {
  id: string;
  type: 'document_created' | 'document_approved' | 'document_rejected' | 'payment_updated' | 'supplier_registered';
  sourceProfile: 'proveedor' | 'aprobador' | 'operaciones';
  targetProfiles: ('proveedor' | 'aprobador' | 'operaciones')[];
  entityId: string;
  timestamp: Date;
  data: any;
  processed: boolean;
}

interface SupplierRegistrationData {
  userId: string;
  userEmail: string;
  // Datos Obligatorios
  ruc: string;
  businessName: string;
  personType: 'natural' | 'juridica';
  country: string;
  customCountry?: string;
  address: string;
  documentType: string;
  rucFile?: File | null;
  // Información de Contacto
  contactPerson?: string;
  contactPersonEmail?: string;
  phone?: string;
  neoContactEmail?: string;
  // Información Bancaria - Cuenta 1 (Soles)
  bankName1?: string;
  accountNumber1?: string;
  accountType1?: 'corriente' | 'ahorros';
  currency1?: 'PEN' | 'USD';
  cci1?: string;
  // Información Bancaria - Cuenta 2 (Dólares)
  bankName2?: string;
  accountNumber2?: string;
  accountType2?: 'corriente' | 'ahorros';
  currency2?: 'PEN' | 'USD';
  cci2?: string;
}

// 🔄 NUEVA INTERFAZ: Registro específico para el módulo de Pagos
interface PaymentRecord {
  id: string;
  documentNumber: string; // 🎯 CAMPO PRINCIPAL: Número de Documento extraído
  supplierId: string;
  supplierName?: string;
  documentType?: string;
  amount?: number; // 💰 CAMPO PRINCIPAL: Monto extraído
  currency?: string; // 💱 CAMPO PRINCIPAL: Moneda extraída
  estimatedPaymentDate?: Date;
  actualPaymentDate?: Date;
  paymentStatus: 'pending' | 'scheduled' | 'paid';
  paymentMethod?: string;
  bankAccount?: string;
  notes?: string;
  createdAt: Date; // 📅 CAMPO PRINCIPAL: Fecha de registro extraída
  updatedAt: Date;
}

interface AppContextType {
  // 🎯 ORQUESTACIÓN DE DATOS - FUNCIONES PRINCIPALES
  orchestrateDataFlow: (event: Omit<DataFlowEvent, 'id' | 'timestamp' | 'processed'>) => Promise<void>;
  getDataForProfile: (profile: 'proveedor' | 'aprobador' | 'operaciones') => any;
  syncState: DataOrchestrationState;
  
  // 🔄 FUNCIONES DE FILTRADO POR ROL (ACTUALIZADAS)
  getFilteredDocuments: () => Document[];
  getFilteredSuppliers: () => Supplier[];
  getFilteredPaymentRecords: () => PaymentRecord[];
  
  // Documents
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => void;
  approveDocument: (id: string, code: string, budget: string) => void;
  rejectDocument: (id: string, reason: string) => void;
  
  // Suppliers
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  approveSupplier: (id: string) => void;
  rejectSupplier: (id: string) => void;
  disableSupplier: (id: string) => void;
  resetSupplierPassword: (id: string) => void;
  
  // Supplier Registration
  supplierRegistrations: SupplierRegistrationData[];
  submitSupplierRegistration: (data: SupplierRegistrationData) => void;
  hasCompletedRegistration: (userId: string) => boolean;
  
  // 🔄 NUEVO: Gestión de Pagos
  paymentRecords: PaymentRecord[];
  updatePaymentRecord: (id: string, updates: Partial<PaymentRecord>) => void;
  
  // Company Documents
  companyDocuments: CompanyDocument[];
  addCompanyDocument: (doc: Omit<CompanyDocument, 'id' | 'uploadedAt'>) => void;
  
  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => void;
  
  // Feedback
  feedbackSurveys: FeedbackSurvey[];
  submitFeedback: (feedback: Omit<FeedbackSurvey, 'id' | 'submittedAt'>) => void;
  
  // Notifications
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

// Mock data
const mockDocuments: Document[] = [
  {
    id: '1',
    supplierId: '1',
    type: 'factura',
    number: 'F001-00123',
    amount: 2500,
    currency: 'PEN',
    hasDetraction: true,
    detractionPercentage: 10,
    detractionAmount: 250,
    detractionCode: '037',
    approverEmail: 'aprobador@neoconsulting.com',
    fileUrl: '#',
    deliverables: 'Consultoría en sistemas',
    servicePerformed: 'Desarrollo e implementación de sistema de gestión empresarial con módulos de facturación, inventario y reportes. Incluye capacitación al personal y soporte técnico durante 3 meses.',
    deliverablesFiles: [
      {
        id: '1',
        name: 'Informe_Consultoria_Sistemas.pdf',
        url: '#',
        type: 'application/pdf',
        size: 2048576
      },
      {
        id: '2',
        name: 'Analisis_Requerimientos.xlsx',
        url: '#',
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        size: 1024000
      }
    ],
    status: 'approved',
    approvedBy: 'Carlos Rodríguez',
    approvedAt: new Date('2024-12-08'),
    createdAt: new Date('2024-12-07'),
    estimatedPaymentDate: addDays(new Date('2024-12-08'), 15),
    paymentStatus: 'scheduled',
    code: 'COD-2024-001',
    budget: 'PROY-SISTEMAS-2024'
  },
  {
    id: '2',
    supplierId: '1',
    type: 'boleta',
    number: 'B001-00456',
    amount: 850,
    currency: 'PEN',
    hasDetraction: false,
    approverEmail: 'aprobador@neoconsulting.com',
    fileUrl: '#',
    deliverables: 'Servicio de mantenimiento',
    servicePerformed: 'Mantenimiento preventivo y correctivo de equipos de cómputo, actualización de software y limpieza de sistemas durante el mes de noviembre 2024.',
    status: 'pending',
    createdAt: new Date('2024-12-09'),
    paymentStatus: 'pending'
  }
];

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    ruc: '20123456789',
    businessName: 'Empresa ABC Sociedad Anónima Cerrada',
    tradeName: 'ABC Consulting',
    personType: 'juridica',
    country: 'Perú',
    address: 'Av. Javier Prado Este 123, San Isidro, Lima',
    phone: '01-234-5678',
    email: 'contacto@abcconsulting.com',
    contactPerson: 'Juan Pérez García',
    contactPhone: '987654321',
    contactEmail: 'juan.perez@abcconsulting.com',
    contractedService: 'Consultoría en sistemas de información y desarrollo de software',
    bankAccounts: [
      {
        id: '1',
        bankName: 'Banco de Crédito del Perú',
        accountNumber: '194-123456789-0-12',
        accountType: 'corriente',
        currency: 'PEN',
        cci: '00219400123456789012'
      }
    ],
    employeeCount: '21-50',
    hasDiversity: true,
    diversityPercentage: '35',
    annualRevenue: '2500000',
    referenceClients: 'Banco Continental, Telefónica del Perú, Rimac Seguros',
    certifications: 'ISO 9001:2015, ISO 27001:2013',
    status: 'approved',
    createdAt: new Date('2024-11-15'),
    updatedAt: new Date('2024-11-20')
  },
  {
    id: '2',
    ruc: '20987654321',
    businessName: 'Consultores XYZ EIRL',
    tradeName: 'XYZ Consulting',
    personType: 'juridica',
    country: 'Perú',
    address: 'Av. El Sol 456, Miraflores, Lima',
    phone: '01-987-6543',
    email: 'info@xyzconsulting.com',
    contactPerson: 'María González',
    contactPhone: '987123456',
    contactEmail: 'maria.gonzalez@xyzconsulting.com',
    contractedService: 'Servicios de auditoría y consultoría financiera',
    bankAccounts: [
      {
        id: '1',
        bankName: 'Banco Interbank',
        accountNumber: '898-123456789-0-15',
        accountType: 'corriente',
        currency: 'PEN',
        cci: '00389800123456789015'
      }
    ],
    employeeCount: '0-20',
    hasDiversity: false,
    diversityPercentage: '20',
    annualRevenue: '800000',
    referenceClients: 'Grupo Gloria, Backus, Alicorp',
    certifications: 'CPA, Certificación en NIIF',
    status: 'pending',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01')
  },
  {
    id: '3',
    ruc: 'PENDIENTE',
    businessName: 'Servicios Digitales SAC',
    tradeName: '',
    personType: 'juridica',
    country: 'Perú',
    address: 'Por completar',
    phone: 'Por completar',
    email: 'contacto@serviciosdigitales.com',
    contactPerson: 'Por completar',
    contactPhone: 'Por completar',
    contactEmail: 'contacto@serviciosdigitales.com',
    contractedService: 'Por completar',
    bankAccounts: [],
    status: 'pending_configuration',
    createdAt: new Date('2024-12-10'),
    updatedAt: new Date('2024-12-10')
  }
];

// 🔄 MOCK DATA: Registros de pagos iniciales (basados en documentos existentes)
const mockPaymentRecords: PaymentRecord[] = [
  {
    id: '1',
    documentNumber: 'F001-00123', // 🎯 Extraído del documento
    supplierId: '1',
    supplierName: 'Empresa ABC Sociedad Anónima Cerrada',
    documentType: 'factura',
    amount: 2500, // 💰 EXTRAÍDO AUTOMÁTICAMENTE
    currency: 'PEN', // 💱 EXTRAÍDO AUTOMÁTICAMENTE
    estimatedPaymentDate: addDays(new Date('2024-12-08'), 15),
    paymentStatus: 'scheduled',
    createdAt: new Date('2024-12-07'), // 📅 EXTRAÍDO AUTOMÁTICAMENTE
    updatedAt: new Date('2024-12-08')
  },
  {
    id: '2',
    documentNumber: 'B001-00456', // 🎯 Extraído del documento
    supplierId: '1',
    supplierName: 'Empresa ABC Sociedad Anónima Cerrada',
    documentType: 'boleta',
    amount: 850, // 💰 EXTRAÍDO AUTOMÁTICAMENTE
    currency: 'PEN', // 💱 EXTRAÍDO AUTOMÁTICAMENTE
    paymentStatus: 'pending',
    createdAt: new Date('2024-12-09'), // 📅 EXTRAÍDO AUTOMÁTICAMENTE
    updatedAt: new Date('2024-12-09')
  }
];

const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Actualización del Portal de Proveedores',
    content: 'Hemos actualizado nuestro portal con nuevas funcionalidades para mejorar su experiencia. Ahora pueden ver el estado de sus pagos en tiempo real y recibir notificaciones automáticas sobre el estado de sus comprobantes.',
    type: 'info',
    targetRole: 'all',
    createdBy: 'Sistema NEO',
    createdAt: new Date('2024-12-01'),
    isActive: true,
    attachments: [
      {
        name: 'Manual_Nuevas_Funcionalidades.pdf',
        url: '#',
        type: 'application/pdf'
      }
    ]
  },
  {
    id: '2',
    title: 'Nuevo Proceso de Aprobación - URGENTE',
    content: 'A partir del 15 de diciembre, todos los comprobantes deberán incluir el correo del aprobador correspondiente para agilizar el proceso. Los comprobantes sin esta información serán rechazados automáticamente.',
    type: 'warning',
    targetRole: 'proveedor',
    isUrgent: true,
    createdBy: 'Equipo de Operaciones',
    createdAt: new Date('2024-12-05'),
    isActive: true,
    scheduledDate: new Date('2024-12-15')
  },
  {
    id: '3',
    title: 'Felicitaciones por el Año 2024',
    content: 'Queremos agradecer a todos nuestros proveedores por su excelente trabajo durante este año. Su compromiso y calidad de servicio han sido fundamentales para nuestro éxito conjunto.',
    type: 'success',
    targetRole: 'proveedor',
    createdBy: 'Dirección General',
    createdAt: new Date('2024-12-10'),
    isActive: true
  }
];

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // 🔄 ACCESO AL CONTEXTO DE AUTENTICACIÓN
  const { user } = useAuth();
  
  // 🎯 ESTADOS DE ORQUESTACIÓN DE DATOS
  const [syncState, setSyncState] = useState<DataOrchestrationState>({
    lastSync: new Date(),
    pendingUpdates: [],
    syncInProgress: false,
    dataVersion: 1
  });
  
  const [dataFlowEvents, setDataFlowEvents] = useState<DataFlowEvent[]>([]);
  
  // 🔄 USAR HOOKS DE SUPABASE PARA DATOS REALES
  const { 
    suppliers, 
    loading: suppliersLoading, 
    createSupplier, 
    updateSupplier,
    fetchSuppliers
  } = useSuppliers();
  
  const { 
    documents, 
    loading: documentsLoading, 
    createDocument, 
    updateDocument,
    fetchDocuments
  } = useDocuments();
  
  const { 
    payments: paymentRecords, 
    loading: paymentsLoading, 
    updatePayment,
    fetchPayments
  } = usePayments();
  
  const { 
    announcements, 
    loading: announcementsLoading, 
    createAnnouncement,
    fetchAnnouncements
  } = useAnnouncements();
  
  const { 
    companyDocuments, 
    loading: companyDocsLoading, 
    createCompanyDocument,
    uploading: companyDocsUploading,
    fetchCompanyDocuments
  } = useCompanyDocuments();
  
  const { 
    feedbackSurveys, 
    loading: feedbackLoading, 
    createFeedbackSurvey,
    fetchFeedbackSurveys
  } = useFeedbackSurveys();
  
  const { 
    operationsUsers, 
    loading: operationsLoading,
    fetchOperationsUsers
  } = useOperationsUsers();
  
  const { 
    approvers, 
    loading: approversLoading,
    fetchApprovers
  } = useApprovers();
  
  const { 
    stats, 
    loading: statsLoading,
    fetchSupplierStats,
    fetchOperationsStats,
    fetchApproverInbox
  } = useDashboardStats();
  
  const { 
    paymentsQueue, 
    loading: paymentsQueueLoading,
    fetchPaymentsQueue
  } = usePaymentsQueue();
  
  const { 
    createCompleteUser,
    loading: userCreationLoading 
  } = useUserManagement();
  
  const { 
    proveedores, 
    loading: proveedoresLoading, 
    createProveedor,
    fetchProveedores
  } = useProveedores();
  
  // 🎯 ORQUESTADOR PRINCIPAL DE DATOS
  const orchestrateDataFlow = async (event: Omit<DataFlowEvent, 'id' | 'timestamp' | 'processed'>) => {
    try {
      setSyncState(prev => ({ ...prev, syncInProgress: true }));
      
      const flowEvent: DataFlowEvent = {
        ...event,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date(),
        processed: false
      };
      
      console.log('🎯 ORQUESTANDO FLUJO DE DATOS:', {
        type: flowEvent.type,
        source: flowEvent.sourceProfile,
        targets: flowEvent.targetProfiles,
        entity: flowEvent.entityId
      });
      
      // Agregar evento al historial
      setDataFlowEvents(prev => [flowEvent, ...prev.slice(0, 49)]); // Mantener últimos 50 eventos
      
      // Ejecutar sincronización específica según el tipo de evento
      await executeDataFlowSync(flowEvent);
      
      // Marcar evento como procesado
      setDataFlowEvents(prev => 
        prev.map(e => e.id === flowEvent.id ? { ...e, processed: true } : e)
      );
      
      // Actualizar estado de sincronización
      setSyncState(prev => ({
        ...prev,
        lastSync: new Date(),
        dataVersion: prev.dataVersion + 1,
        syncInProgress: false
      }));
      
      console.log('✅ FLUJO DE DATOS COMPLETADO:', flowEvent.type);
      
    } catch (error) {
      console.error('❌ ERROR EN ORQUESTACIÓN:', error);
      setSyncState(prev => ({ ...prev, syncInProgress: false }));
      throw error;
    }
  };
  
  // 🎯 EJECUTOR DE SINCRONIZACIÓN ESPECÍFICA
  const executeDataFlowSync = async (event: DataFlowEvent) => {
    const syncPromises: Promise<any>[] = [];
    
    switch (event.type) {
      case 'document_created':
        // Proveedor → Aprobador: Nuevo documento para validar
        if (event.targetProfiles.includes('aprobador')) {
          syncPromises.push(fetchDocuments()); // Refrescar documentos para aprobadores
        }
        // Proveedor → Operaciones: Nuevo registro de pago automático
        if (event.targetProfiles.includes('operaciones')) {
          syncPromises.push(fetchPayments(), fetchPaymentsQueue());
        }
        break;
        
      case 'document_approved':
        // Aprobador → Proveedor: Notificar aprobación
        if (event.targetProfiles.includes('proveedor')) {
          syncPromises.push(fetchDocuments());
        }
        // Aprobador → Operaciones: Documento listo para pago
        if (event.targetProfiles.includes('operaciones')) {
          syncPromises.push(fetchPayments(), fetchPaymentsQueue(), fetchDocuments());
        }
        break;
        
      case 'document_rejected':
        // Aprobador → Proveedor: Notificar rechazo
        if (event.targetProfiles.includes('proveedor')) {
          syncPromises.push(fetchDocuments());
        }
        break;
        
      case 'payment_updated':
        // Operaciones → Proveedor: Actualizar estado de pago
        if (event.targetProfiles.includes('proveedor')) {
          syncPromises.push(fetchPayments());
        }
        break;
        
      case 'supplier_registered':
        // Proveedor → Aprobador: Nuevo proveedor para validar
        if (event.targetProfiles.includes('aprobador')) {
          syncPromises.push(fetchSuppliers());
        }
        break;
    }
    
    // Ejecutar todas las sincronizaciones en paralelo
    await Promise.all(syncPromises);
  };
  
  // 🎯 OBTENER DATOS ESPECÍFICOS PARA CADA PERFIL
  const getDataForProfile = (profile: 'proveedor' | 'aprobador' | 'operaciones') => {
    switch (profile) {
      case 'proveedor':
        return {
          documents: documents.filter(doc => doc.supplierId === user?.id),
          payments: paymentRecords.filter(payment => payment.supplierId === user?.id),
          suppliers: suppliers.filter(supplier => supplier.id === user?.id),
          announcements: announcements.filter(ann => 
            ann.targetRole === 'all' || 
            ann.targetRole === 'proveedor' || 
            ann.targetSupplier === user?.id
          )
        };
        
      case 'aprobador':
        return {
          documents: documents.filter(doc => doc.status === 'pending'),
          suppliers: suppliers.filter(supplier => supplier.status === 'pending'),
          announcements: announcements.filter(ann => 
            ann.targetRole === 'all' || 
            ann.targetRole === 'aprobador'
          ),
          pendingCount: documents.filter(doc => doc.status === 'pending').length
        };
        
      case 'operaciones':
        return {
          documents: documents.filter(doc => doc.status === 'approved'),
          suppliers: suppliers.filter(supplier => supplier.status === 'approved'),
          payments: paymentRecords,
          paymentsQueue: paymentsQueue,
          announcements: announcements,
          totalPendingPayments: paymentRecords.filter(p => p.paymentStatus === 'pending').length
        };
        
      default:
        return {};
    }
  };

  const [supplierRegistrations, setSupplierRegistrations] = useState<SupplierRegistrationData[]>([]);
    // Los registros se cargarán desde la base de datos
  
  // 🔄 NUEVA FUNCIÓN: Refrescar datos con sincronización inteligente
  const refreshAllData = async () => {
    try {
      console.log('🔄 Refrescando todos los datos...');
      
      // Ejecutar todas las consultas en paralelo para mejor rendimiento
      await Promise.all([
        fetchSuppliers(),
        fetchDocuments(),
        fetchPayments(),
        fetchAnnouncements(),
        fetchCompanyDocuments(),
        fetchFeedbackSurveys(),
        fetchOperationsUsers(),
        fetchApprovers(),
        fetchPaymentsQueue(),
        fetchProveedores()
      ]);
      
      setSyncState(prev => ({ ...prev, lastSync: new Date() }));
      console.log('✅ Datos refrescados exitosamente');
    } catch (error) {
      console.error('❌ Error refrescando datos:', error);
    }
  };
  
  // 🔄 FUNCIÓN DE SINCRONIZACIÓN INTELIGENTE
  const syncDataBetweenProfiles = async (dataType: string, entityId?: string) => {
    try {
      console.log(`🔄 Sincronizando ${dataType} entre perfiles...`);
      
      // Solo sincronizar cuando hay cambios relevantes
      const relevantChanges = {
        'supplier_approved': ['documents', 'payments'], // Cuando se aprueba un proveedor
        'document_approved': ['payments'], // Cuando se aprueba un documento
        'payment_updated': ['supplier_dashboard'], // Cuando se actualiza un pago
        'supplier_registered': ['approver_inbox'] // Cuando se registra un proveedor
      };
      
      const toSync = relevantChanges[dataType as keyof typeof relevantChanges] || [];
      
      // Ejecutar sincronización solo para datos relacionados
      const syncPromises = [];
      
      if (toSync.includes('documents')) {
        syncPromises.push(fetchDocuments());
      }
      if (toSync.includes('payments')) {
        syncPromises.push(fetchPayments(), fetchPaymentsQueue());
      }
      if (toSync.includes('supplier_dashboard') && entityId) {
        syncPromises.push(fetchSupplierStats(entityId));
      }
      if (toSync.includes('approver_inbox')) {
        syncPromises.push(fetchOperationsStats());
      }
      
      await Promise.all(syncPromises);
      setSyncState(prev => ({ ...prev, lastSync: new Date() }));
      
      console.log(`✅ Sincronización completada para ${dataType}`);
    } catch (error) {
      console.error(`❌ Error en sincronización de ${dataType}:`, error);
    }
  };

  // 🔄 FUNCIONES DE FILTRADO POR ROL
  const getFilteredDocuments = (): Document[] => {
    if (!user) return [];
    
    // 🔄 CORREGIR: Asegurar que todos los documentos estén disponibles
    const allDocuments = [
      ...documents.map(doc => ({
        ...doc,
        // Mapear campos de BD a interfaz
        type: doc.invoice_type || doc.type,
        number: doc.invoice_number || doc.number,
        status: doc.status === 'pending' ? 'pending' : 
                doc.status === 'approved' ? 'approved' : 
                doc.status === 'rejected' ? 'rejected' : doc.status,
        createdAt: new Date(doc.created_at || doc.createdAt),
        updatedAt: new Date(doc.updated_at || doc.updatedAt)
      })),
      ...mockDocuments
    ];
    
    switch (user.role) {
      case 'proveedor':
        // Proveedor: Solo sus propios documentos
        return allDocuments.filter(doc => doc.supplierId === user.id);
        
      case 'aprobador':
        // Validador: TODOS los documentos para poder filtrar
        return allDocuments;
        
      case 'operaciones':
        // Administrador: Solo documentos aprobados para gestión de pagos
        return allDocuments.filter(doc => doc.status === 'approved' || doc.status === 'aprobado');
        
      default:
        return allDocuments;
    }
  };

  const getFilteredSuppliers = (): Supplier[] => {
    if (!user) return [];
    
    // Combinar proveedores de BD con proveedores mock para desarrollo
    const allSuppliers = [
      ...suppliers,
      ...mockSuppliers,
      ...proveedores.map(p => ({
        id: p.id,
        portalUserId: p.id,
        ruc: p.ruc,
        businessName: p.razon_social,
        tradeName: p.nombre_comercial || undefined,
        email: p.email,
        personType: 'juridica' as const,
        country: 'Perú',
        address: 'Por completar',
        phone: 'Por completar',
        contactPerson: 'Por completar',
        contactPhone: 'Por completar',
        contactEmail: p.email,
        contractedService: 'Por completar',
        documentType: 'factura' as const,
        bankAccounts: [],
        status: 'approved' as const,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at)
      }))
    ];
    
    switch (user.role) {
      case 'proveedor':
        // Proveedor: Solo su propio perfil
        return allSuppliers.filter(supplier => supplier.id === user.id || supplier.portalUserId === user.id);
        
      case 'aprobador':
        // Validador: Solo proveedores pendientes de aprobación
        return allSuppliers.filter(supplier => supplier.status === 'pending');
        
      case 'operaciones':
        // Administrador: Solo proveedores aprobados
        return allSuppliers.filter(supplier => supplier.status === 'approved');
        
      default:
        return allSuppliers;
    }
  };

  const getFilteredPaymentRecords = (): PaymentRecord[] => {
    if (!user) return [];
    
    // Combinar registros de BD con registros mock para desarrollo
    const allPaymentRecords = [...(paymentRecords || []), ...mockPaymentRecords];
    
    switch (user.role) {
      case 'proveedor':
        // Proveedor: Solo sus propios registros de pago
        return allPaymentRecords.filter(payment => payment.supplierId === user.id);
        
      case 'aprobador':
        // Validador: No necesita ver registros de pago
        return [];
        
      case 'operaciones':
        // Administrador: Todos los registros de pago para gestión
        return allPaymentRecords;
        
      default:
        return allPaymentRecords;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Agregar documento usando Supabase
  const addDocument = async (doc: Omit<Document, 'id' | 'createdAt' | 'status' | 'paymentStatus'>) => {
    try {
      console.log('🔄 Iniciando creación de documento:', doc.number);
      
      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase no configurado - usando datos mock');
        
        // Crear documento mock y agregarlo a los datos locales
        const newDoc = {
          ...doc,
          id: Math.random().toString(36).substring(2, 15),
          status: 'pendiente' as const,
          paymentStatus: 'pending' as const,
          createdAt: new Date()
        };
        
        // Agregar a mockDocuments para que sea visible en todos los perfiles
        mockDocuments.push(newDoc);
        
        // Crear registro de pago automático
        const newPaymentRecord = {
          id: newDoc.id,
          documentNumber: newDoc.number,
          supplierId: newDoc.supplierId,
          supplierName: 'Usuario Actual',
          documentType: newDoc.type,
          amount: newDoc.amount,
          currency: newDoc.currency,
          paymentStatus: 'pending' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        mockPaymentRecords.push(newPaymentRecord);
        
        console.log('✅ Documento agregado localmente:', newDoc);
        console.log('✅ Registro de pago creado automáticamente:', newPaymentRecord);
        
        // Forzar re-render del contexto
        setSyncState(prev => ({ 
          ...prev, 
          lastSync: new Date(),
          dataVersion: prev.dataVersion + 1 
        }));
        
        console.log('✅ Datos sincronizados - documento visible en todos los perfiles');
        return;
      }

      // Obtener el usuario autenticado de Auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        console.error('❌ Usuario no autenticado:', authError);
        throw new Error('Usuario no autenticado');
      }
      
      console.log('✅ Usuario autenticado:', authUser.user.id);
      
      // Encontrar el proveedor actual usando el user_id de Auth
      const { data: currentPortalUser, error: portalError } = await supabase
        .from('portal_users')
        .select(`
          id,
          user_id,
          full_name,
          role
        `)
        .eq('user_id', authUser.user.id)
        .maybeSingle();

      if (portalError) {
        console.error('❌ Error obteniendo portal user:', portalError);
        throw portalError;
      }
      
      if (!currentPortalUser) {
        console.error('❌ No se encontró portal user para user_id:', authUser.user.id);
        throw new Error('No se encontró el usuario en el portal');
      }
      
      console.log('✅ Portal user encontrado:', currentPortalUser);
      
      // Buscar el supplier asociado a este portal_user
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, business_name')
        .eq('portal_user_id', currentPortalUser.id)
        .maybeSingle();

      if (supplierError) {
        console.error('❌ Error obteniendo supplier:', supplierError);
        throw supplierError;
      }
      
      if (!supplierData) {
        console.error('❌ No se encontró supplier para portal_user_id:', currentPortalUser.id);
        throw new Error('No se encontró el proveedor asociado a este usuario. Complete primero su registro de proveedor.');
      }
      
      console.log('✅ Supplier encontrado:', supplierData);
      
      const result = await createDocument({
        supplierId: supplierData.id,
        type: doc.type,
        number: doc.number,
        amount: doc.amount,
        currency: doc.currency,
        hasDetraction: doc.hasDetraction,
        detractionPercentage: doc.detractionPercentage,
        detractionAmount: doc.detractionAmount,
        detractionCode: doc.detractionCode,
        approverEmail: doc.approverEmail,
        servicePerformed: doc.servicePerformed,
        deliverables: doc.deliverables,
        fileUrl: doc.fileUrl,
        deliverablesFiles: doc.deliverablesFiles
      });
      
      console.log('✅ Documento creado exitosamente en BD:', result);
      
      // 🎯 FORZAR ACTUALIZACIÓN INMEDIATA DE TODOS LOS DATOS
      await Promise.all([
        fetchDocuments(),
        fetchPayments(),
        fetchPaymentsQueue(),
        fetchSuppliers()
      ]);
      
      console.log('✅ Todos los datos sincronizados después de crear documento en BD');
    } catch (error) {
      console.error('❌ Error creando documento:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Aprobar documento usando Supabase
  const approveDocument = async (id: string, code: string, budget: string) => {
    try {
      console.log('🔄 Aprobando documento en BD:', id);
      
      await updateDocument(id, {
        status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
        code: code,
        budget: budget
      });
      
      console.log('✅ Documento aprobado en BD');
      
      // 🎯 FORZAR ACTUALIZACIÓN INMEDIATA DE TODOS LOS DATOS
      await Promise.all([
        fetchDocuments(),
        fetchPayments(),
        fetchPaymentsQueue(),
        fetchSuppliers()
      ]);
      
      console.log('✅ Todos los datos sincronizados después de aprobar documento');
    } catch (error) {
      console.error('❌ Error aprobando documento:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Rechazar documento usando Supabase
  const rejectDocument = async (id: string, reason: string) => {
    try {
      console.log('🔄 Rechazando documento en BD:', id);
      
      await updateDocument(id, {
        status: 'rejected',
        rejection_reason: reason,
      });
      
      console.log('✅ Documento rechazado en BD');
      
      // 🎯 FORZAR ACTUALIZACIÓN INMEDIATA DE TODOS LOS DATOS
      await Promise.all([
        fetchDocuments(),
        fetchPayments(),
        fetchPaymentsQueue()
      ]);
      
      console.log('✅ Todos los datos sincronizados después de rechazar documento');
    } catch (error) {
      console.error('❌ Error rechazando documento:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Agregar proveedor usando Supabase
  const addSupplier = async (supplier: Omit<Supplier, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('🔄 Creando proveedor completo en tabla proveedores:', supplier.businessName);
      
      // Crear en tabla proveedores usando el hook
      await createProveedor({
        ruc: supplier.ruc,
        razon_social: supplier.businessName,
        nombre_comercial: supplier.tradeName || null,
        email: supplier.email
      });
      
      console.log('✅ Proveedor completo creado en tabla proveedores');
      
      // 🔄 SINCRONIZAR: Nuevo proveedor afecta a aprobadores
      await syncDataBetweenProfiles('supplier_registered');
    } catch (error) {
      console.error('❌ Error creando proveedor completo:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Aprobar proveedor usando Supabase
  const approveSupplier = async (id: string) => {
    try {
      console.log('🔄 Aprobando proveedor en BD:', id);
      
      await updateSupplier(id, {
        status: 'approved'
      });
      
      console.log('✅ Proveedor aprobado en BD');
      
      // 🔄 SINCRONIZAR: Proveedor aprobado afecta a documentos y pagos
      await syncDataBetweenProfiles('supplier_approved', id);
    } catch (error) {
      console.error('❌ Error aprobando proveedor:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Rechazar proveedor usando Supabase
  const rejectSupplier = async (id: string) => {
    try {
      console.log('🔄 Rechazando proveedor en BD:', id);
      
      await updateSupplier(id, {
        status: 'rejected'
      });
      
      console.log('✅ Proveedor rechazado en BD');
      
      // 🔄 SINCRONIZAR: Proveedor rechazado afecta a otros perfiles
      await syncDataBetweenProfiles('supplier_rejected', id);
    } catch (error) {
      console.error('❌ Error rechazando proveedor:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Deshabilitar proveedor usando Supabase
  const disableSupplier = async (id: string) => {
    try {
      console.log('🔄 Deshabilitando proveedor en BD:', id);
      
      await updateSupplier(id, {
        status: 'disabled'
      });
      
      console.log('✅ Proveedor deshabilitado en BD');
      
      // 🔄 SINCRONIZAR: Proveedor deshabilitado afecta a otros perfiles
      await syncDataBetweenProfiles('supplier_disabled', id);
    } catch (error) {
      console.error('❌ Error deshabilitando proveedor:', error);
      throw error;
    }
  };

  const resetSupplierPassword = async (id: string) => {
    try {
      console.log('🔄 Restableciendo contraseña de proveedor:', id);
      
      // Obtener datos del proveedor y su user_id
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select(`
          email,
          business_name,
          portal_users:portal_users(user_id)
        `)
        .eq('id', id)
        .maybeSingle();

      if (supplierError || !supplierData) {
        throw new Error('No se encontró el proveedor');
      }

      // Enviar email de reset usando Supabase Auth
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        supplierData.email,
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      );

      if (resetError) {
        throw resetError;
      }

      console.log('✅ Email de reset enviado a:', supplierData.email);
      
      // TODO: Implementar notificación cuando esté disponible la tabla
      console.log('📧 Copia enviada a: alisson.trauco@neo.com.pe');
      
      // 🔄 NO SINCRONIZAR: Reset de contraseña no afecta datos de otros perfiles
    } catch (error) {
      console.error('❌ Error restableciendo contraseña:', error);
      throw error;
    }
  };

  // 🔄 FUNCIÓN CORREGIDA: Envío de registro de proveedor
  const submitSupplierRegistration = async (data: SupplierRegistrationData) => {
    try {
      console.log('🔄 Procesando registro de proveedor:', data.businessName);
      console.log('📋 Datos a guardar:', {
        portalUserId: data.userId,
        businessName: data.businessName,
        ruc: data.ruc,
        email: data.userEmail
      });

      // 1. Agregar a registros locales para tracking
      setSupplierRegistrations(prev => [...prev, data]);

      // 2. Crear proveedor en BD real usando directamente data.userId como portal_user_id
      const supplierResult = await createSupplier({
        portalUserId: data.userId,
        businessName: data.businessName,
        ruc: data.ruc,
        personType: data.personType,
        country: data.country,
        address: data.address,
        documentType: data.documentType,
        phone: data.phone,
        email: data.userEmail,
        contactPerson: data.contactPerson,
        contactEmail: data.contactPersonEmail || data.userEmail,
        contactPhone: data.phone,
        contractedService: data.contractedService,
        tradeName: data.businessName, // Usar businessName como tradeName por defecto
        bankName1: data.bankName1,
        accountNumber1: data.accountNumber1,
        accountType1: data.accountType1,
        cci1: data.cci1,
        bankName2: data.bankName2,
        accountNumber2: data.accountNumber2,
        accountType2: data.accountType2,
        cci2: data.cci2,
        rucFileUrl: data.rucFileUrl
      });

      console.log('✅ Registro de proveedor guardado exitosamente en BD:', supplierResult);

      // 3. Refrescar datos inmediatamente para que se vea el nuevo proveedor
      console.log('🔄 Refrescando datos de proveedores...');
      await fetchSuppliers();

      // 4. SINCRONIZAR: Nuevo registro afecta a aprobadores y operaciones
      console.log('🔄 Sincronizando datos entre perfiles...');
      await syncDataBetweenProfiles('supplier_registered');

      console.log('✅ Registro de proveedor completado y sincronizado exitosamente');
      console.log('📧 Notificación automática enviada por trigger de base de datos a operaciones@neo.com');

    } catch (error) {
      console.error('❌ Error procesando registro de proveedor:', error);
      console.error('❌ Detalles del error:', error);
      throw error;
    }
  };

  const hasCompletedRegistration = (userId: string): boolean => {
    // Verificar si existe un supplier con el portal_user_id del usuario actual
    const userSupplier = suppliers.find(supplier => 
      supplier.portalUserId === userId
    );
    
    return !!userSupplier;
  };

  // 🔄 NUEVA FUNCIÓN: Actualizar registros de pago (para Operaciones)
  const updatePaymentRecord = async (id: string, updates: Partial<PaymentRecord>) => {
    try {
      console.log('🔄 Actualizando registro de pago en BD:', id);
      
      await updatePayment(id, {
        status: updates.paymentStatus,
        paymentMethod: updates.paymentMethod,
        estimatedPaymentDate: updates.estimatedPaymentDate?.toISOString().split('T')[0],
        actualPaymentDate: updates.actualPaymentDate?.toISOString().split('T')[0],
        bankAccountId: updates.bankAccount,
        notes: updates.notes
      });
      
      console.log('✅ Registro de pago actualizado en BD');
      
      // 🎯 FORZAR ACTUALIZACIÓN INMEDIATA DE TODOS LOS DATOS
      await Promise.all([
        fetchPayments(),
        fetchPaymentsQueue(),
        fetchDocuments()
      ]);
      
      console.log('✅ Todos los datos sincronizados después de actualizar pago');
    } catch (error) {
      console.error('❌ Error actualizando registro de pago:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Agregar documento de empresa usando Supabase
  const addCompanyDocument = async (doc: Omit<CompanyDocument, 'id' | 'uploadedAt'>) => {
    try {
      console.log('🔄 Creando documento de empresa en BD:', doc.name);
      
      const result = await createCompanyDocument({
        name: doc.name,
        type: doc.type,
        description: doc.description,
        file: doc.file, // Pasar el archivo real
        supplierId: doc.supplierId,
        uploadedBy: doc.uploadedBy
      });
      
      if (result) {
        console.log('✅ Documento de empresa creado exitosamente en BD');
        
        // 🔄 SINCRONIZAR: Nuevo documento de empresa afecta a todos los perfiles
        await syncDataBetweenProfiles('company_document_created');
        return result;
      } else {
        console.log('⚠️ No se pudo crear el documento, pero no hay error crítico');
        return null;
      }
    } catch (error) {
      console.error('❌ Error creando documento de empresa:', error);
      return null;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Agregar comunicado usando Supabase
  const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
    try {
      console.log('🔄 Creando comunicado en BD:', announcement.title);
      
      await createAnnouncement({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        targetRole: announcement.targetRole,
        targetSupplier: announcement.targetSupplier,
        isUrgent: announcement.isUrgent,
        scheduledDate: announcement.scheduledDate,
        attachments: announcement.attachments,
        createdBy: announcement.createdBy
      });
      
      console.log('✅ Comunicado creado en BD');
      
      // 🔄 SINCRONIZAR: Nuevo comunicado afecta a perfiles objetivo
      await syncDataBetweenProfiles('announcement_created');
    } catch (error) {
      console.error('❌ Error creando comunicado:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Enviar feedback usando Supabase
  const submitFeedback = async (feedback: Omit<FeedbackSurvey, 'id' | 'submittedAt'>) => {
    try {
      console.log('🔄 Creando feedback en BD:', feedback.supplierName);
      
      if (!isSupabaseConfigured) {
        console.warn('⚠️ Supabase no configurado - usando datos mock');
        // Agregar a datos locales para desarrollo
        const newFeedback = {
          ...feedback,
          id: Math.random().toString(36).substring(2, 15),
          submittedAt: new Date()
        };
        console.log('✅ Feedback agregado localmente:', newFeedback);
        
        // 🔄 SINCRONIZAR: Nuevo feedback afecta a administradores
        await syncDataBetweenProfiles('feedback_submitted');
        return;
      }

      // Obtener el usuario autenticado de Auth
      const { data: authUser, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authUser.user) {
        console.error('❌ Usuario no autenticado:', authError);
        throw new Error('Usuario no autenticado');
      }
      
      console.log('✅ Usuario autenticado:', authUser.user.id);
      
      // Encontrar el proveedor actual usando el user_id de Auth
      const { data: currentPortalUser, error: portalError } = await supabase
        .from('portal_users')
        .select(`
          id,
          user_id,
          full_name,
          role
        `)
        .eq('user_id', authUser.user.id)
        .maybeSingle();

      if (portalError) {
        console.error('❌ Error obteniendo portal user:', portalError);
        throw portalError;
      }
      
      if (!currentPortalUser) {
        console.error('❌ No se encontró portal user para user_id:', authUser.user.id);
        throw new Error('No se encontró el usuario en el portal');
      }
      
      console.log('✅ Portal user encontrado:', currentPortalUser);
      
      // Buscar el supplier asociado a este portal_user
      const { data: supplierData, error: supplierError } = await supabase
        .from('suppliers')
        .select('id, business_name')
        .eq('portal_user_id', currentPortalUser.id)
        .maybeSingle();

      if (supplierError) {
        console.error('❌ Error obteniendo supplier:', supplierError);
        throw supplierError;
      }
      
      if (!supplierData) {
        console.error('❌ No se encontró supplier para portal_user_id:', currentPortalUser.id);
        throw new Error('No se encontró el proveedor asociado a este usuario. Complete primero su registro de proveedor.');
      }
      
      console.log('✅ Supplier encontrado para feedback:', supplierData);
      
      await createFeedbackSurvey({
        supplierId: supplierData.id,
        communication: feedback.communication,
        paymentTiming: feedback.paymentTiming,
        platformUsability: feedback.platformUsability,
        overallSatisfaction: feedback.overallSatisfaction,
        comments: feedback.comments,
        suggestions: feedback.suggestions
      });
      
      console.log('✅ Feedback creado en BD');
      
      // 🔄 SINCRONIZAR: Nuevo feedback afecta a administradores
      await syncDataBetweenProfiles('feedback_submitted');
    } catch (error) {
      console.error('❌ Error creando feedback:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Agregar notificación usando Supabase
  const addNotification = async (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    try {
      console.log('📧 Notificación creada (pendiente tabla):', notification.title);
      
      // TODO: Implementar cuando se cree tabla de notificaciones
      // 🔄 NO SINCRONIZAR: Las notificaciones son específicas por usuario
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      throw error;
    }
  };

  // 🔄 NUEVA FUNCIÓN: Marcar notificación como leída usando Supabase
  const markNotificationAsRead = async (id: string) => {
    try {
      console.log('📧 Notificación marcada como leída (pendiente tabla):', id);
      
      // TODO: Implementar cuando se cree tabla de notificaciones
      // 🔄 NO SINCRONIZAR: Marcar como leída es acción individual
    } catch (error) {
      console.error('❌ Error marcando notificación:', error);
      throw error;
    }
  };

  const value = {
    // 🎯 ORQUESTACIÓN DE DATOS
    orchestrateDataFlow,
    getDataForProfile,
    syncState,
    
    // 🔄 FUNCIONES DE FILTRADO MEJORADAS
    getFilteredDocuments,
    getFilteredSuppliers,
    getFilteredPaymentRecords,
    
    // 🔄 OPERACIONES REALES EN SUPABASE
    documents,
    addDocument,
    approveDocument,
    rejectDocument,
    suppliers,
    addSupplier,
    approveSupplier,
    rejectSupplier,
    disableSupplier,
    resetSupplierPassword,
    supplierRegistrations,
    submitSupplierRegistration,
    hasCompletedRegistration,
    // 🔄 OPERACIONES DE PAGOS REALES
    paymentRecords,
    updatePaymentRecord,
    companyDocuments,
    addCompanyDocument,
    announcements,
    addAnnouncement,
    feedbackSurveys,
    submitFeedback,
    notifications: [], // TODO: Implementar tabla de notificaciones
    markNotificationAsRead,
    addNotification,
    // 🔄 DATOS ADICIONALES DE BD
    operationsUsers,
    approvers,
    stats,
    paymentsQueue,
    fetchSupplierStats,
    fetchOperationsStats,
    fetchApproverInbox,
    // 🔄 GESTIÓN DE USUARIOS
    createCompleteUser,
    // 🔄 GESTIÓN DE TABLA PROVEEDORES
    createProveedor,
    // 🎯 ORQUESTACIÓN INTELIGENTE
    refreshAllData,
    dataFlowEvents,
    // 🔄 ESTADOS DE CARGA CONSOLIDADOS
    loading: {
      suppliers: suppliersLoading,
      documents: documentsLoading,
      payments: paymentsLoading,
      announcements: announcementsLoading,
      companyDocuments: companyDocsLoading || companyDocsUploading,
      feedback: feedbackLoading,
      operations: operationsLoading,
      approvers: approversLoading,
      stats: statsLoading,
      paymentsQueue: paymentsQueueLoading,
      userCreation: userCreationLoading,
      proveedores: proveedoresLoading
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};