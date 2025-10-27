/*
  # Crear tabla de cuentas bancarias

  1. Nueva Tabla
    - `bank_accounts` (cuentas bancarias)
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, referencia a suppliers)
      - `currency` (text, PEN o USD)
      - `bank_name` (text, nombre del banco)
      - `account_number` (text, número de cuenta)
      - `account_type` (text, tipo de cuenta)
      - `cci_code` (text, código CCI)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS on `bank_accounts` table
    - Add policies based on supplier ownership
*/

CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE,
  currency text NOT NULL CHECK (currency IN ('PEN', 'USD')),
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_type text CHECK (account_type IN ('corriente', 'ahorros')),
  cci_code text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: pueden ver sus propias cuentas bancarias
CREATE POLICY "Suppliers can view own bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = bank_accounts.supplier_id 
      AND suppliers.user_id = auth.uid()
    )
  );

-- Política para operaciones: pueden ver todas las cuentas bancarias
CREATE POLICY "Operations can view all bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );