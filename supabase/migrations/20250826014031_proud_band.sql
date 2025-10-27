/*
  # Crear tabla de comunicados

  1. Nueva tabla
    - `announcements`
      - `id` (uuid, primary key)
      - `title` (text)
      - `content` (text)
      - `announcement_type` (enum: general, operativo, financiero, otro)
      - `target_role` (enum: all, proveedor, aprobador)
      - `target_supplier_id` (uuid, foreign key a suppliers, nullable)
      - `is_urgent` (boolean)
      - `is_active` (boolean)
      - `scheduled_date` (timestamp, nullable)
      - `created_by` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear enums
CREATE TYPE announcement_type AS ENUM ('general', 'operativo', 'financiero', 'otro');
CREATE TYPE target_role AS ENUM ('all', 'proveedor', 'aprobador');

-- Crear tabla announcements
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  announcement_type announcement_type NOT NULL DEFAULT 'general',
  target_role target_role NOT NULL DEFAULT 'all',
  target_supplier_id uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  is_urgent boolean DEFAULT false,
  is_active boolean DEFAULT true,
  scheduled_date timestamptz,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read announcements targeted to all"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND 
    target_role = 'all' AND
    (scheduled_date IS NULL OR scheduled_date <= now())
  );

CREATE POLICY "Suppliers can read announcements targeted to suppliers"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND 
    target_role = 'proveedor' AND
    (scheduled_date IS NULL OR scheduled_date <= now()) AND
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'proveedor'
    )
  );

CREATE POLICY "Suppliers can read announcements targeted specifically to them"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    (scheduled_date IS NULL OR scheduled_date <= now()) AND
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = announcements.target_supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

CREATE POLICY "Approvers can read announcements targeted to approvers"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    is_active = true AND 
    target_role = 'aprobador' AND
    (scheduled_date IS NULL OR scheduled_date <= now()) AND
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

CREATE POLICY "Approvers can manage all announcements"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Trigger para updated_at
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(announcement_type);
CREATE INDEX IF NOT EXISTS idx_announcements_target_role ON announcements(target_role);
CREATE INDEX IF NOT EXISTS idx_announcements_target_supplier ON announcements(target_supplier_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_urgent ON announcements(is_urgent);
CREATE INDEX IF NOT EXISTS idx_announcements_scheduled ON announcements(scheduled_date);