/*
  # Crear tabla de comunicados

  1. Nueva Tabla
    - `announcements`
      - `id` (uuid, primary key)
      - `titulo` (text)
      - `contenido` (text)
      - `tipo_comunicado` (enum: info, warning, success)
      - `audiencia` (enum: all, proveedor, operaciones, aprobador)
      - `proveedor_especifico` (uuid, opcional)
      - `fecha_publicacion` (timestamp)
      - `es_urgente` (boolean)
      - `archivos_adjuntos` (jsonb array)
      - `creado_por` (text)
      - `activo` (boolean)
      - `created_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `announcements`
    - Políticas: operaciones pueden crear, todos pueden ver según audiencia
*/

-- Crear enum para tipo de comunicado
CREATE TYPE announcement_type AS ENUM ('info', 'warning', 'success');

-- Crear enum para audiencia
CREATE TYPE audience_type AS ENUM ('all', 'proveedor', 'operaciones', 'aprobador');

-- Crear tabla de comunicados
CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  contenido text NOT NULL,
  tipo_comunicado announcement_type NOT NULL DEFAULT 'info',
  audiencia audience_type NOT NULL DEFAULT 'all',
  proveedor_especifico uuid REFERENCES suppliers(id) ON DELETE SET NULL,
  fecha_publicacion timestamptz DEFAULT now(),
  es_urgente boolean DEFAULT false,
  archivos_adjuntos jsonb DEFAULT '[]'::jsonb, -- Array de objetos con {name, url, type}
  creado_por text NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Política para proveedores (ver comunicados dirigidos a ellos)
CREATE POLICY "Proveedores pueden ver comunicados dirigidos a ellos"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    activo = true AND
    fecha_publicacion <= now() AND
    (
      audiencia = 'all' OR
      audiencia = 'proveedor' OR
      (proveedor_especifico IN (
        SELECT id FROM suppliers WHERE user_id = current_user_id()
      ))
    )
  );

-- Política para operaciones (crear y gestionar)
CREATE POLICY "Operaciones pueden gestionar comunicados"
  ON announcements
  FOR ALL
  TO authenticated
  USING (current_user_role() = 'operaciones');

-- Política para aprobadores (ver comunicados dirigidos a ellos)
CREATE POLICY "Aprobadores pueden ver comunicados dirigidos a ellos"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    current_user_role() = 'aprobador' AND
    activo = true AND
    fecha_publicacion <= now() AND
    (audiencia = 'all' OR audiencia = 'aprobador')
  );

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_announcements_audiencia ON announcements(audiencia);
CREATE INDEX IF NOT EXISTS idx_announcements_activo ON announcements(activo);
CREATE INDEX IF NOT EXISTS idx_announcements_fecha ON announcements(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_proveedor ON announcements(proveedor_especifico);