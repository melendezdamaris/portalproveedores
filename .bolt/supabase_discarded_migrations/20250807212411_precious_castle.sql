/*
  # Create automatic triggers for data synchronization

  1. Triggers
    - Auto-create payment record when document is inserted
    - Auto-update payment status when document status changes
    - Auto-send notifications on status changes
    - Auto-notify on new announcements and company documents
  
  2. Functions
    - Payment record creation function
    - Payment status update function
    - Notification functions for various events
*/

-- Función para crear registro de pago automáticamente al insertar documento
CREATE OR REPLACE FUNCTION create_payment_record_on_document_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Crear registro de pago automáticamente
  INSERT INTO payments (
    document_id,
    supplier_id,
    numero_documento,
    tipo_documento,
    monto,
    moneda,
    estado_pago,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.supplier_id,
    NEW.numero_documento,
    NEW.tipo_documento,
    NEW.monto,
    NEW.moneda,
    'pending',
    NEW.created_at,
    NEW.updated_at
  );
  
  -- Crear notificación para el proveedor
  INSERT INTO notifications (
    user_id,
    titulo,
    mensaje,
    tipo_notificacion
  )
  SELECT 
    s.user_id,
    'Comprobante registrado exitosamente',
    'Su comprobante ' || NEW.numero_documento || ' ha sido registrado y está en proceso de revisión.',
    'success'
  FROM suppliers s
  WHERE s.id = NEW.supplier_id;
  
  -- Crear notificación para el aprobador
  INSERT INTO notifications (
    user_id,
    titulo,
    mensaje,
    tipo_notificacion,
    action_url
  )
  SELECT 
    up.user_id,
    'Nuevo comprobante para aprobar',
    'El comprobante ' || NEW.numero_documento || ' de ' || s.razon_social || ' requiere su aprobación.',
    'warning',
    '/approve-documents'
  FROM suppliers s
  JOIN user_profiles up ON up.email = NEW.correo_aprobador
  WHERE s.id = NEW.supplier_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar estado de pago cuando cambia estado del documento
CREATE OR REPLACE FUNCTION update_payment_on_document_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el estado cambió
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Si se aprueba el documento
    IF NEW.status = 'approved' THEN
      UPDATE payments 
      SET 
        estado_pago = 'scheduled',
        fecha_estimada_pago = (NEW.approved_at::date + INTERVAL '15 days')::date,
        updated_at = now()
      WHERE document_id = NEW.id;
      
      -- Notificar al proveedor sobre aprobación
      INSERT INTO notifications (
        user_id,
        titulo,
        mensaje,
        tipo_notificacion,
        action_url
      )
      SELECT 
        s.user_id,
        'Comprobante aprobado',
        'Su comprobante ' || NEW.numero_documento || ' ha sido aprobado. El pago está programado para ' || 
        to_char((NEW.approved_at::date + INTERVAL '15 days'), 'DD/MM/YYYY') || '.',
        'success',
        '/payments'
      FROM suppliers s
      WHERE s.id = NEW.supplier_id;
      
    -- Si se rechaza el documento
    ELSIF NEW.status = 'rejected' THEN
      UPDATE payments 
      SET 
        estado_pago = 'pending',
        updated_at = now()
      WHERE document_id = NEW.id;
      
      -- Notificar al proveedor sobre rechazo
      INSERT INTO notifications (
        user_id,
        titulo,
        mensaje,
        tipo_notificacion,
        action_url
      )
      SELECT 
        s.user_id,
        'Comprobante rechazado',
        'Su comprobante ' || NEW.numero_documento || ' ha sido rechazado. Motivo: ' || 
        COALESCE(NEW.rejection_reason, 'No especificado') || '. Puede corregir y volver a enviar.',
        'error',
        '/documents-upload'
      FROM suppliers s
      WHERE s.id = NEW.supplier_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar cambios de estado de proveedor
