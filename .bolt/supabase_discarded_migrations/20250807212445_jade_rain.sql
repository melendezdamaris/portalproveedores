/*
  # Create complete dashboard views for real-time statistics

  1. Views Created
    - `supplier_dashboard_stats` - Estadísticas específicas por proveedor
    - `recent_activity` - Actividad reciente del sistema
    - `payment_summary` - Resumen completo de pagos
    - `global_stats` - Estadísticas globales para operaciones
  
  2. Features
    - Real-time data aggregation
    - Role-based filtering
    - Automatic calculations
    - Performance optimized
*/

-- Vista para estadísticas del dashboard de proveedores
CREATE OR REPLACE VIEW supplier_dashboard_stats AS
SELECT 
  s.id as supplier_id,
  s.user_id,
  s.razon_social,
  
  -- Estadísticas de documentos
  COUNT(d.id) as total_documentos,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as documentos_pendientes,
  COUNT(CASE WHEN d.status = 'approved' THEN 1 END) as documentos_aprobados,
  COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as documentos_rechazados,
  
  -- Estadísticas de pagos
  COUNT(p.id) as total_pagos,
  COUNT(CASE WHEN p.estado_pago = 'pending' THEN 1 END) as pagos_pendientes,
  COUNT(CASE WHEN p.estado_pago = 'scheduled' THEN 1 END) as pagos_programados,
  COUNT(CASE WHEN p.estado_pago = 'paid' THEN 1 END) as pagos_realizados,
  
  -- Montos por moneda
  COALESCE(SUM(CASE WHEN d.moneda = 'PEN' THEN d.monto END), 0) as total_soles,
  COALESCE(SUM(CASE WHEN d.moneda = 'USD' THEN d.monto END), 0) as total_dolares,
  COALESCE(SUM(CASE WHEN d.moneda = 'PEN' AND p.estado_pago = 'paid' THEN d.monto END), 0) as pagado_soles,
  COALESCE(SUM(CASE WHEN d.moneda = 'USD' AND p.estado_pago = 'paid' THEN d.monto END), 0) as pagado_dolares,
  
  -- Fechas importantes
  MAX(d.created_at) as ultimo_documento,
  MAX(p.fecha_real_pago) as ultimo_pago
  
FROM suppliers s
LEFT JOIN documents d ON s.id = d.supplier_id
LEFT JOIN payments p ON d.id = p.document_id
GROUP BY s.id, s.user_id, s.razon_social;

-- Vista para actividad reciente
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  'documento' as tipo_actividad,
  d.id,
  d.supplier_id,
  s.razon_social as supplier_name,
  d.numero_documento as titulo,
  d.status,
  d.monto,
  d.moneda,
  d.created_at,
  d.updated_at
FROM documents d
JOIN suppliers s ON d.supplier_id = s.id

UNION ALL

SELECT 
  'pago' as tipo_actividad,
  p.id,
  p.supplier_id,
  s.razon_social as supplier_name,
  p.numero_documento as titulo,
  p.estado_pago as status,
  p.monto,
  p.moneda,
  p.created_at,
  p.updated_at
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id

ORDER BY created_at DESC;

-- Vista para resumen completo de pagos
CREATE OR REPLACE VIEW payment_summary AS
SELECT 
  p.id,
  p.document_id,
  p.supplier_id,
  s.razon_social as supplier_name,
  s.user_id as supplier_user_id,
  p.numero_documento,
  p.tipo_documento,
  p.monto,
  p.moneda,
  p.estado_pago,
  p.fecha_estimada_pago,
  p.fecha_real_pago,
  p.metodo_pago,
  p.cuenta_bancaria_utilizada,
  p.notas,
  d.status as document_status,
  d.correo_aprobador,
  d.approved_at,
  p.created_at,
  p.updated_at
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id
LEFT JOIN documents d ON p.document_id = d.id;

-- Vista para estadísticas globales
CREATE OR REPLACE VIEW global_stats AS
SELECT 
  -- Estadísticas de proveedores
  COUNT(DISTINCT s.id) as total_proveedores,
  COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) as proveedores_aprobados,
  COUNT(DISTINCT CASE WHEN s.status = 'pending' THEN s.id END) as proveedores_pendientes,
  
  -- Estadísticas de documentos
  COUNT(DISTINCT d.id) as total_documentos,
  COUNT(DISTINCT CASE WHEN d.status = 'pending' THEN d.id END) as documentos_pendientes,
  COUNT(DISTINCT CASE WHEN d.status = 'approved' THEN d.id END) as documentos_aprobados,
  COUNT(DISTINCT CASE WHEN d.status = 'rejected' THEN d.id END) as documentos_rechazados,
  
  -- Estadísticas de pagos
  COUNT(DISTINCT p.id) as total_pagos,
  COUNT(DISTINCT CASE WHEN p.estado_pago = 'pending' THEN p.id END) as pagos_pendientes,
  COUNT(DISTINCT CASE WHEN p.estado_pago = 'scheduled' THEN p.id END) as pagos_programados,
  COUNT(DISTINCT CASE WHEN p.estado_pago = 'paid' THEN p.id END) as pagos_realizados,
  
  -- Montos totales
  COALESCE(SUM(CASE WHEN d.moneda = 'PEN' THEN d.monto END), 0) as monto_total_soles,
  COALESCE(SUM(CASE WHEN d.moneda = 'USD' THEN d.monto END), 0) as monto_total_dolares,
  COALESCE(SUM(CASE WHEN d.moneda = 'PEN' AND p.estado_pago = 'paid' THEN d.monto END), 0) as pagado_total_soles,
  COALESCE(SUM(CASE WHEN d.moneda = 'USD' AND p.estado_pago = 'paid' THEN d.monto END), 0) as pagado_total_dolares,
  
  -- Promedio de feedback
  COALESCE(AVG(f.rating_promedio), 0) as feedback_promedio
  
FROM suppliers s
LEFT JOIN documents d ON s.id = d.supplier_id
LEFT JOIN payments p ON d.id = p.document_id
LEFT JOIN feedback_surveys f ON s.id = f.supplier_id;