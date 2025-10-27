/*
  # Crear tabla de archivos de entregables

  1. Nueva tabla
    - `deliverable_files`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key a invoices)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (bigint)
      - `deliverable_group` (integer)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear tabla deliverable_files
CREATE TABLE IF NOT EXISTS deliverable_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint NOT NULL,
  deliverable_group integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE deliverable_files ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage deliverable files for own invoices"
  ON deliverable_files
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE i.id = deliverable_files.invoice_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read all deliverable files"
  ON deliverable_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_deliverable_files_invoice_id ON deliverable_files(invoice_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_files_group ON deliverable_files(deliverable_group);