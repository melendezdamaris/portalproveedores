/*
  # Crear tabla de pagos (Estado de Pagos)

  1. Nueva Tabla
    - `payments`
      - Refleja comprobantes aprobados, rechazados, pendientes
      - Información de pago: fechas, método, cuenta bancaria
      - Estados: pending, scheduled, paid
      - Se crea automáticamente al registrar comprobante
  
  2. Seguridad
    - Habilitar RLS en tabla `payments`
    - Política para que proveedores vean solo sus pagos
    - Política para que operaciones gestione todos los pagos
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Información del documento (copiada automáticamente)
  numero_documento text NOT NULL,
  tipo_documento text,
  monto decimal(12,2),
  moneda text CHECK (moneda IN ('PEN', 'USD')),
  
  -- Información de pago
  estado_pago text NOT NULL DEFAULT 'pending' CHECK (estado_pago IN ('pending', 'scheduled', 'paid')),
  metodo_pago text,
  fecha_estimada_pago date,
  fecha_real_pago date,
  cuenta_bancaria_utilizada text,
  notas text,
  
  -- Auditoría
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: solo ven sus propios pagos
CREATE POLICY "Proveedores pueden ver sus propios pagos"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM suppliers 
      WHERE suppliers.id = payments.supplier_id 
      AND suppliers.id = auth.uid()::text
    )
  );

-- Política para operaciones: pueden gestionar todos los pagos
CREATE POLICY "Operaciones pueden gestionar todos los pagos"
  ON payments
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
CREATE INDEX IF NOT EXISTS idx_payments_supplier_id ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(estado_pago);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);

-- Trigger para actualizar updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();