/*
  # Crear triggers y funciones adicionales

  1. Funciones
    - Crear pago automáticamente cuando se aprueba una factura
    - Actualizar estado de pago cuando se aprueba
    - Validaciones de negocio

  2. Triggers
    - Auto-crear pago cuando se aprueba factura
    - Validaciones automáticas
*/

-- Función para crear pago automáticamente cuando se aprueba una factura
CREATE OR REPLACE FUNCTION create_payment_on_invoice_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo crear pago si la factura se está aprobando por primera vez
  IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
    INSERT INTO payments (
      invoice_id,
      amount,
      currency,
      status,
      estimated_payment_date,
      created_by
    ) VALUES (
      NEW.id,
      NEW.amount,
      NEW.currency,
      'pending',
      CURRENT_DATE + INTERVAL '15 days', -- 15 días después de la aprobación
      NEW.approved_by
    )
    ON CONFLICT (invoice_id) DO NOTHING; -- Evitar duplicados
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear pago automáticamente
CREATE TRIGGER trigger_create_payment_on_approval
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_on_invoice_approval();

-- Función para validar que solo haya una cuenta primaria por moneda
CREATE OR REPLACE FUNCTION validate_primary_bank_account()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está marcando como primaria, desmarcar las otras del mismo proveedor y moneda
  IF NEW.is_primary = true THEN
    UPDATE bank_accounts 
    SET is_primary = false 
    WHERE supplier_id = NEW.supplier_id 
      AND currency = NEW.currency 
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para validar cuenta primaria
CREATE TRIGGER trigger_validate_primary_bank_account
  BEFORE INSERT OR UPDATE ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION validate_primary_bank_account();

-- Función para calcular automáticamente el monto de detracción
CREATE OR REPLACE FUNCTION calculate_detraction_amount()
RETURNS TRIGGER AS $$
BEGIN
  -- Si tiene detracción y hay porcentaje, calcular el monto automáticamente
  IF NEW.has_detraction = true AND NEW.detraction_percentage IS NOT NULL THEN
    NEW.detraction_amount = ROUND((NEW.amount * NEW.detraction_percentage / 100), 2);
  ELSIF NEW.has_detraction = false THEN
    -- Si no tiene detracción, limpiar los campos relacionados
    NEW.detraction_percentage = NULL;
    NEW.detraction_amount = NULL;
    NEW.detraction_code = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para calcular detracción automáticamente
CREATE TRIGGER trigger_calculate_detraction
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_detraction_amount();

-- Función para validar que el aprobador existe en portal_users
CREATE OR REPLACE FUNCTION validate_approver_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que el email del aprobador corresponde a un usuario con rol aprobador
  IF NOT EXISTS (
    SELECT 1 FROM auth.users au
    JOIN portal_users pu ON au.id = pu.user_id
    WHERE au.email = NEW.approver_email 
    AND pu.role = 'aprobador'
    AND pu.is_active = true
  ) THEN
    RAISE EXCEPTION 'El email del aprobador no corresponde a un aprobador válido en el sistema';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para validar aprobador (comentado por ahora para no bloquear el desarrollo)
-- CREATE TRIGGER trigger_validate_approver
--   BEFORE INSERT OR UPDATE ON invoices
--   FOR EACH ROW
--   EXECUTE FUNCTION validate_approver_email();

-- Función para obtener el siguiente número de factura
CREATE OR REPLACE FUNCTION get_next_invoice_number(supplier_uuid uuid, invoice_type_param invoice_type)
RETURNS text AS $$
DECLARE
  next_number integer;
  prefix text;
BEGIN
  -- Definir prefijo según el tipo
  CASE invoice_type_param
    WHEN 'factura' THEN prefix := 'F';
    WHEN 'boleta' THEN prefix := 'B';
    WHEN 'recibo' THEN prefix := 'R';
    ELSE prefix := 'O';
  END CASE;
  
  -- Obtener el siguiente número
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(invoice_number FROM '[0-9]+$') AS integer
    )
  ), 0) + 1
  INTO next_number
  FROM invoices 
  WHERE supplier_id = supplier_uuid 
    AND invoice_type = invoice_type_param
    AND invoice_number ~ ('^' || prefix || '[0-9]+-[0-9]+$');
  
  -- Retornar el número formateado
  RETURN prefix || '001-' || LPAD(next_number::text, 5, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener resumen de actividad reciente
CREATE OR REPLACE FUNCTION get_recent_activity(user_uuid uuid, activity_limit integer DEFAULT 10)
RETURNS TABLE (
  activity_type text,
  activity_title text,
  activity_description text,
  activity_date timestamptz,
  related_id uuid
) AS $$
BEGIN
  RETURN QUERY
  WITH user_supplier AS (
    SELECT s.id as supplier_id
    FROM suppliers s
    JOIN portal_users pu ON s.portal_user_id = pu.id
    WHERE pu.user_id = user_uuid
  ),
  user_role AS (
    SELECT pu.role
    FROM portal_users pu
    WHERE pu.user_id = user_uuid
  )
  SELECT * FROM (
    -- Facturas del proveedor
    SELECT 
      'invoice'::text as activity_type,
      ('Factura ' || i.invoice_number)::text as activity_title,
      (i.invoice_type || ' por ' || i.currency || ' ' || i.amount::text)::text as activity_description,
      i.created_at as activity_date,
      i.id as related_id
    FROM invoices i
    WHERE EXISTS (SELECT 1 FROM user_supplier us WHERE i.supplier_id = us.supplier_id)
    
    UNION ALL
    
    -- Pagos del proveedor
    SELECT 
      'payment'::text as activity_type,
      ('Pago de ' || i.invoice_number)::text as activity_title,
      ('Estado: ' || p.status || ' - ' || p.currency || ' ' || p.amount::text)::text as activity_description,
      p.updated_at as activity_date,
      p.id as related_id
    FROM payments p
    JOIN invoices i ON p.invoice_id = i.id
    WHERE EXISTS (SELECT 1 FROM user_supplier us WHERE i.supplier_id = us.supplier_id)
    
    UNION ALL
    
    -- Comunicados (para todos los roles)
    SELECT 
      'announcement'::text as activity_type,
      a.title as activity_title,
      SUBSTRING(a.content, 1, 100)::text as activity_description,
      a.created_at as activity_date,
      a.id as related_id
    FROM announcements a
    WHERE a.is_active = true 
      AND (a.scheduled_date IS NULL OR a.scheduled_date <= now())
      AND (
        a.target_role = 'all' 
        OR (a.target_role = (SELECT role FROM user_role))
        OR EXISTS (SELECT 1 FROM user_supplier us WHERE a.target_supplier_id = us.supplier_id)
      )
  ) activities
  ORDER BY activity_date DESC
  LIMIT activity_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;