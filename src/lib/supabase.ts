import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a mock client if environment variables are missing
let supabase: any;
let isSupabaseConfigured = false;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Using mock client.');
  // Create a mock client that returns empty data
  supabase = {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          order: () => Promise.resolve({ data: [], error: null })
        }),
        order: () => Promise.resolve({ data: [], error: null }),
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => ({
        select: () => Promise.resolve({ data: [], error: null })
      }),
      update: () => ({
        eq: () => ({
          select: () => Promise.resolve({ data: [], error: null })
        })
      })
    })
  };
  isSupabaseConfigured = false;
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  isSupabaseConfigured = true;
}

export { supabase, isSupabaseConfigured };

// ✅ TIPOS ACTUALIZADOS PARA COINCIDIR CON ESQUEMA REAL
export interface Database {
  public: {
    Tables: {
      // ✅ TABLA REAL: portal_users
      portal_users: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          role: 'proveedor' | 'aprobador' | 'operaciones';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          role: 'proveedor' | 'aprobador' | 'operaciones';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          role?: 'proveedor' | 'aprobador' | 'operaciones';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: suppliers
      suppliers: {
        Row: {
          id: string;
          portal_user_id: string;
          ruc: string;
          business_name: string;
          trade_name: string | null;
          person_type: 'natural' | 'juridica';
          country: string;
          address: string;
          phone: string;
          email: string;
          contact_person: string | null;
          contact_phone: string | null;
          contact_email: string;
          contracted_service: string | null;
          document_type: 'factura' | 'rhe';
          ruc_file_url: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'disabled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          portal_user_id: string;
          ruc: string;
          business_name: string;
          trade_name?: string | null;
          person_type?: 'natural' | 'juridica';
          country?: string;
          address: string;
          phone: string;
          email: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email: string;
          contracted_service?: string | null;
          document_type: 'factura' | 'rhe';
          ruc_file_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'disabled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          portal_user_id?: string;
          ruc?: string;
          business_name?: string;
          trade_name?: string | null;
          person_type?: 'natural' | 'juridica';
          country?: string;
          address?: string;
          phone?: string;
          email?: string;
          contact_person?: string | null;
          contact_phone?: string | null;
          contact_email?: string;
          contracted_service?: string | null;
          document_type?: 'factura' | 'rhe';
          ruc_file_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'disabled';
          created_at?: string;
          updated_at?: string;
        };
      };
      
      // ✅ TABLA REAL: bank_accounts
      bank_accounts: {
        Row: {
          id: string;
          supplier_id: string;
          bank_name: string;
          account_number: string;
          account_type: 'corriente' | 'ahorros';
          currency: 'PEN' | 'USD';
          cci_code: string | null;
          is_primary: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          bank_name: string;
          account_number: string;
          account_type: 'corriente' | 'ahorros';
          currency: 'PEN' | 'USD';
          cci_code?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          bank_name?: string;
          account_number?: string;
          account_type?: 'corriente' | 'ahorros';
          currency?: 'PEN' | 'USD';
          cci_code?: string | null;
          is_primary?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: invoices
      invoices: {
        Row: {
          id: string;
          supplier_id: string;
          invoice_type: 'factura' | 'boleta' | 'recibo' | 'otro';
          invoice_number: string;
          amount: number;
          currency: 'PEN' | 'USD';
          has_detraction: boolean;
          detraction_percentage: number | null;
          detraction_amount: number | null;
          detraction_code: string | null;
          approver_email: string;
          service_performed: string | null;
          deliverables: string | null;
          file_url: string | null;
          status: 'pending' | 'approved' | 'rejected';
          rejection_reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          code: string | null;
          budget: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          invoice_type: 'factura' | 'boleta' | 'recibo' | 'otro';
          invoice_number: string;
          amount: number;
          currency: 'PEN' | 'USD';
          has_detraction?: boolean;
          detraction_percentage?: number | null;
          detraction_amount?: number | null;
          detraction_code?: string | null;
          approver_email: string;
          service_performed?: string | null;
          deliverables?: string | null;
          file_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          code?: string | null;
          budget?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          invoice_type?: 'factura' | 'boleta' | 'recibo' | 'otro';
          invoice_number?: string;
          amount?: number;
          currency?: 'PEN' | 'USD';
          has_detraction?: boolean;
          detraction_percentage?: number | null;
          detraction_amount?: number | null;
          detraction_code?: string | null;
          approver_email?: string;
          service_performed?: string | null;
          deliverables?: string | null;
          file_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          code?: string | null;
          budget?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: payments
      payments: {
        Row: {
          id: string;
          invoice_id: string;
          amount: number;
          currency: 'PEN' | 'USD';
          status: 'pending' | 'scheduled' | 'paid' | 'observed';
          payment_method: string | null;
          estimated_payment_date: string | null;
          actual_payment_date: string | null;
          bank_account_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          amount: number;
          currency: 'PEN' | 'USD';
          status?: 'pending' | 'scheduled' | 'paid' | 'observed';
          payment_method?: string | null;
          estimated_payment_date?: string | null;
          actual_payment_date?: string | null;
          bank_account_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          amount?: number;
          currency?: 'PEN' | 'USD';
          status?: 'pending' | 'scheduled' | 'paid' | 'observed';
          payment_method?: string | null;
          estimated_payment_date?: string | null;
          actual_payment_date?: string | null;
          bank_account_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: company_documents
      company_documents: {
        Row: {
          id: string;
          title: string;
          document_type: 'contrato' | 'orden_compra' | 'acuerdo_confidencialidad' | 'manual_guia' | 'otro';
          description: string | null;
          file_url: string;
          target_supplier_id: string | null;
          is_public: boolean;
          is_active: boolean;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          document_type: 'contrato' | 'orden_compra' | 'acuerdo_confidencialidad' | 'manual_guia' | 'otro';
          description?: string | null;
          file_url: string;
          target_supplier_id?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          document_type?: 'contrato' | 'orden_compra' | 'acuerdo_confidencialidad' | 'manual_guia' | 'otro';
          description?: string | null;
          file_url?: string;
          target_supplier_id?: string | null;
          is_public?: boolean;
          is_active?: boolean;
          uploaded_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: announcements
      announcements: {
        Row: {
          id: string;
          title: string;
          content: string;
          announcement_type: 'general' | 'operativo' | 'financiero' | 'otro';
          target_role: 'all' | 'proveedor' | 'aprobador';
          target_supplier_id: string | null;
          is_urgent: boolean;
          is_active: boolean;
          scheduled_date: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          announcement_type?: 'general' | 'operativo' | 'financiero' | 'otro';
          target_role?: 'all' | 'proveedor' | 'aprobador';
          target_supplier_id?: string | null;
          is_urgent?: boolean;
          is_active?: boolean;
          scheduled_date?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          announcement_type?: 'general' | 'operativo' | 'financiero' | 'otro';
          target_role?: 'all' | 'proveedor' | 'aprobador';
          target_supplier_id?: string | null;
          is_urgent?: boolean;
          is_active?: boolean;
          scheduled_date?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: feedback_surveys
      feedback_surveys: {
        Row: {
          id: string;
          supplier_id: string;
          communication_rating: number;
          payment_timing_rating: number;
          platform_usability_rating: number;
          overall_satisfaction_rating: number;
          comments: string | null;
          suggestions: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          communication_rating: number;
          payment_timing_rating: number;
          platform_usability_rating: number;
          overall_satisfaction_rating: number;
          comments?: string | null;
          suggestions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          supplier_id?: string;
          communication_rating?: number;
          payment_timing_rating?: number;
          platform_usability_rating?: number;
          overall_satisfaction_rating?: number;
          comments?: string | null;
          suggestions?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      // ✅ TABLA REAL: deliverable_files
      deliverable_files: {
        Row: {
          id: string;
          invoice_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          deliverable_group: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          file_size: number;
          deliverable_group?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          file_size?: number;
          deliverable_group?: number;
          created_at?: string;
        };
      };

      // ✅ NUEVA TABLA: proveedores
      proveedores: {
        Row: {
          id: string;
          ruc: string;
          razon_social: string;
          nombre_comercial: string | null;
          email: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ruc: string;
          razon_social: string;
          nombre_comercial?: string | null;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          ruc?: string;
          razon_social?: string;
          nombre_comercial?: string | null;
          email?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // ✅ TABLA REAL: announcement_attachments
      announcement_attachments: {
        Row: {
          id: string;
          announcement_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          announcement_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          announcement_id?: string;
          file_name?: string;
          file_url?: string;
          file_type?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      // ✅ VISTA REAL: vw_supplier_dashboard
      vw_supplier_dashboard: {
        Row: {
          supplier_id: string | null;
          business_name: string | null;
          total_invoices: number | null;
          approved_invoices: number | null;
          pending_invoices: number | null;
          rejected_invoices: number | null;
          paid_invoices: number | null;
          total_paid_amount: number | null;
          pending_payment_amount: number | null;
        };
      };
      
      // ✅ VISTA REAL: vw_approver_dashboard
      vw_approver_dashboard: {
        Row: {
          total_invoices: number | null;
          approved_invoices: number | null;
          pending_invoices: number | null;
          rejected_invoices: number | null;
          paid_invoices: number | null;
          total_paid_amount: number | null;
          pending_approval_amount: number | null;
        };
      };

      // ✅ VISTA REAL: vw_approver_inbox
      vw_approver_inbox: {
        Row: {
          id: string | null;
          invoice_number: string | null;
          invoice_type: 'factura' | 'boleta' | 'recibo' | 'otro' | null;
          amount: number | null;
          currency: 'PEN' | 'USD' | null;
          service_performed: string | null;
          approver_email: string | null;
          submitted_at: string | null;
          supplier_name: string | null;
          ruc: string | null;
          supplier_email: string | null;
          deliverable_files_count: number | null;
        };
      };

      // ✅ VISTA REAL: vw_payment_queue
      vw_payment_queue: {
        Row: {
          id: string | null;
          invoice_id: string | null;
          amount: number | null;
          currency: 'PEN' | 'USD' | null;
          status: 'pending' | 'scheduled' | 'paid' | 'observed' | null;
          payment_method: string | null;
          estimated_payment_date: string | null;
          actual_payment_date: string | null;
          bank_account_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
          invoice_number: string | null;
          invoice_type: 'factura' | 'boleta' | 'recibo' | 'otro' | null;
          invoice_amount: number | null;
          invoice_currency: 'PEN' | 'USD' | null;
          approved_at: string | null;
          business_name: string | null;
          ruc: string | null;
          supplier_email: string | null;
          bank_name: string | null;
          account_number: string | null;
          account_type: 'corriente' | 'ahorros' | null;
          cci_code: string | null;
        };
      };
    };
  };
}