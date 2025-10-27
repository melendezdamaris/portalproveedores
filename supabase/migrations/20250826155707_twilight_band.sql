/*
  # Crear tabla proveedores

  1. Nueva Tabla
    - `proveedores`
      - `id` (uuid, primary key)
      - `ruc` (text, unique)
      - `razon_social` (text)
      - `nombre_comercial` (text, nullable)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en tabla `proveedores`
    - Agregar políticas para usuarios de operaciones
    - Agregar políticas para lectura de proveedores
*/

CREATE TABLE IF NOT EXISTS proveedores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ruc text UNIQUE NOT NULL,
  razon_social text NOT NULL,
  nombre_comercial text,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

-- Política para que usuarios de operaciones puedan gestionar todos los proveedores
CREATE POLICY "Operations users can manage all proveedores"
  ON proveedores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.user_id = auth.uid()
      AND portal_users.role = 'operaciones'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.user_id = auth.uid()
      AND portal_users.role = 'operaciones'
    )
  );

-- Política para que todos los usuarios autenticados puedan leer proveedores
CREATE POLICY "Authenticated users can read proveedores"
  ON proveedores
  FOR SELECT
  TO authenticated
  USING (true);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_proveedores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_proveedores_updated_at
  BEFORE UPDATE ON proveedores
  FOR EACH ROW
  EXECUTE FUNCTION update_proveedores_updated_at();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_proveedores_ruc ON proveedores(ruc);
CREATE INDEX IF NOT EXISTS idx_proveedores_email ON proveedores(email);
CREATE INDEX IF NOT EXISTS idx_proveedores_created_at ON proveedores(created_at);