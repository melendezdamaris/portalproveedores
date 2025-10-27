/*
  # Crear vistas para dashboard

  1. Vistas para estadísticas del dashboard
    - `supplier_dashboard_stats` - Estadísticas para proveedores
    - `operations_dashboard_stats` - Estadísticas para operaciones
    - `approver_dashboard_stats` - Estadísticas para aprobadores

  2. Vistas para actividad reciente
    - `recent_activity` - Actividad reciente por usuario
*/

-- Vista para estadísticas del dashboard de proveedores
CREATE OR REPLACE VIEW supplier_dashboard_stats AS
SELECT 
  s.user_id,
  s.id as supplier_id,
  s.razon_social,
  
  -- Estadísticas de documentos
  COUNT(d.id) as total_comprobantes,
  COUNT(CASE WHEN d.status = 'approved' THEN 1 END) as comprobantes_aprobados,
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as comprobantes_pendientes,
  COUNT(CASE WHEN d.status = 'rejected' THEN 1 END) as comprobantes_rechazados,
  
  -- Estadísticas de pagos
  COUNT(CASE WHEN p.estado_pago = 'paid' THEN 1 END) as pagos_recibidos,
  COALESCE(SUM(CASE WHEN p.estado_pago = 'paid' THEN p.monto END), 0) as monto_total_pagado,
  COALESCE(SUM(CASE WHEN p.estado_pago = 'scheduled' THEN p.monto END), 0) as monto_programado,
  COALESCE(SUM(p.monto), 0) as monto_total_registrado
  
FROM suppliers s
LEFT JOIN documents d ON s.id = d.supplier_id
LEFT JOIN payments p ON d.id = p.document_id
GROUP BY s.id, s.user_id, s.razon_social;

-- Vista para estadísticas del dashboard de operaciones
CREATE OR REPLACE VIEW operations_dashboard_stats AS
SELECT 
  COUNT(DISTINCT s.id) as total_proveedores_aprobados,
  COUNT(DISTINCT CASE WHEN s.status = 'approved' THEN s.id END) as proveedores_activos,
  
  -- Estadísticas de documentos
  COUNT(CASE WHEN d.status = 'approved' THEN 1 END) as documentos_aprobados,
  COUNT(p.id) as total_registros_pagos,
  COUNT(CASE WHEN p.estado_pago = 'pending' THEN 1 END) as pagos_por_completar,
  
  -- Montos
  COALESCE(SUM(CASE WHEN p.estado_pago = 'paid' THEN p.monto END), 0) as monto_total_pagado,
  COALESCE(SUM(CASE WHEN p.estado_pago != 'paid' THEN p.monto END), 0) as monto_pendiente_pago
  
FROM suppliers s
LEFT JOIN documents d ON s.id = d.supplier_id AND d.status = 'approved'
LEFT JOIN payments p ON d.id = p.document_id;

-- Vista para estadísticas del dashboard de aprobadores
CREATE OR REPLACE VIEW approver_dashboard_stats AS
SELECT 
  COUNT(CASE WHEN d.status = 'pending' THEN 1 END) as documentos_pendientes,
  COALESCE(SUM(CASE WHEN d.status = 'pending' THEN d.monto END), 0) as monto_total_pendiente,
  COUNT(DISTINCT d.supplier_id) as proveedores_con_pendientes
  
FROM documents d
WHERE d.status = 'pending';

-- Vista para actividad reciente
CREATE OR REPLACE VIEW recent_activity AS
SELECT 
  'document' as tipo_actividad,
  d.id,
  d.supplier_id,
  s.user_id,
  s.razon_social as nombre_proveedor,
  d.tipo_documento || ' ' || d.numero_documento as titulo,
  d.status as estado,
  d.monto,
  d.moneda,
  d.created_at as fecha_actividad,
  'Comprobante registrado' as descripcion
FROM documents d
JOIN suppliers s ON d.supplier_id = s.id

UNION ALL

SELECT 
  'payment' as tipo_actividad,
  p.id,
  p.supplier_id,
  s.user_id,
  s.razon_social as nombre_proveedor,
  'Pago ' || p.numero_documento as titulo,
  p.estado_pago as estado,
  p.monto,
  p.moneda,
  p.updated_at as fecha_actividad,
  CASE 
    WHEN p.estado_pago = 'paid' THEN 'Pago completado'
    WHEN p.estado_pago = 'scheduled' THEN 'Pago programado'
    ELSE 'Pago pendiente'
  END as descripcion
FROM payments p
JOIN suppliers s ON p.supplier_id = s.id

ORDER BY fecha_actividad DESC;