/*
  # Crear tabla de cuentas bancarias

  1. Nueva Tabla
    - `bank_accounts`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key)
      - Información bancaria: banco, número cuenta, tipo cuenta, moneda, código CCI
      - `currency` (enum: PEN, USD)
      - `account_type` (enum: corriente, ahorros)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `bank_accounts`
    - Políticas para que proveedores vean solo sus cuentas
*/

-- Crear enum para tipo de moneda
CREATE TYPE currency_type AS ENUM ('PEN', 'USD');

-- Crear enum para tipo de cuenta
CREATE TYPE account_type AS ENUM ('corriente', 'ahorros');

-- Crear tabla de cuentas bancarias
CREATE TABLE IF NOT EXISTS bank_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Información bancaria
  banco text NOT NULL,
  numero_cuenta_bancaria text NOT NULL,
  tipo_cuenta account_type NOT NULL,
  tipo_moneda currency_type NOT NULL,
  codigo_cci text,
  
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Política para que proveedores vean solo sus cuentas
CREATE POLICY "Proveedores pueden ver sus propias cuentas bancarias"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    )
  );

-- Política para operaciones (ver todas)
CREATE POLICY "Operaciones pueden ver todas las cuentas bancarias"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'operaciones');

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_bank_accounts_supplier_id ON bank_accounts(supplier_id);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_currency ON bank_accounts(tipo_moneda);