/*
  # Crear funciones y triggers para automatización

  1. Funciones
    - `create_payment_record()` - Crea registro de pago automáticamente al crear documento
    - `notify_document_created()` - Envía notificaciones al crear documento
    - `notify_document_status_changed()` - Notifica cambios de estado
    - `sync_payment_dates()` - Sincroniza fechas entre pagos y documentos
  
  2. Triggers
    - Trigger para crear registro de pago automáticamente
    - Trigger para enviar notificaciones
    - Trigger para sincronizar fechas
*/

-- Función para crear registro de pago automáticamente
CREATE OR REPLACE FUNCTION create_payment_record()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear registro de pago automáticamente al insertar documento
  INSERT INTO payments (
    document_id,
    supplier_id,
    numero_documento,
    tipo_documento,
    monto,
    moneda,
    estado_pago
  ) VALUES (
    NEW.id,
    NEW.supplier_id,
    NEW.numero_documento,
    NEW.tipo_documento,
    NEW.monto,
    NEW.moneda,
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear registro de pago
CREATE TRIGGER trigger_create_payment_record
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_record();

-- Función para notificar creación de documento
CREATE OR REPLACE FUNCTION notify_document_created()
RETURNS TRIGGER AS $$
DECLARE
  supplier_name text;
BEGIN
  -- Obtener nombre del proveedor
  SELECT razon_social INTO supplier_name
  FROM suppliers
  WHERE id = NEW.supplier_id;
  
  -- Notificar al proveedor
  INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, url_accion)
  VALUES (
    NEW.supplier_id::text,
    'Comprobante registrado exitosamente',
    'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' por ' || NEW.moneda || ' ' || NEW.monto || ' ha sido registrado',
    'success',
    '/payments'
  );
  
  -- Notificar a operaciones (asumiendo user_id específico para operaciones)
  INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, url_accion)
  VALUES (
    'operaciones-user-id', -- En implementación real, obtener de auth.users
    'Nuevo comprobante registrado',
    supplier_name || ' ha registrado ' || NEW.tipo_documento || ' ' || NEW.numero_documento,
    'info',
    '/all-documents'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar creación de documento
CREATE TRIGGER trigger_notify_document_created
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_created();

-- Función para notificar cambios de estado
CREATE OR REPLACE FUNCTION notify_document_status_changed()
RETURNS TRIGGER AS $$
DECLARE
  supplier_name text;
BEGIN
  -- Solo procesar si el estado cambió
  IF OLD.status != NEW.status THEN
    -- Obtener nombre del proveedor
    SELECT razon_social INTO supplier_name
    FROM suppliers
    WHERE id = NEW.supplier_id;
    
    -- Notificar al proveedor sobre el cambio de estado
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, url_accion)
      VALUES (
        NEW.supplier_id::text,
        'Comprobante aprobado',
        'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' ha sido aprobado',
        'success',
        '/payments'
      );
      
      -- Actualizar estado de pago a 'scheduled' cuando se aprueba
      UPDATE payments 
      SET estado_pago = 'scheduled',
          fecha_estimada_pago = CURRENT_DATE + INTERVAL '15 days',
          updated_at = now()
      WHERE document_id = NEW.id;
      
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, url_accion)
      VALUES (
        NEW.supplier_id::text,
        'Comprobante rechazado',
        'Su ' || NEW.tipo_documento || ' ' || NEW.numero_documento || ' ha sido rechazado. Motivo: ' || COALESCE(NEW.razon_rechazo, 'No especificado'),
        'warning',
        '/documents-upload'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificar cambios de estado
CREATE TRIGGER trigger_notify_document_status_changed
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_document_status_changed();

-- Función para sincronizar fechas entre pagos y documentos
CREATE OR REPLACE FUNCTION sync_payment_dates()
RETURNS TRIGGER AS $$
BEGIN
  -- Sincronizar fecha estimada de pago con documento si está aprobado
  IF NEW.fecha_estimada_pago IS NOT NULL THEN
    UPDATE documents 
    SET updated_at = now()
    WHERE id = NEW.document_id 
    AND status = 'approved';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sincronizar fechas
CREATE TRIGGER trigger_sync_payment_dates
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION sync_payment_dates();