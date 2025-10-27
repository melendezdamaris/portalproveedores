/*
  # Complete NEO Consulting Portal Database Schema

  This migration creates the complete database schema for the NEO Consulting supplier portal.

  ## 1. New Tables
  - `proveedores` - Main suppliers table with all company information
  - `proveedor_cuentas_bancarias` - Bank accounts for each supplier (multiple accounts per supplier)
  - `comprobantes` - Invoices/receipts submitted by suppliers
  - `pagos` - Payment records linked to invoices
  - `comunicados` - Announcements from operations team
  - `documentos_operaciones` - Company documents shared with suppliers
  - `encuestas_feedback` - Feedback surveys from suppliers
  - `usuarios_operaciones` - Operations team users
  - `directorio_aprobadores` - Directory of approvers

  ## 2. Views
  - `v_dashboard_proveedor` - Supplier dashboard statistics
  - `v_dashboard_operaciones` - Operations dashboard statistics
  - `v_bandeja_aprobador` - Approver inbox view
  - `v_cola_pagos_operaciones` - Operations payment queue

  ## 3. Security
  - Enable RLS on all tables
  - Add policies for authenticated users based on roles
  - Secure access patterns for each user type

  ## 4. Features
  - Automatic timestamps with triggers
  - UUID primary keys
  - Foreign key relationships
  - Proper indexing for performance
*/

-- Drop existing tables if they exist (in correct order to avoid FK constraints)
DROP TABLE IF EXISTS encuestas_feedback CASCADE;
DROP TABLE IF EXISTS documentos_operaciones CASCADE;
DROP TABLE IF EXISTS comunicados CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS proveedor_cuentas_bancarias CASCADE;
DROP TABLE IF EXISTS directorio_aprobadores CASCADE;
DROP TABLE IF EXISTS usuarios_operaciones CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;

-- Drop existing views if they exist
DROP VIEW IF EXISTS v_dashboard_proveedor CASCADE;
DROP VIEW IF EXISTS v_dashboard_operaciones CASCADE;
DROP VIEW IF EXISTS v_bandeja_aprobador CASCADE;
DROP VIEW IF EXISTS v_cola_pagos_operaciones CASCADE;

-- 1. TABLA: proveedores (Main suppliers table)
CREATE TABLE proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_login text UNIQUE,
  password_hash text,
  ruc text NOT NULL,
  razon_social text NOT NULL,
  nombre_comercial text,
  tipo_persona text CHECK (tipo_persona IN ('natural', 'juridica')) DEFAULT 'juridica',
  pais text DEFAULT 'Perú',
  direccion text NOT NULL,
  tipo_comprobante_emitir text CHECK (tipo_comprobante_emitir IN ('factura', 'boleta', 'recibo', 'otro')) DEFAULT 'factura',
  ficha_ruc_url text,
  contacto_nombre text,
  contacto_email text NOT NULL,
  contacto_telefono text,
  solicitante_neo_email text,
  servicio_contratado text,
  numero_empleados text,
  tiene_diversidad boolean DEFAULT false,
  porcentaje_diversidad text,
  facturacion_anual text,
  clientes_referencia text,
  certificaciones text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. TABLA: proveedor_cuentas_bancarias (Bank accounts for suppliers)
CREATE TABLE proveedor_cuentas_bancarias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  moneda text CHECK (moneda IN ('PEN', 'USD')) NOT NULL,
  banco text NOT NULL,
  numero_cuenta text NOT NULL,
  tipo_cuenta text NOT NULL,
  codigo_cci text,
  es_principal boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. TABLA: usuarios_operaciones (Operations team users)
CREATE TABLE usuarios_operaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text,
  nombre_completo text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 4. TABLA: directorio_aprobadores (Approvers directory)
CREATE TABLE directorio_aprobadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_aprobador text UNIQUE NOT NULL,
  nombre_aprobador text,
  area text,
  email_login text UNIQUE,
  password_hash text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- 5. TABLA: comprobantes (Invoices/receipts)
