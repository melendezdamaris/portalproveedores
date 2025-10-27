/*
  # Crear tabla de notificaciones

  1. Nueva Tabla
    - `notifications`
      - Sistema de notificaciones para todos los usuarios
      - Tipos: info, success, warning, error
      - Estado de lectura y URLs de acción
  
  2. Seguridad
    - Habilitar RLS en tabla `notifications`
    - Política para que usuarios vean solo sus notificaciones
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Usuario destinatario
  user_id text NOT NULL, -- Puede ser supplier_id o user_id según el contexto
  
  -- Contenido de la notificación
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo_notificacion text NOT NULL DEFAULT 'info' CHECK (tipo_notificacion IN ('info', 'success', 'warning', 'error')),
  
  -- Estado y acción
  es_leida boolean DEFAULT false,
  url_accion text, -- URL para redirigir al hacer clic
  
  -- Auditoría
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: solo ven sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus propias notificaciones"
  ON notifications
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid()::text);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, es_leida) WHERE es_leida = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);