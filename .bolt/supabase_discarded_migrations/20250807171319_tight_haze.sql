/*
  # Crear tabla de documentos de la empresa (Centro de Documentación)

  1. Nueva Tabla
    - `company_documents`
      - Documentos creados por perfil operaciones
      - Tipos: contratos, órdenes de compra, acuerdos de confidencialidad, manuales, otros
      - Visibles para proveedores según targeting
  
  2. Seguridad
    - Habilitar RLS en tabla `company_documents`
    - Política para que proveedores vean documentos públicos o dirigidos a ellos
    - Política para que operaciones gestione todos los documentos
*/

CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Información del documento
  nombre text NOT NULL,
  tipo_documento text NOT NULL CHECK (tipo_documento IN ('contract', 'purchase_order', 'nda', 'manual', 'other')),
  descripcion text,
  archivo_url text NOT NULL,
  
  -- Targeting
  supplier_id uuid REFERENCES suppliers(id), -- NULL = para todos los proveedores
  
  -- Auditoría
  subido_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: ven documentos públicos o dirigidos a ellos
CREATE POLICY "Proveedores pueden ver documentos relevantes"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (
    supplier_id IS NULL OR -- Documentos públicos
    (
      supplier_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM suppliers 
        WHERE suppliers.id = company_documents.supplier_id 
        AND suppliers.id = auth.uid()::text
      )
    )
  );

-- Política para operaciones: pueden gestionar todos los documentos
CREATE POLICY "Operaciones pueden gestionar documentos de empresa"
  ON company_documents
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_company_documents_supplier_id ON company_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_type ON company_documents(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_company_documents_created_at ON company_documents(created_at DESC);