/*
  # Crear tabla de cuentas bancarias

  1. Nueva tabla
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key a suppliers)
      - `bank_name` (text)
      - `account_number` (text)
      - `account_type` (enum: corriente, ahorros)
      - `currency` (enum: PEN, USD)
      - `cci` (text, nullable)
      - `is_primary` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear enums
CREATE TYPE account_type AS ENUM ('corriente', 'ahorros');
CREATE TYPE currency_type AS ENUM ('PEN', 'USD');

-- Crear tabla bank_accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES suppliers(id) ON DELETE CASCADE NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_type account_type NOT NULL,
  currency currency_type NOT NULL,
  cci text,
  is_primary boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Suppliers can manage own bank accounts"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = bank_accounts.supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read all bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_bank_accounts_updated_at
  BEFORE UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_bank_accounts_supplier_id ON bank_accounts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(currency);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_primary ON bank_accounts(is_primary);

-- Constraint para asegurar que solo haya una cuenta primaria por proveedor y moneda
CREATE UNIQUE INDEX IF NOT EXISTS idx_bank_accounts_primary_unique 
ON bank_accounts(supplier_id, currency) 
WHERE is_primary = true;