/*
  # Crear tabla de comprobantes/facturas

  1. Nueva tabla
    - `invoices`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key a suppliers)
      - `invoice_type` (enum: factura, boleta, recibo, otro)
      - `invoice_number` (text)
      - `amount` (decimal)
      - `currency` (enum: PEN, USD)
      - `has_detraction` (boolean)
      - `detraction_percentage` (decimal, nullable)
      - `detraction_amount` (decimal, nullable)
      - `detraction_code` (text, nullable)
      - `approver_email` (text)
      - `service_performed` (text, nullable)
      - `deliverables` (text, nullable)
      - `file_url` (text, nullable)
      - `status` (enum: pending, approved, rejected)
      - `rejection_reason` (text, nullable)
      - `approved_by` (text, nullable)
      - `approved_at` (timestamp, nullable)
      - `code` (text, nullable)
      - `budget` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas por rol
*/

-- Crear enums
CREATE TYPE invoice_type AS ENUM ('factura', 'boleta', 'recibo', 'otro');
CREATE TYPE invoice_status AS ENUM ('pending', 'approved', 'rejected');

-- Crear tabla invoices
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  invoice_type invoice_type NOT NULL,
  invoice_number text NOT NULL,
  amount decimal(12,2) NOT NULL,
  currency currency_type NOT NULL,
  has_detraction boolean DEFAULT false,
  detraction_percentage decimal(5,2),
  detraction_amount decimal(12,2),
  detraction_code text,
  approver_email text NOT NULL,
  service_performed text,
  deliverables text,
  file_url text,
  status invoice_status NOT NULL DEFAULT 'pending',
  rejection_reason text,
  approved_by text,
  approved_at timestamptz,
  code text,
  budget text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Suppliers can manage own invoices"
  ON invoices
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = invoices.supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read all invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

CREATE POLICY "Approvers can update invoice status"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_invoices_supplier_id ON invoices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_approver_email ON invoices(approver_email);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Constraint para número de factura único por proveedor
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_number_supplier 
ON invoices(supplier_id, invoice_number);