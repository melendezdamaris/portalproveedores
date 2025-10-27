/*
  # Insert demo data with correct UUIDs

  1. Demo Data
    - Insert demo suppliers with correct user_id relationships
    - Insert demo documents with proper supplier relationships
    - Insert demo payments linked to documents
  
  2. Data Integrity
    - All UUIDs are properly formatted
    - Foreign key relationships are maintained
    - Realistic demo data for testing
*/

-- Insertar proveedores demo con UUIDs correctos
INSERT INTO suppliers (
  id,
  user_id,
  ruc,
  razon_social,
  tipo_persona,
  pais,
  direccion,
  tipo_comprobante,
  persona_contacto,
  email_persona_contacto,
  telefono,
  correo_neo_solicito,
  nombre_comercial,
  servicio_contratado,
  numero_trabajadores,
  diversidad_genero,
  porcentaje_diversidad,
  facturacion_anual,
  clientes_referencia,
  certificaciones,
  status,
  created_at,
  updated_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440001',
    '20123456789',
    'Empresa ABC Sociedad Anónima Cerrada',
    'juridica',
    'Perú',
    'Av. Javier Prado Este 123, San Isidro, Lima',
    'factura',
    'Juan Pérez García',
    'juan.perez@abcconsulting.com',
    '01-234-5678',
    'contacto@neoconsulting.com',
    'ABC Consulting',
    'Consultoría en sistemas de información y desarrollo de software',
    '21-50',
    true,
    35.00,
    2500000.00,
    'Banco Continental, Telefónica del Perú, Rimac Seguros',
    'ISO 9001:2015, ISO 27001:2013',
    'approved',
    '2024-11-15 10:00:00+00',
    '2024-11-20 15:30:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440001',
    '20987654321',
    'Consultores XYZ EIRL',
    'juridica',
    'Perú',
    'Av. El Sol 456, Miraflores, Lima',
    'factura',
    'María González',
    'maria.gonzalez@xyzconsulting.com',
    '01-987-6543',
    'operaciones@neoconsulting.com',
    'XYZ Consulting',
    'Servicios de auditoría y consultoría financiera',
    '0-20',
    false,
    20.00,
    800000.00,
    'Grupo Gloria, Backus, Alicorp',
    'CPA, Certificación en NIIF',
    'pending',
    '2024-12-01 09:00:00+00',
    '2024-12-01 09:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insertar cuentas bancarias demo
INSERT INTO bank_accounts (
  id,
  supplier_id,
  banco,
  numero_cuenta_bancaria,
  tipo_cuenta,
  tipo_moneda,
  codigo_cci,
  is_primary,
  created_at,
  updated_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440021',
    '550e8400-e29b-41d4-a716-446655440011',
    'Banco de Crédito del Perú',
    '194-123456789-0-12',
    'corriente',
    'PEN',
    '00219400123456789012',
    true,
    '2024-11-15 10:00:00+00',
    '2024-11-15 10:00:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440022',
    '550e8400-e29b-41d4-a716-446655440011',
    'Banco Interbank',
    '898-123456789-0-15',
    'corriente',
    'USD',
    '00389800123456789015',
    false,
    '2024-11-15 10:00:00+00',
    '2024-11-15 10:00:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440023',
    '550e8400-e29b-41d4-a716-446655440012',
    'Banco Interbank',
    '898-987654321-0-20',
    'corriente',
    'PEN',
    '00389800987654321020',
    true,
    '2024-12-01 09:00:00+00',
    '2024-12-01 09:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;

-- Insertar documentos demo
INSERT INTO documents (
  id,
  supplier_id,
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
  archivo_pdf_comprobante_url,
  archivos_entregables,
  status,
  approved_by,
  approved_at,
  codigo_comprobante,
  presupuesto_proyecto,
  created_at,
  updated_at
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440031',
    '550e8400-e29b-41d4-a716-446655440011',
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
    '#',
    '[
      {
        "id": "1",
        "name": "Informe_Consultoria_Sistemas.pdf",
        "url": "#",
        "type": "application/pdf",
        "size": 2048576
      },
      {
        "id": "2",
        "name": "Analisis_Requerimientos.xlsx",
        "url": "#",
        "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "size": 1024000
      }
    ]'::jsonb,
    'approved',
    '550e8400-e29b-41d4-a716-446655440003',
    '2024-12-08 14:30:00+00',
    'COD-2024-001',
    'PROY-SISTEMAS-2024',
    '2024-12-07 10:00:00+00',
    '2024-12-08 14:30:00+00'
  ),
  (
    '550e8400-e29b-41d4-a716-446655440032',
    '550e8400-e29b-41d4-a716-446655440011',
    'boleta',
    'B001-00456',
    850.00,
    'PEN',
    false,
    NULL,
    NULL,
    NULL,
    'aprobador@neoconsulting.com',
    'Mantenimiento preventivo y correctivo de equipos de cómputo, actualización de software y limpieza de sistemas durante el mes de noviembre 2024.',
    '#',
    '[
      {
        "id": "1",
        "name": "Reporte_Mantenimiento.pdf",
        "url": "#",
        "type": "application/pdf",
        "size": 1536000
      }
    ]'::jsonb,
    'pending',
    NULL,
    NULL,
    NULL,
    NULL,
    '2024-12-09 08:00:00+00',
    '2024-12-09 08:00:00+00'
  )
ON CONFLICT (id) DO NOTHING;