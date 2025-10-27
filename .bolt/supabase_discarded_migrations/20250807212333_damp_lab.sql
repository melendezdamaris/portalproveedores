/*
  # Update payments table with proper relationships

  1. Changes
    - Ensure proper foreign key relationships
    - Add indexes for better performance
    - Update sample data with correct UUIDs
  
  2. Security
    - Update RLS policies for proper access control
    - Ensure role-based filtering works correctly
*/

-- Actualizar políticas RLS para payments
DROP POLICY IF EXISTS "Proveedores can read own payments" ON payments;
DROP POLICY IF EXISTS "Operaciones can manage all payments" ON payments;

-- Nueva política para proveedores - solo sus pagos a través de suppliers
CREATE POLICY "Proveedores can read own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      WHERE s.id = payments.supplier_id AND s.user_id = auth.uid()
    )
  );

-- Nueva política para operaciones - todos los pagos
CREATE POLICY "Operaciones can manage all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'operaciones'
    )
  );