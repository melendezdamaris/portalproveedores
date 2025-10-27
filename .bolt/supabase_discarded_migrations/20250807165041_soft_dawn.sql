/*
  # Crear tabla de notificaciones

  1. Nueva Tabla
    - `notifications` (notificaciones)
      - `id` (uuid, primary key)
      - `user_id` (uuid, referencia al usuario)
      - `title` (text, título de la notificación)
      - `message` (text, mensaje)
      - `notification_type` (text, tipo de notificación)
      - `is_read` (boolean, leída)
      - `action_url` (text, URL de acción)
      - `created_at` (timestamp)

  2. Seguridad
    - Enable RLS on `notifications` table
    - Add policies for user notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  notification_type text DEFAULT 'info' CHECK (notification_type IN ('info', 'success', 'warning', 'error')),
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Política para usuarios: pueden actualizar sus propias notificaciones
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Política para el sistema: puede crear notificaciones
CREATE POLICY "System can create notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);