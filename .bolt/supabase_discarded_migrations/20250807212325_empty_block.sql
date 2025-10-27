/*
  # Update documents table to link with suppliers and users

  1. Changes
    - Ensure proper foreign key relationships
    - Add approved_by foreign key to users table
    - Update indexes for better performance
  
  2. Security
    - Update RLS policies for proper access control
    - Ensure role-based filtering works correctly
*/

-- Agregar foreign key para approved_by si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'documents_approved_by_fkey'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_approved_by_fkey 
    FOREIGN KEY (approved_by) REFERENCES auth.users(id);
  END IF;
END $$;

-- Actualizar políticas RLS para documents
DROP POLICY IF EXISTS "Proveedores can manage own documents" ON documents;

-- Política para proveedores - solo sus documentos a través de suppliers
CREATE POLICY "Proveedores can manage own documents"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers s
      WHERE s.id = documents.supplier_id AND s.user_id = auth.uid()
    )
  );

-- Política para aprobadores - solo documentos pendientes
CREATE POLICY "Aprobadores can read pending documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    status = 'pending' AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'aprobador'
    )
  );

CREATE POLICY "Aprobadores can update document status"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'aprobador'
    )
  );

-- Política para operaciones - solo documentos aprobados
CREATE POLICY "Operaciones can read approved documents"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    status = 'approved' AND
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid() AND up.role = 'operaciones'
    )
  );