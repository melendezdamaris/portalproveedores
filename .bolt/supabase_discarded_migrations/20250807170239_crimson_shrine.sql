/*
  # Crear tabla de documentos/comprobantes

  1. Nueva Tabla
    - `documents`
      - `id` (uuid, primary key)
      - `supplier_id` (uuid, foreign key)
      - Información del comprobante: tipo, número, monto, moneda, detracción, correo aprobador
      - `servicio_realizado` (text)
      - `archivos_entregables` (jsonb array)
      - `archivo_pdf_comprobante_url` (text)
      - `status` (enum: pending, approved, rejected)
      - Información de aprobación/rechazo
      - `created_at`, `updated_at` (timestamps)

  2. Seguridad
    - Habilitar RLS en tabla `documents`
    - Políticas por rol: proveedores ven solo los suyos, aprobadores ven pendientes, operaciones ven aprobados
*/

-- Crear enum para tipo de documento
CREATE TYPE comprobante_type AS ENUM ('factura', 'boleta', 'rhe', 'nota_credito', 'nota_debito');

-- Crear enum para estado del documento
CREATE TYPE document_status AS ENUM ('pending', 'approved', 'rejected');

-- Crear tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Información del comprobante
  tipo_documento comprobante_type NOT NULL,
  numero_documento text NOT NULL,
  monto decimal(12,2) NOT NULL,
  moneda currency_type NOT NULL,
  tiene_detraccion boolean DEFAULT false,
  porcentaje_detraccion decimal(5,2),
  monto_detraccion decimal(12,2),
  codigo_detraccion text,
  correo_aprobador text NOT NULL,
  
  -- Servicio realizado
  servicio_realizado text NOT NULL,
  
  -- Archivos
  archivos_entregables jsonb DEFAULT '[]'::jsonb, -- Array de objetos con {name, url, type, size}
  archivo_pdf_comprobante_url text NOT NULL,
  
  -- Estado y aprobación
  status document_status NOT NULL DEFAULT 'pending',
  motivo_rechazo text,
  aprobado_por text,
  fecha_aprobacion timestamptz,
  codigo_aprobacion text,
  presupuesto text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Política para proveedores (solo sus documentos)
CREATE POLICY "Proveedores pueden ver sus propios documentos"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    )
  );

-- Política para aprobadores (solo pendientes)
CREATE POLICY "Aprobadores pueden ver documentos pendientes"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'aprobador' AND status = 'pending'
  );

-- Política para aprobadores (aprobar/rechazar)
CREATE POLICY "Aprobadores pueden actualizar documentos pendientes"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    current_user_role() = 'aprobador' AND status = 'pending'
  );

-- Política para operaciones (solo aprobados)
CREATE POLICY "Operaciones pueden ver documentos aprobados"
  ON documents
  FOR ALL
  TO authenticated
  USING (
    current_user_role() = 'operaciones' AND status = 'approved'
  );

-- Trigger para actualizar updated_at
CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_documents_supplier_id ON documents(supplier_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_numero ON documents(numero_documento);