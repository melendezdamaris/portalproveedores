/*
  # Crear vistas para el dashboard

  1. Vistas
    - `vw_supplier_dashboard` - Estadísticas para proveedores
    - `vw_approver_dashboard` - Estadísticas para aprobadores
    - `vw_supplier_invoices` - Facturas con información del proveedor
    - `vw_payment_queue` - Cola de pagos para administración

  2. Funciones auxiliares para cálculos
*/

-- Vista para dashboard de proveedores
CREATE OR REPLACE VIEW vw_supplier_dashboard AS
SELECT 
  s.id as supplier_id,
  s.business_name,
  COUNT(i.id) as total_invoices,
  COUNT(CASE WHEN i.status = 'approved' THEN 1 END) as approved_invoices,
  COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_invoices,
  COUNT(CASE WHEN i.status = 'rejected' THEN 1 END) as rejected_invoices,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_invoices,
  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_paid_amount,
  COALESCE(SUM(CASE WHEN i.status = 'approved' AND p.status != 'paid' THEN i.amount ELSE 0 END), 0) as pending_payment_amount
FROM suppliers s
LEFT JOIN invoices i ON s.id = i.supplier_id
LEFT JOIN payments p ON i.id = p.invoice_id
GROUP BY s.id, s.business_name;

-- Vista para dashboard de aprobadores
CREATE OR REPLACE VIEW vw_approver_dashboard AS
SELECT 
  COUNT(i.id) as total_invoices,
  COUNT(CASE WHEN i.status = 'approved' THEN 1 END) as approved_invoices,
  COUNT(CASE WHEN i.status = 'pending' THEN 1 END) as pending_invoices,
  COUNT(CASE WHEN i.status = 'rejected' THEN 1 END) as rejected_invoices,
  COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_invoices,
  COALESCE(SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END), 0) as total_paid_amount,
  COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.amount ELSE 0 END), 0) as pending_approval_amount
FROM invoices i
LEFT JOIN payments p ON i.id = p.invoice_id;

-- Vista para facturas con información del proveedor
CREATE OR REPLACE VIEW vw_supplier_invoices AS
SELECT 
  i.*,
  s.business_name,
  s.trade_name,
  s.ruc,
  s.email as supplier_email,
  p.status as payment_status,
  p.estimated_payment_date,
  p.actual_payment_date,
  p.payment_method,
  p.notes as payment_notes,
  ba.bank_name,
  ba.account_number,
  ba.currency as account_currency
FROM invoices i
JOIN suppliers s ON i.supplier_id = s.id
LEFT JOIN payments p ON i.id = p.invoice_id
LEFT JOIN bank_accounts ba ON p.bank_account_id = ba.id;

-- Vista para cola de pagos
CREATE OR REPLACE VIEW vw_payment_queue AS
SELECT 
  p.*,
  i.invoice_number,
  i.invoice_type,
  i.amount as invoice_amount,
  i.currency as invoice_currency,
  i.approved_at,
  s.business_name,
  s.ruc,
  s.email as supplier_email,
  ba.bank_name,
  ba.account_number,
  ba.account_type,
  ba.cci
FROM payments p
JOIN invoices i ON p.invoice_id = i.id
JOIN suppliers s ON i.supplier_id = s.id
LEFT JOIN bank_accounts ba ON p.bank_account_id = ba.id
WHERE i.status = 'approved'
ORDER BY p.estimated_payment_date ASC NULLS LAST, p.created_at ASC;

-- Vista para inbox de aprobadores
CREATE OR REPLACE VIEW vw_approver_inbox AS
SELECT 
  i.id,
  i.invoice_number,
  i.invoice_type,
  i.amount,
  i.currency,
  i.service_performed,
  i.approver_email,
  i.created_at as submitted_at,
  s.business_name as supplier_name,
  s.ruc,
  s.email as supplier_email,
  COUNT(df.id) as deliverable_files_count
FROM invoices i
JOIN suppliers s ON i.supplier_id = s.id
LEFT JOIN deliverable_files df ON i.id = df.invoice_id
WHERE i.status = 'pending'
GROUP BY i.id, i.invoice_number, i.invoice_type, i.amount, i.currency, 
         i.service_performed, i.approver_email, i.created_at,
         s.business_name, s.ruc, s.email
ORDER BY i.created_at ASC;

-- Función para obtener estadísticas de feedback
CREATE OR REPLACE FUNCTION get_feedback_stats()
RETURNS TABLE (
  total_surveys integer,
  avg_communication decimal,
  avg_payment_timing decimal,
  avg_platform_usability decimal,
  avg_overall_satisfaction decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_surveys,
    ROUND(AVG(communication_rating), 2) as avg_communication,
    ROUND(AVG(payment_timing_rating), 2) as avg_payment_timing,
    ROUND(AVG(platform_usability_rating), 2) as avg_platform_usability,
    ROUND(AVG(overall_satisfaction_rating), 2) as avg_overall_satisfaction
  FROM feedback_surveys;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;