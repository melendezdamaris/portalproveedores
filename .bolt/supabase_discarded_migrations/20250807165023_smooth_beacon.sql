/*
  # Crear tabla de documentos de la empresa

  1. Nueva Tabla
    - `company_documents` (documentos de la empresa)
      - `id` (uuid, primary key)
      - `name` (text, nombre del documento)
      - `document_type` (text, tipo de documento)
      - `description` (text, descripción)
      - `file_url` (text, URL del archivo)
      - `supplier_id` (uuid, proveedor específico - opcional)
      - `uploaded_by` (uuid, subido por)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS on `company_documents` table
    - Add policies for viewing and uploading
*/

CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  document_type text NOT NULL CHECK (document_type IN ('contract', 'purchase_order', 'nda', 'manual', 'other')),
  description text,
  file_url text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id),
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

-- Política para todos los usuarios autenticados: pueden ver documentos
CREATE POLICY "Authenticated users can view company documents"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para operaciones: pueden subir documentos
CREATE POLICY "Operations can upload company documents"
  ON company_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );