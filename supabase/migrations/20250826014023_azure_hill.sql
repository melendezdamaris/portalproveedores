/*
  # Crear tabla de documentos de la empresa

  1. Nueva tabla
    - `company_documents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `document_type` (enum: contrato, orden_compra, acuerdo_confidencialidad, manual_guia, otro)
      - `description` (text, nullable)
      - `file_url` (text)
      - `target_supplier_id` (uuid, foreign key a suppliers, nullable)
      - `is_public` (boolean)
      - `is_active` (boolean)
      - `uploaded_by` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear enum
CREATE TYPE company_document_type AS ENUM ('contrato', 'orden_compra', 'acuerdo_confidencialidad', 'manual_guia', 'otro');

-- Crear tabla company_documents
CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  document_type company_document_type NOT NULL,
  description text,
  file_url text NOT NULL,
  target_supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  is_active boolean DEFAULT true,
  uploaded_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "All authenticated users can read active public documents"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (is_active = true AND is_public = true);

CREATE POLICY "Suppliers can read documents targeted to them"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = company_documents.target_supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can manage all company documents"
  ON company_documents
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
CREATE TRIGGER update_company_documents_updated_at
  BEFORE UPDATE ON company_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_company_documents_target_supplier ON company_documents(target_supplier_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_active ON company_documents(is_active);
CREATE INDEX IF NOT EXISTS idx_company_documents_public ON company_documents(is_public);