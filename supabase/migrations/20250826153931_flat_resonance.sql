/*
  # Agregar política RLS para operaciones en portal_users

  1. Nuevas Políticas
    - Permitir a usuarios con rol 'operaciones' insertar nuevos registros en portal_users
    - Esto resuelve el error "new row violates row-level security policy"

  2. Seguridad
    - Solo usuarios autenticados con rol 'operaciones' pueden crear nuevos usuarios
    - Mantiene la seguridad mientras permite la funcionalidad requerida
*/

-- Crear política para permitir a usuarios con rol 'operaciones' insertar en portal_users
CREATE POLICY "Operations users can create new portal users"
  ON portal_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'operaciones'
    )
  );