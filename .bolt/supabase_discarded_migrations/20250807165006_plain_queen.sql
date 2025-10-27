/*
  # Crear tabla de comprobantes/documentos

  1. Nueva Tabla
    - `documents` (comprobantes)
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, referencia a suppliers)
      - `document_type` (text, tipo de documento)
      - `document_number` (text, número de documento)
      - `amount` (decimal, monto)
      - `currency` (text, moneda)
      - `has_detraction` (boolean, tiene detracción)
      - `detraction_percentage` (decimal, porcentaje de detracción)
      - `detraction_amount` (decimal, monto de detracción)
      - `detraction_code` (text, código de detracción)
      - `approver_email` (text, correo del aprobador)
      - `service_performed` (text, servicio realizado)
      - `document_file_url` (text, archivo PDF del comprobante)
      - `deliverables_files` (jsonb, archivos de entregables)
      - `status` (text, estado del documento)
      - `rejection_reason` (text, motivo de rechazo)
      - `approved_by` (text, aprobado por)
      - `approved_at` (timestamp, fecha de aprobación)
      - `code` (text, código interno)
      - `budget` (text, presupuesto/proyecto)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Enable RLS on `documents` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('factura', 'boleta', 'rhe', 'nota_credito', 'nota_debito')),
  document_number text NOT NULL,
  amount decimal(12,2) NOT NULL,
  currency text NOT NULL CHECK (currency IN ('PEN', 'USD')),
  has_detraction boolean DEFAULT false,
  detraction_percentage decimal(5,2),
  detraction_amount decimal(12,2),
  detraction_code text,
  approver_email text NOT NULL,
  service_performed text NOT NULL,
  document_file_url text NOT NULL,
  deliverables_files jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  approved_by text,
  approved_at timestamptz,
  code text,
  budget text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: pueden ver y crear sus propios documentos
CREATE POLICY "Suppliers can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = documents.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Política para aprobadores: pueden ver documentos pendientes
CREATE POLICY "Approvers can view pending documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'aprobador'
    )
  );

-- Política para aprobadores: pueden actualizar documentos pendientes
CREATE POLICY "Approvers can update pending documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'aprobador'
    )
  );

-- Política para operaciones: pueden ver documentos aprobados
CREATE POLICY "Operations can view approved documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );