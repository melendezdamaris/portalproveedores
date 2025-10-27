/*
  # Crear tabla de documentos de la empresa

  1. Nueva Tabla
    - `company_documents`
      - `id` (uuid, primary key)
      - `nombre` (text)
      - `tipo_documento` (enum: contratos, ordenes_compra, acuerdos_confidencialidad, manuales_guia, otros)
      - `descripcion` (text)
      - `archivo_url` (text)
      - `supplier_id` (uuid, opcional - para documentos específicos de un proveedor)
      - `subido_por` (text)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `company_documents`
    - Políticas: operaciones pueden crear/editar, proveedores solo ven
*/

-- Crear enum para tipo de documento de empresa
CREATE TYPE company_document_type AS ENUM (
  'contratos',
  'ordenes_compra', 
  'acuerdos_confidencialidad',
  'manuales_guia',
  'otros'
);

-- Crear tabla de documentos de empresa
CREATE TABLE IF NOT EXISTS company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  tipo_documento company_document_type NOT NULL,
  descripcion text,
  archivo_url text NOT NULL,
  supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL, -- Opcional, para documentos específicos
  subido_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE company_documents ENABLE ROW LEVEL SECURITY;

-- Política para proveedores (solo lectura)
CREATE POLICY "Proveedores pueden ver documentos de empresa"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'proveedor' AND
    (supplier_id IS NULL OR supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    ))
  );

-- Política para operaciones (crear/editar)
CREATE POLICY "Operaciones pueden gestionar documentos de empresa"
  ON company_documents
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'operaciones');

-- Política para aprobadores (solo lectura)
CREATE POLICY "Aprobadores pueden ver documentos de empresa"
  ON company_documents
  FOR SELECT
  TO authenticated
  USING (current_user_role() = 'aprobador');

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_company_documents_tipo ON company_documents(tipo_documento);
CREATE INDEX IF NOT EXISTS idx_company_documents_supplier_id ON company_documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_company_documents_created_at ON company_documents(created_at DESC);