CREATE OR REPLACE FUNCTION notify_on_supplier_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo procesar si el estado cambió
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    
    -- Si se aprueba el proveedor
    IF NEW.status = 'approved' THEN
      INSERT INTO notifications (
        user_id,
        titulo,
        mensaje,
        tipo_notificacion,
        action_url
      ) VALUES (
        NEW.user_id,
        'Registro de proveedor aprobado',
        '¡Felicitaciones! Su registro como proveedor ha sido aprobado. Ya puede acceder a todas las funcionalidades del portal.',
        'success',
        '/dashboard'
      );
      
    -- Si se rechaza el proveedor
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO notifications (
        user_id,
        titulo,
        mensaje,
        tipo_notificacion
      ) VALUES (
        NEW.user_id,
        'Registro de proveedor rechazado',
        'Su registro como proveedor ha sido rechazado. Motivo: ' || 
        COALESCE(NEW.rejection_reason, 'No especificado') || '. Contacte a soporte para más información.',
        'error'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar nuevos comunicados
CREATE OR REPLACE FUNCTION notify_on_new_announcement()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar según el targeting del comunicado
  IF NEW.target_role = 'all' THEN
    -- Notificar a todos los usuarios activos
    INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, action_url)
    SELECT 
      up.user_id,
      'Nuevo comunicado: ' || NEW.titulo,
      LEFT(NEW.contenido, 100) || CASE WHEN LENGTH(NEW.contenido) > 100 THEN '...' ELSE '' END,
      CASE NEW.tipo_comunicado
        WHEN 'warning' THEN 'warning'
        WHEN 'success' THEN 'success'
        WHEN 'error' THEN 'error'
        ELSE 'info'
      END,
      '/announcements'
    FROM user_profiles up
    WHERE up.is_active = true;
    
  ELSIF NEW.target_role IS NOT NULL THEN
    -- Notificar solo al rol específico
    INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, action_url)
    SELECT 
      up.user_id,
      'Nuevo comunicado: ' || NEW.titulo,
      LEFT(NEW.contenido, 100) || CASE WHEN LENGTH(NEW.contenido) > 100 THEN '...' ELSE '' END,
      CASE NEW.tipo_comunicado
        WHEN 'warning' THEN 'warning'
        WHEN 'success' THEN 'success'
        WHEN 'error' THEN 'error'
        ELSE 'info'
      END,
      '/announcements'
    FROM user_profiles up
    WHERE up.role = NEW.target_role AND up.is_active = true;
    
  ELSIF NEW.target_supplier_id IS NOT NULL THEN
    -- Notificar solo al proveedor específico
    INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, action_url)
    SELECT 
      s.user_id,
      'Nuevo comunicado: ' || NEW.titulo,
      LEFT(NEW.contenido, 100) || CASE WHEN LENGTH(NEW.contenido) > 100 THEN '...' ELSE '' END,
      CASE NEW.tipo_comunicado
        WHEN 'warning' THEN 'warning'
        WHEN 'success' THEN 'success'
        WHEN 'error' THEN 'error'
        ELSE 'info'
      END,
      '/announcements'
    FROM suppliers s
    WHERE s.id = NEW.target_supplier_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para notificar nuevos documentos de empresa
CREATE OR REPLACE FUNCTION notify_on_new_company_document()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.target_all_suppliers = true THEN
    -- Notificar a todos los proveedores aprobados
    INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, action_url)
    SELECT 
      s.user_id,
      'Nuevo documento disponible: ' || NEW.nombre,
      'Se ha publicado un nuevo documento en el Centro de Documentación: ' || NEW.nombre,
      'info',
      '/documents'
    FROM suppliers s
    WHERE s.status = 'approved';
    
  ELSIF NEW.supplier_id IS NOT NULL THEN
    -- Notificar solo al proveedor específico
    INSERT INTO notifications (user_id, titulo, mensaje, tipo_notificacion, action_url)
    SELECT 
      s.user_id,
      'Nuevo documento disponible: ' || NEW.nombre,
      'Se ha publicado un nuevo documento específico para su empresa: ' || NEW.nombre,
      'info',
      '/documents'
    FROM suppliers s
    WHERE s.id = NEW.supplier_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers
CREATE TRIGGER trigger_create_payment_on_document_insert
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION create_payment_record_on_document_insert();

CREATE TRIGGER trigger_update_payment_on_document_status_change
  AFTER UPDATE ON documents
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_on_document_status_change();

CREATE TRIGGER trigger_notify_on_supplier_status_change
  AFTER UPDATE ON suppliers
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_supplier_status_change();

CREATE TRIGGER trigger_notify_on_new_announcement
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_announcement();

CREATE TRIGGER trigger_notify_on_new_company_document
  AFTER INSERT ON company_documents
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_company_document();