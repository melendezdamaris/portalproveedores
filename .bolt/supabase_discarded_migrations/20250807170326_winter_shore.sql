/*
  # Crear tabla de notificaciones

  1. Nueva Tabla
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (text)
      - `titulo` (text)
      - `mensaje` (text)
      - `tipo` (enum: info, success, warning, error)
      - `leida` (boolean)
      - `url_accion` (text, opcional)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `notifications`
    - Políticas: usuarios ven solo sus notificaciones
*/

-- Crear enum para tipo de notificación
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');

-- Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo notification_type NOT NULL DEFAULT 'info',
  leida boolean DEFAULT false,
  url_accion text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios vean solo sus notificaciones
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = current_user_id());

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_leida ON notifications(leida);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);