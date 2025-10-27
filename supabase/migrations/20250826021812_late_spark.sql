/*
  # Agregar rol 'operaciones' al enum user_role

  1. Modificaciones
    - Agregar valor 'operaciones' al enum user_role existente
    - Mantener valores existentes: 'proveedor', 'aprobador'
    
  2. Seguridad
    - No se requieren cambios en RLS ya que las políticas existentes seguirán funcionando
    - El nuevo rol tendrá los mismos permisos base que los otros roles
*/

-- Agregar el nuevo valor 'operaciones' al enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operaciones';

-- Verificar que el enum ahora incluye los tres valores
DO $$
BEGIN
  -- Verificar que el enum tiene los valores esperados
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'operaciones'
  ) THEN
    RAISE EXCEPTION 'Failed to add operaciones role to user_role enum';
  END IF;
  
  RAISE NOTICE 'Successfully added operaciones role to user_role enum';
END $$;