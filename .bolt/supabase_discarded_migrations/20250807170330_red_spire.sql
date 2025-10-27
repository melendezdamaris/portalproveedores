/*
  # Crear funciones auxiliares y triggers

  1. Funciones auxiliares
    - `current_user_id()` - Obtener ID del usuario actual
    - `current_user_role()` - Obtener rol del usuario actual
    - `create_notification()` - Crear notificación automática

  2. Triggers automáticos
    - Crear notificaciones cuando se registra un comprobante
    - Crear notificaciones cuando se aprueba/rechaza un comprobante
    - Actualizar estado de pago cuando se aprueba un comprobante
*/

-- Función para obtener el ID del usuario actual (simulada)
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS text AS $$
BEGIN
  -- En una implementación real, esto vendría del JWT de Supabase Auth
  -- Por ahora retornamos un valor por defecto
  RETURN COALESCE(current_setting('app.current_user_id', true), 'user_1');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener el rol del usuario actual (simulada)
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS text AS $$
BEGIN
  -- En una implementación real, esto vendría del JWT de Supabase Auth
  -- Por ahora retornamos un valor por defecto basado en el user_id
  RETURN COALESCE(current_setting('app.current_user_role', true), 'proveedor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones automáticas
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id text,
  p_titulo text,
  p_mensaje text,
  p_tipo notification_type DEFAULT 'info',
  p_url_accion text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO notifications (user_id, titulo, mensaje, tipo, url_accion)
  VALUES (p_user_id, p_titulo, p_mensaje, p_tipo, p_url_accion)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para notificar cuando se registra un comprobante
CREATE OR REPLACE FUNCTION notify_document_created()
RETURNS TRIGGER AS $$
DECLARE
  supplier_user_id text;
  supplier_name text;
BEGIN
  -- Obtener información del proveedor
  SELECT user_id, razon_social INTO supplier_user_id, supplier_name
  FROM suppliers WHERE id = NEW.supplier_id;
  
  -- Notificar al proveedor
  PERFORM create_notification(
    supplier_user_id,
    'Comprobante registrado exitosamente',
    'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' por ' || NEW.moneda || ' ' || NEW.monto || ' ha sido registrado y está en revisión.',
    'success',
    '/payments'
  );
  
  -- Notificar a aprobadores (simulado - en implementación real sería dinámico)
  PERFORM create_notification(
    'aprobador_1',
    'Nuevo comprobante para revisar',
    'Se ha registrado un nuevo ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' de ' || supplier_name || ' por ' || NEW.moneda || ' ' || NEW.monto,
    'info',
    '/approve-documents'
  );
  
  -- Notificar a operaciones
  PERFORM create_notification(
    'operaciones_1',
    'Nuevo comprobante registrado',
    NEW.tipo_documento || ' ' || NEW.numero_documento || ' por ' || NEW.moneda || ' ' || NEW.monto || ' ha sido registrado y está disponible en el módulo de Pagos',
    'info',
    '/payments-admin'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar cuando se crea un documento
CREATE TRIGGER notify_on_document_created
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_created();

-- Función para notificar cuando se aprueba/rechaza un comprobante
CREATE OR REPLACE FUNCTION notify_document_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  supplier_user_id text;
BEGIN
  -- Solo procesar si el estado cambió
  IF OLD.status != NEW.status THEN
    -- Obtener user_id del proveedor
    SELECT user_id INTO supplier_user_id
    FROM suppliers WHERE id = NEW.supplier_id;
    
    IF NEW.status = 'approved' THEN
      -- Notificar aprobación al proveedor
      PERFORM create_notification(
        supplier_user_id,
        'Comprobante aprobado',
        'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' por ' || NEW.moneda || ' ' || NEW.monto || ' ha sido aprobado.',
        'success',
        '/payments'
      );
      
      -- Notificar a operaciones
      PERFORM create_notification(
        'operaciones_1',
        'Comprobante aprobado',
        NEW.tipo_documento || ' ' || NEW.numero_documento || ' por ' || NEW.moneda || ' ' || NEW.monto || ' ha sido aprobado y está disponible para gestión de pagos',
        'info',
        '/payments-admin'
      );
      
      -- Actualizar estado de pago a 'scheduled' y fecha estimada
      UPDATE payments 
      SET 
        estado_pago = 'scheduled',
        fecha_estimada_pago = CURRENT_DATE + INTERVAL '15 days',
        updated_at = now()
      WHERE document_id = NEW.id;
      
    ELSIF NEW.status = 'rejected' THEN
      -- Notificar rechazo al proveedor
      PERFORM create_notification(
        supplier_user_id,
        'Comprobante rechazado',
        'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' ha sido rechazado. Motivo: ' || COALESCE(NEW.motivo_rechazo, 'No especificado'),
        'warning',
        '/documents-upload'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para notificar cambios de estado
CREATE TRIGGER notify_on_document_status_changed
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_status_changed();