/*
  # Crear vistas para dashboard

  1. Vistas
    - `supplier_dashboard_stats` - Estadísticas del dashboard para proveedores
    - `recent_activity_view` - Actividad reciente interconectada
    - `payment_summary_view` - Resumen de pagos detallado
  
  2. Funcionalidad
    - Comprobantes registrados, aprobados, pendientes, pagos recibidos
    - Datos detallados y montos
    - Actualización automática al crear/modificar datos
*/

-- Vista para estadísticas del dashboard de proveedores
CREATE OR REPLACE VIEW supplier_dashboard_stats AS
SELECT 
  s.id as supplier_id,
  s.razon_social,
  
  -- Estadísticas de documentos
  COUNT(d.id) as total_comprobantes_registrados,
  COUNT(CASE WHEN d.status = 'approved' THEN 1 END) as comprobantes_aprobados,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as comprobantes_pendientes,
  COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as comprobantes_rechazados,
  
  -- Estadísticas de pagos
  COUNT(CASE WHEN p.estado_pago = 'paid' THEN 1 END) as pagos_recibidos,
  COUNT(CASE WHEN p.estado_pago = 'scheduled' THEN 1 END) as pagos_programados,
  COUNT(CASE WHEN p.estado_pago = 'pending' THEN 1 END) as pagos_pendientes,
  
  -- Montos totales
  COALESCE(SUM(CASE WHEN d.moneda = 'PEN' THEN d.monto ELSE 0 END), 0) as total_soles_registrado,
  COALESCE(SUM(CASE WHEN d.moneda = 'USD' THEN d.monto ELSE 0 END), 0) as total_dolares_registrado,
  COALESCE(SUM(CASE WHEN p.estado_pago = 'paid' AND d.moneda = 'PEN' THEN d.monto ELSE 0 END), 0) as total_soles_pagado,
  COALESCE(SUM(CASE WHEN p.estado_pago = 'paid' AND d.moneda = 'USD' THEN d.monto ELSE 0 END), 0) as total_dolares_pagado,
  
  -- Fechas
  MAX(d.created_at) as ultimo_comprobante_registrado,
  MAX(CASE WHEN p.estado_pago = 'paid' THEN p.fecha_real_pago END) as ultimo_pago_recibido
  
FROM suppliers s
LEFT JOIN documents d ON s.id = d.supplier_id
LEFT JOIN payments p ON d.id = p.document_id
GROUP BY s.id, s.razon_social;

-- Vista para actividad reciente
CREATE OR REPLACE VIEW recent_activity_view AS
SELECT 
  'document' as tipo_actividad,
  d.id,
  d.supplier_id,
  s.razon_social as proveedor_nombre,
  'Comprobante ' || d.tipo_documento || ' ' || d.numero_documento as titulo,
  d.status as estado,
  d.monto,
  d.moneda,
  d.created_at as fecha_actividad,
  'Registrado por ' || d.monto || ' ' || d.moneda as descripcion
FROM documents d
JOIN suppliers s ON d.supplier_id = s.id

UNION ALL

SELECT 
  'payment' as tipo_actividad,
  p.id,
  p.supplier_id,
  s.razon_social as proveedor_nombre,
  'Pago ' || p.numero_documento as titulo,
  p.estado_pago as estado,
  p.monto,
  p.moneda,
  p.updated_at as fecha_actividad,
  'Estado: ' || p.estado_pago as descripcion
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id

UNION ALL

SELECT 
  'feedback' as tipo_actividad,
  f.id,
  f.supplier_id,
  s.razon_social as proveedor_nombre,
  'Feedback enviado' as titulo,
  f.calificacion_promedio::text as estado,
  NULL as monto,
  NULL as moneda,
  f.submitted_at as fecha_actividad,
  'Calificación promedio: ' || f.calificacion_promedio as descripcion
FROM feedback_surveys f
JOIN suppliers s ON f.supplier_id = s.id

ORDER BY fecha_actividad DESC;

-- Vista para resumen de pagos detallado
CREATE OR REPLACE VIEW payment_summary_view AS
SELECT 
  p.id,
  p.supplier_id,
  s.razon_social as proveedor_nombre,
  p.numero_documento,
  p.tipo_documento,
  p.monto,
  p.moneda,
  p.estado_pago,
  p.fecha_estimada_pago,
  p.fecha_real_pago,
  p.metodo_pago,
  p.cuenta_bancaria_utilizada,
  d.status as estado_documento,
  d.correo_aprobador,
  d.servicio_realizado,
  p.created_at as fecha_registro,
  p.updated_at as fecha_actualizacion
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id
JOIN documents d ON p.document_id = d.id
ORDER BY p.created_at DESC;