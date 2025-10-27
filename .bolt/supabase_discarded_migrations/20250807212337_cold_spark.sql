/*
  # Update bank_accounts table with proper relationships

  1. Changes
    - Ensure proper foreign key relationships
    - Update RLS policies for correct access control
  
  2. Security
    - Proveedores can manage own bank accounts through suppliers
    - Operaciones can read all bank accounts
*/

-- Actualizar políticas RLS para bank_accounts
DROP POLICY IF EXISTS "Proveedores can manage own bank accounts" ON bank_accounts;
DROP POLICY IF EXISTS "Operaciones can read all bank accounts" ON bank_accounts;

-- Nueva política para proveedores - solo sus cuentas bancarias a través de suppliers
CREATE POLICY "Proveedores can manage own bank accounts"
  ON bank_accounts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      WHERE s.id = bank_accounts.supplier_id AND s.user_id = auth.uid()
    )
  );

-- Nueva política para operaciones - todas las cuentas bancarias
CREATE POLICY "Operaciones can read all bank accounts"
  ON bank_accounts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'operaciones'
    )
  );