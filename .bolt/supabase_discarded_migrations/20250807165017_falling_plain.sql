/*
  # Crear tabla de pagos

  1. Nueva Tabla
    - `payments` (pagos)
      - `id` (uuid, primary key)
      - `document_id` (uuid, referencia a documents)
      - `supplier_id` (uuid, referencia a suppliers)
      - `document_number` (text, número de documento extraído)
      - `amount` (decimal, monto)
      - `currency` (text, moneda)
      - `payment_status` (text, estado del pago)
      - `payment_method` (text, método de pago)
      - `estimated_payment_date` (date, fecha estimada de pago)
      - `actual_payment_date` (date, fecha real de pago)
      - `bank_account` (text, cuenta bancaria utilizada)
      - `notes` (text, notas adicionales)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Enable RLS on `payments` table
    - Add policies for different user roles
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  document_number text NOT NULL,
  amount decimal(12,2),
  currency text CHECK (currency IN ('PEN', 'USD')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'scheduled', 'paid')),
  payment_method text,
  estimated_payment_date date,
  actual_payment_date date,
  bank_account text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: pueden ver sus propios pagos
CREATE POLICY "Suppliers can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = payments.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Política para operaciones: pueden ver y gestionar todos los pagos
CREATE POLICY "Operations can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );