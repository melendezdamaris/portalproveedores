/*
  # Crear tabla de pagos

  1. Nueva tabla
    - `payments`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key a invoices)
      - `amount` (decimal)
      - `currency` (enum: PEN, USD)
      - `status` (enum: pending, scheduled, paid, observed)
      - `payment_method` (text, nullable)
      - `estimated_payment_date` (date, nullable)
      - `actual_payment_date` (date, nullable)
      - `bank_account_id` (uuid, foreign key a bank_accounts, nullable)
      - `notes` (text, nullable)
      - `created_by` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear enum
CREATE TYPE payment_status AS ENUM ('pending', 'scheduled', 'paid', 'observed');

-- Crear tabla payments
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE UNIQUE NOT NULL,
  amount decimal(12,2) NOT NULL,
  currency currency_type NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  payment_method text,
  estimated_payment_date date,
  actual_payment_date date,
  bank_account_id uuid REFERENCES bank_accounts(id),
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Suppliers can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE i.id = payments.invoice_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_estimated_date ON payments(estimated_payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_bank_account_id ON payments(bank_account_id);