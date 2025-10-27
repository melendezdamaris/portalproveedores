/*
  # Crear tabla de pagos

  1. Nueva Tabla
    - `payments`
      - `id` (uuid, primary key)
      - `document_id` (uuid, foreign key)
      - `supplier_id` (uuid, foreign key)
      - Información de pago: monto, moneda, estado, método, fechas, cuenta bancaria, notas
      - `payment_status` (enum: pending, scheduled, paid)
      - Se crea automáticamente cuando se registra un comprobante
      - Se actualiza cuando operaciones gestiona el pago

  2. Seguridad
    - Habilitar RLS en tabla `payments`
    - Políticas por rol: proveedores ven solo los suyos, operaciones ven todos
*/

-- Crear enum para estado de pago
CREATE TYPE payment_status AS ENUM ('pending', 'scheduled', 'paid');

-- Crear tabla de pagos
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  
  -- Información extraída automáticamente del documento
  numero_documento text NOT NULL,
  monto decimal(12,2),
  moneda currency_type,
  
  -- Información de pago (completada por operaciones)
  estado_pago payment_status NOT NULL DEFAULT 'pending',
  metodo_pago text,
  fecha_estimada_pago date,
  fecha_real_pago date,
  cuenta_bancaria text,
  notas text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política para proveedores (solo sus pagos)
CREATE POLICY "Proveedores pueden ver sus propios pagos"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    supplier_id IN (
      SELECT id FROM suppliers WHERE user_id = current_user_id()
    )
  );

-- Política para operaciones (todos los pagos)
CREATE POLICY "Operaciones pueden gestionar todos los pagos"
  ON payments
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'operaciones');

-- Trigger para actualizar updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para crear pago automáticamente cuando se registra un documento
CREATE OR REPLACE FUNCTION create_payment_record()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payments (
    document_id,
    supplier_id,
    numero_documento,
    monto,
    moneda,
    estado_pago
  ) VALUES (
    NEW.id,
    NEW.supplier_id,
    NEW.numero_documento,
    NEW.monto,
    NEW.moneda,
    'pending'
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear pago automáticamente
CREATE TRIGGER create_payment_on_document_insert
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_record();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_payments_document_id ON payments(document_id);
CREATE INDEX IF NOT EXISTS idx_payments_supplier_id ON payments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(estado_pago);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);