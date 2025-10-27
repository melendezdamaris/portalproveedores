/*
  # Crear tabla de usuarios del portal

  1. Nueva tabla
    - `portal_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key a auth.users)
      - `full_name` (text)
      - `role` (enum: proveedor, aprobador)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Seguridad
    - Habilitar RLS en `portal_users`
    - Políticas para que usuarios solo vean su propia información
    - Políticas para administradores
*/

-- Crear enum para roles
CREATE TYPE user_role AS ENUM ('proveedor', 'aprobador');

-- Crear tabla portal_users
CREATE TABLE IF NOT EXISTS portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read own profile"
  ON portal_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON portal_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_portal_users_updated_at
  BEFORE UPDATE ON portal_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_portal_users_user_id ON portal_users(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_users_role ON portal_users(role);
CREATE INDEX IF NOT EXISTS idx_portal_users_active ON portal_users(is_active);