CREATE TABLE comprobantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  tipo_documento text CHECK (tipo_documento IN ('factura', 'boleta', 'recibo', 'otro')) NOT NULL,
  numero_documento text NOT NULL,
  monto numeric(12,2) NOT NULL,
  moneda text CHECK (moneda IN ('PEN', 'USD')) NOT NULL,
  tiene_detraccion boolean DEFAULT false,
  porcentaje_detraccion numeric(5,2),
  monto_detraccion numeric(12,2),
  codigo_detraccion text,
  correo_aprobador text NOT NULL,
  servicio_realizado text,
  entregables text,
  archivos_entregables jsonb,
  comprobante_pdf_url text,
  status text CHECK (status IN ('pendiente', 'aprobado', 'rechazado')) DEFAULT 'pendiente',
  codigo_comprobante text,
  presupuesto text,
  submitted_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  rejected_at timestamptz,
  aprobado_por text,
  rechazo_motivo text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. TABLA: pagos (Payments)
CREATE TABLE pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comprobante_id uuid NOT NULL REFERENCES comprobantes(id) ON DELETE CASCADE,
  monto numeric(12,2) NOT NULL,
  moneda text CHECK (moneda IN ('PEN', 'USD')) NOT NULL,
  estado_pago text CHECK (estado_pago IN ('pendiente', 'programado', 'pagado', 'observado')) DEFAULT 'pendiente',
  metodo_pago text CHECK (metodo_pago IN ('transferencia', 'yape_plin', 'cheque', 'otro')),
  fecha_estimada_pago date,
  fecha_pago date,
  cuenta_bancaria_id uuid REFERENCES proveedor_cuentas_bancarias(id),
  notas text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. TABLA: comunicados (Announcements)
CREATE TABLE comunicados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo text CHECK (tipo IN ('general', 'operativo', 'financiero', 'otro')) DEFAULT 'general',
  contenido text NOT NULL,
  published_at timestamptz DEFAULT now(),
  urgente boolean DEFAULT false,
  audiencia_todos boolean DEFAULT true,
  proveedor_especifico uuid REFERENCES proveedores(id),
  archivos_adjuntos jsonb,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 8. TABLA: documentos_operaciones (Company documents)
CREATE TABLE documentos_operaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo text CHECK (tipo IN ('contrato', 'orden_compra', 'acuerdo_confidencialidad', 'manual_guia', 'otro')) NOT NULL,
  descripcion text,
  archivo_url text NOT NULL,
  published_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true,
  audiencia_todos boolean DEFAULT true,
  proveedor_especifico uuid REFERENCES proveedores(id),
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 9. TABLA: encuestas_feedback (Feedback surveys)
CREATE TABLE encuestas_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id uuid NOT NULL REFERENCES proveedores(id) ON DELETE CASCADE,
  comunicacion integer CHECK (comunicacion >= 1 AND comunicacion <= 5) NOT NULL,
  puntualidad_pagos integer CHECK (puntualidad_pagos >= 1 AND puntualidad_pagos <= 5) NOT NULL,
  facilidad_portal integer CHECK (facilidad_portal >= 1 AND facilidad_portal <= 5) NOT NULL,
  satisfaccion_general integer CHECK (satisfaccion_general >= 1 AND satisfaccion_general <= 5) NOT NULL,
  comentarios text,
  sugerencias text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_proveedores_email ON proveedores(contacto_email);
CREATE INDEX idx_proveedores_ruc ON proveedores(ruc);
CREATE INDEX idx_comprobantes_proveedor ON comprobantes(proveedor_id);
CREATE INDEX idx_comprobantes_status ON comprobantes(status);
CREATE INDEX idx_comprobantes_aprobador ON comprobantes(correo_aprobador);
CREATE INDEX idx_pagos_comprobante ON pagos(comprobante_id);
CREATE INDEX idx_pagos_estado ON pagos(estado_pago);
CREATE INDEX idx_cuentas_proveedor ON proveedor_cuentas_bancarias(proveedor_id);

