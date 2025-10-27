/*
  # Crear tabla de archivos adjuntos de comunicados

  1. Nueva tabla
    - `announcement_attachments`
      - `id` (uuid, primary key)
      - `announcement_id` (uuid, foreign key a announcements)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS
    - Políticas apropiadas
*/

-- Crear tabla announcement_attachments
CREATE TABLE IF NOT EXISTS announcement_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid REFERENCES announcements(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE announcement_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read attachments for announcements they can see"
  ON announcement_attachments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM announcements a
      WHERE a.id = announcement_attachments.announcement_id
      AND (
        -- Announcements for all
        (a.is_active = true AND a.target_role = 'all' AND (a.scheduled_date IS NULL OR a.scheduled_date <= now()))
        OR
        -- Announcements for suppliers
        (a.is_active = true AND a.target_role = 'proveedor' AND (a.scheduled_date IS NULL OR a.scheduled_date <= now()) AND
         EXISTS (SELECT 1 FROM portal_users WHERE portal_users.user_id = auth.uid() AND portal_users.role = 'proveedor'))
        OR
        -- Announcements for approvers
        (a.is_active = true AND a.target_role = 'aprobador' AND (a.scheduled_date IS NULL OR a.scheduled_date <= now()) AND
         EXISTS (SELECT 1 FROM portal_users WHERE portal_users.user_id = auth.uid() AND portal_users.role = 'aprobador'))
        OR
        -- Announcements targeted to specific supplier
        (a.is_active = true AND (a.scheduled_date IS NULL OR a.scheduled_date <= now()) AND
         EXISTS (SELECT 1 FROM suppliers s JOIN portal_users pu ON s.portal_user_id = pu.id
                 WHERE s.id = a.target_supplier_id AND pu.user_id = auth.uid()))
      )
    )
  );

CREATE POLICY "Approvers can manage all announcement attachments"
  ON announcement_attachments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- Índices
CREATE INDEX IF NOT EXISTS idx_announcement_attachments_announcement_id ON announcement_attachments(announcement_id);