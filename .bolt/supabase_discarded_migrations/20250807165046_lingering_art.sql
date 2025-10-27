/*
  # Crear funciones y triggers para automatización

  1. Funciones
    - Función para actualizar updated_at automáticamente
    - Función para crear registro de pago automáticamente
    - Función para crear notificaciones automáticamente

  2. Triggers
    - Trigger para updated_at en suppliers
    - Trigger para updated_at en documents
    - Trigger para updated_at en payments
    - Trigger para crear payment record cuando se crea un document
*/

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_suppliers_updated_at 
    BEFORE UPDATE ON suppliers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at 
    BEFORE UPDATE ON documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at 
    BEFORE UPDATE ON payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear registro de pago automáticamente
CREATE OR REPLACE FUNCTION create_payment_record()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO payments (
        document_id,
        supplier_id,
        document_number,
        amount,
        currency,
        payment_status,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.supplier_id,
        NEW.document_number,
        NEW.amount,
        NEW.currency,
        'pending',
        now(),
        now()
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para crear payment record cuando se crea un document
CREATE TRIGGER create_payment_on_document_insert
    AFTER INSERT ON documents
    FOR EACH ROW EXECUTE FUNCTION create_payment_record();

-- Función para actualizar estado de pago cuando se aprueba documento
CREATE OR REPLACE FUNCTION update_payment_on_document_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        UPDATE payments 
        SET 
            payment_status = 'scheduled',
            estimated_payment_date = CURRENT_DATE + INTERVAL '15 days',
            updated_at = now()
        WHERE document_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar pago cuando se aprueba documento
CREATE TRIGGER update_payment_on_document_approval
    AFTER UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_payment_on_document_approval();