-- Enable Row Level Security on all tables
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedor_cuentas_bancarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_operaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE directorio_aprobadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_operaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE encuestas_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for proveedores
CREATE POLICY "Proveedores can read own data"
  ON proveedores
  FOR SELECT
  TO authenticated
  USING (contacto_email = auth.jwt() ->> 'email');

CREATE POLICY "Operations can read all suppliers"
  ON proveedores
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operations can insert suppliers"
  ON proveedores
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Operations can update suppliers"
  ON proveedores
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for proveedor_cuentas_bancarias
CREATE POLICY "Suppliers can read own bank accounts"
  ON proveedor_cuentas_bancarias
  FOR SELECT
  TO authenticated
  USING (
    proveedor_id IN (
      SELECT id FROM proveedores WHERE contacto_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Operations can read all bank accounts"
  ON proveedor_cuentas_bancarias
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operations can manage bank accounts"
  ON proveedor_cuentas_bancarias
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for comprobantes
CREATE POLICY "Suppliers can read own invoices"
  ON comprobantes
  FOR SELECT
  TO authenticated
  USING (
    proveedor_id IN (
      SELECT id FROM proveedores WHERE contacto_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Suppliers can insert own invoices"
  ON comprobantes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    proveedor_id IN (
      SELECT id FROM proveedores WHERE contacto_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Approvers can read assigned invoices"
  ON comprobantes
  FOR SELECT
  TO authenticated
  USING (correo_aprobador = auth.jwt() ->> 'email');

CREATE POLICY "Approvers can update assigned invoices"
  ON comprobantes
  FOR UPDATE
  TO authenticated
  USING (correo_aprobador = auth.jwt() ->> 'email');

CREATE POLICY "Operations can read all invoices"
  ON comprobantes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Operations can update all invoices"
  ON comprobantes
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for pagos
CREATE POLICY "Suppliers can read own payments"
  ON pagos
  FOR SELECT
  TO authenticated
  USING (
    comprobante_id IN (
      SELECT c.id FROM comprobantes c
      JOIN proveedores p ON c.proveedor_id = p.id
      WHERE p.contacto_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Operations can manage all payments"
  ON pagos
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for comunicados
CREATE POLICY "All users can read active announcements"
  ON comunicados
  FOR SELECT
  TO authenticated
  USING (published_at <= now());

CREATE POLICY "Operations can manage announcements"
  ON comunicados
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for documentos_operaciones
CREATE POLICY "All users can read active documents"
  ON documentos_operaciones
  FOR SELECT
  TO authenticated
  USING (is_active = true AND published_at <= now());

CREATE POLICY "Operations can manage documents"
  ON documentos_operaciones
  FOR ALL
  TO authenticated
  USING (true);

-- RLS Policies for encuestas_feedback
CREATE POLICY "Suppliers can insert own feedback"
  ON encuestas_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (
    proveedor_id IN (
      SELECT id FROM proveedores WHERE contacto_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Operations can read all feedback"
  ON encuestas_feedback
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for usuarios_operaciones
CREATE POLICY "Operations users can read own data"
  ON usuarios_operaciones
  FOR SELECT
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- RLS Policies for directorio_aprobadores
CREATE POLICY "Approvers can read own data"
  ON directorio_aprobadores
  FOR SELECT
  TO authenticated
  USING (email_aprobador = auth.jwt() ->> 'email' OR email_login = auth.jwt() ->> 'email');

CREATE POLICY "Operations can read all approvers"
  ON directorio_aprobadores
  FOR SELECT
  TO authenticated
  USING (true);

-- Create views for dashboard statistics

-- Vista: Dashboard del proveedor
CREATE VIEW v_dashboard_proveedor AS
SELECT 
  p.id as proveedor_id,
  p.razon_social,
  COUNT(c.id) as comprobantes_registrados,
  COUNT(CASE WHEN c.status = 'aprobado' THEN 1 END) as comprobantes_aprobados,
  COUNT(CASE WHEN c.status = 'pendiente' THEN 1 END) as comprobantes_pendientes,
  COUNT(CASE WHEN c.status = 'rechazado' THEN 1 END) as comprobantes_rechazados,
  COUNT(CASE WHEN pg.estado_pago = 'pagado' THEN 1 END) as pagos_recibidos,
  COALESCE(SUM(CASE WHEN pg.estado_pago = 'pagado' THEN pg.monto ELSE 0 END), 0) as monto_total_pagado
FROM proveedores p
LEFT JOIN comprobantes c ON p.id = c.proveedor_id
LEFT JOIN pagos pg ON c.id = pg.comprobante_id
WHERE p.is_active = true
GROUP BY p.id, p.razon_social;

-- Vista: Dashboard de operaciones
CREATE VIEW v_dashboard_operaciones AS
SELECT 
  COUNT(c.id) as total_comprobantes,
  COUNT(CASE WHEN c.status = 'aprobado' THEN 1 END) as total_aprobados,
  COUNT(CASE WHEN c.status = 'pendiente' THEN 1 END) as total_pendientes,
  COUNT(CASE WHEN c.status = 'rechazado' THEN 1 END) as total_rechazados,
  COUNT(CASE WHEN pg.estado_pago = 'pagado' THEN 1 END) as pagos_realizados,
  COALESCE(SUM(CASE WHEN pg.estado_pago = 'pagado' THEN pg.monto ELSE 0 END), 0) as monto_pagado
FROM comprobantes c
LEFT JOIN pagos pg ON c.id = pg.comprobante_id;

-- Vista: Bandeja del aprobador
CREATE VIEW v_bandeja_aprobador AS
SELECT 
  c.id as comprobante_id,
  p.razon_social as proveedor,
  c.numero_documento,
  c.monto,
  c.moneda,
  c.tipo_documento,
  c.servicio_realizado,
  c.submitted_at,
  c.correo_aprobador,
  c.status
FROM comprobantes c
JOIN proveedores p ON c.proveedor_id = p.id
WHERE c.status = 'pendiente';

-- Vista: Cola de pagos para operaciones
CREATE VIEW v_cola_pagos_operaciones AS
SELECT 
  c.id as comprobante_id,
  p.razon_social as proveedor,
  c.numero_documento,
  c.monto,
  c.moneda,
  c.approved_at,
  c.tiene_detraccion,
  COALESCE(SUM(pg.monto), 0) as total_pagado_o_programado
FROM comprobantes c
JOIN proveedores p ON c.proveedor_id = p.id
LEFT JOIN pagos pg ON c.id = pg.comprobante_id AND pg.estado_pago IN ('pagado', 'programado')
WHERE c.status = 'aprobado'
GROUP BY c.id, p.razon_social, c.numero_documento, c.monto, c.moneda, c.approved_at, c.tiene_detraccion;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_proveedores_updated_at BEFORE UPDATE ON proveedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cuentas_updated_at BEFORE UPDATE ON proveedor_cuentas_bancarias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comprobantes_updated_at BEFORE UPDATE ON comprobantes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pagos_updated_at BEFORE UPDATE ON pagos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data

-- Sample supplier
INSERT INTO proveedores (
  id,
  email_login,
  ruc,
  razon_social,
  nombre_comercial,
  tipo_persona,
  pais,
  direccion,
  tipo_comprobante_emitir,
  contacto_nombre,
  contacto_email,
  contacto_telefono,
  solicitante_neo_email,
  servicio_contratado,
  is_active
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'proveedor@example.com',
  '20123456789',
  'Empresa ABC Sociedad Anónima Cerrada',
  'ABC Consulting',
  'juridica',
  'Perú',
  'Av. Javier Prado Este 123, San Isidro, Lima',
  'factura',
  'Juan Pérez García',
  'proveedor@example.com',
  '987654321',
  'contacto@neoconsulting.com',
  'Consultoría en sistemas de información y desarrollo de software',
  true
);

-- Sample bank accounts for the supplier
INSERT INTO proveedor_cuentas_bancarias (
  proveedor_id,
  moneda,
  banco,
  numero_cuenta,
  tipo_cuenta,
  codigo_cci,
  es_principal
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'PEN',
  'Banco de Crédito del Perú',
  '194-123456789-0-12',
  'corriente',
  '00219400123456789012',
  true
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'USD',
  'Banco Interbank',
  '898-123456789-0-15',
  'corriente',
  '00389800123456789015',
  false
);

-- Sample operations user
INSERT INTO usuarios_operaciones (
  email,
  nombre_completo,
  is_active
) VALUES (
  'operaciones@neoconsulting.com',
  'María González',
  true
);

-- Sample approver
INSERT INTO directorio_aprobadores (
  email_aprobador,
  nombre_aprobador,
  area,
  email_login,
  is_active
) VALUES (
  'aprobador@neoconsulting.com',
  'Carlos Rodríguez',
  'Finanzas',
  'aprobador@neoconsulting.com',
  true
);

-- Sample invoice
INSERT INTO comprobantes (
  id,
  proveedor_id,
  tipo_documento,
  numero_documento,
  monto,
  moneda,
  tiene_detraccion,
  porcentaje_detraccion,
  monto_detraccion,
  codigo_detraccion,
  correo_aprobador,
  servicio_realizado,
  entregables,
  archivos_entregables,
  status,
  codigo_comprobante,
  presupuesto,
  approved_at,
  aprobado_por
) VALUES (
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440001',
  'factura',
  'F001-00123',
  2500.00,
  'PEN',
  true,
  10.00,
  250.00,
  '037',
  'aprobador@neoconsulting.com',
  'Desarrollo e implementación de sistema de gestión empresarial con módulos de facturación, inventario y reportes. Incluye capacitación al personal y soporte técnico durante 3 meses.',
  'Consultoría en sistemas',
  '[{"id": "1", "name": "Informe_Consultoria_Sistemas.pdf", "url": "#", "type": "application/pdf", "size": 2048576}, {"id": "2", "name": "Analisis_Requerimientos.xlsx", "url": "#", "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size": 1024000}]'::jsonb,
  'aprobado',
  'COD-2024-001',
  'PROY-SISTEMAS-2024',
  now() - interval '2 days',
  'Carlos Rodríguez'
);

-- Sample payment (will be created automatically by trigger or manually)
INSERT INTO pagos (
  comprobante_id,
  monto,
  moneda,
  estado_pago,
  metodo_pago,
  fecha_estimada_pago,
  cuenta_bancaria_id
) SELECT 
  c.id,
  c.monto,
  c.moneda,
  'programado',
  'transferencia',
  current_date + interval '15 days',
  cb.id
FROM comprobantes c
JOIN proveedor_cuentas_bancarias cb ON c.proveedor_id = cb.proveedor_id AND cb.es_principal = true
WHERE c.numero_documento = 'F001-00123';

-- Sample announcement
INSERT INTO comunicados (
  titulo,
  tipo,
  contenido,
  urgente,
  audiencia_todos,
  created_by
) VALUES (
  'Actualización del Portal de Proveedores',
  'general',
  'Hemos actualizado nuestro portal con nuevas funcionalidades para mejorar su experiencia. Ahora pueden ver el estado de sus pagos en tiempo real y recibir notificaciones automáticas sobre el estado de sus comprobantes.',
  false,
  true,
  'Sistema NEO'
);

-- Sample company document
INSERT INTO documentos_operaciones (
  titulo,
  tipo,
  descripcion,
  archivo_url,
  audiencia_todos,
  created_by
) VALUES (
  'Manual del Proveedor NEO Consulting',
  'manual_guia',
  'Guía completa para proveedores sobre procesos y procedimientos',
  '#',
  true,
  'Sistema NEO'
);