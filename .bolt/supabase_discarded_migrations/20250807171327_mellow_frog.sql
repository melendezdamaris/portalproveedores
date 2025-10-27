/*
  # Crear tabla de comunicados

  1. Nueva Tabla
    - `announcements`
      - Comunicados creados por perfil operaciones
      - Visibles en perfil proveedores según targeting
      - Tipos: info, warning, success
      - Targeting por rol o proveedor específico
  
  2. Seguridad
    - Habilitar RLS en tabla `announcements`
    - Política para que proveedores vean comunicados dirigidos a ellos
    - Política para que operaciones gestione todos los comunicados
*/

CREATE TABLE IF NOT EXISTS announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenido del comunicado
  titulo text NOT NULL,
  contenido text NOT NULL,
  tipo_comunicado text NOT NULL DEFAULT 'info' CHECK (tipo_comunicado IN ('info', 'warning', 'success')),
  
  -- Targeting
  rol_objetivo text CHECK (rol_objetivo IN ('all', 'proveedor', 'operaciones', 'aprobador')),
  proveedor_objetivo_id uuid REFERENCES suppliers(id),
  
  -- Configuración
  es_urgente boolean DEFAULT false,
  fecha_programada timestamptz,
  archivos_adjuntos jsonb DEFAULT '[]'::jsonb, -- Array de objetos con {name, url, type}
  
  -- Estado y auditoría
  es_activo boolean DEFAULT true,
  creado_por text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Política para proveedores: ven comunicados dirigidos a ellos
CREATE POLICY "Proveedores pueden ver comunicados relevantes"
  ON announcements
  FOR SELECT
  TO authenticated
  USING (
    es_activo = true AND
    (
      rol_objetivo = 'all' OR
      rol_objetivo = 'proveedor' OR
      (
        proveedor_objetivo_id IS NOT NULL AND
        EXISTS (
          SELECT 1 FROM suppliers 
          WHERE suppliers.id = announcements.proveedor_objetivo_id 
          AND suppliers.id = auth.uid()::text
        )
      )
    )
  );

-- Política para operaciones: pueden gestionar todos los comunicados
CREATE POLICY "Operaciones pueden gestionar comunicados"
  ON announcements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'operaciones'
    )
  );

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_announcements_target_role ON announcements(rol_objetivo);
CREATE INDEX IF NOT EXISTS idx_announcements_target_supplier ON announcements(proveedor_objetivo_id);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(es_activo);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at DESC);