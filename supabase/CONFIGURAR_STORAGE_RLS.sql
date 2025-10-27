/*
  =====================================================
  INSTRUCCIONES PARA CONFIGURAR POLÍTICAS RLS DE STORAGE
  =====================================================

  Este archivo contiene los comandos SQL que deben ejecutarse MANUALMENTE
  en el SQL Editor de Supabase para configurar las políticas de seguridad
  del bucket 'documentos'.

  IMPORTANTE: Estos comandos deben ejecutarse con permisos de administrador
  desde la interfaz web de Supabase (SQL Editor).

  Pasos:
  1. Ir a: https://supabase.com/dashboard
  2. Seleccionar tu proyecto
  3. Ir a "SQL Editor"
  4. Copiar y pegar TODO el contenido de este archivo
  5. Ejecutar
*/

-- =====================================================
-- PASO 1: VERIFICAR Y LIMPIAR POLÍTICAS EXISTENTES
-- =====================================================

-- Eliminar políticas anteriores si existen
DROP POLICY IF EXISTS "Proveedores pueden subir a su carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Aprobadores pueden subir a su carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Operaciones pueden subir a cualquier carpeta" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden leer archivos según permisos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar sus archivos" ON storage.objects;
DROP POLICY IF EXISTS "Proveedores autenticados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Aprobadores autenticados pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Operaciones autenticadas pueden subir archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden leer archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar archivos" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar archivos" ON storage.objects;

-- =====================================================
-- PASO 2: VERIFICAR QUE EL BUCKET EXISTE
-- =====================================================

-- Asegurar que el bucket 'documentos' existe y es público
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================================================
-- PASO 3: CREAR POLÍTICAS PERMISIVAS PARA PROVEEDORES
-- =====================================================

-- Política INSERT: Proveedores autenticados pueden subir archivos a carpeta proveedor/
CREATE POLICY "Proveedores: INSERT archivos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND name LIKE 'proveedor/%'
);

-- Política SELECT: Proveedores autenticados pueden leer archivos de carpeta proveedor/
CREATE POLICY "Proveedores: SELECT archivos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND name LIKE 'proveedor/%'
);

-- Política UPDATE: Proveedores autenticados pueden actualizar archivos de carpeta proveedor/
CREATE POLICY "Proveedores: UPDATE archivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND name LIKE 'proveedor/%'
)
WITH CHECK (
  bucket_id = 'documentos'
  AND name LIKE 'proveedor/%'
);

-- Política DELETE: Proveedores autenticados pueden eliminar archivos de carpeta proveedor/
CREATE POLICY "Proveedores: DELETE archivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND name LIKE 'proveedor/%'
);

-- =====================================================
-- PASO 4: CREAR POLÍTICAS PARA APROBADORES
-- =====================================================

-- Política INSERT: Aprobadores pueden subir a carpeta aprobador/
CREATE POLICY "Aprobadores: INSERT archivos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND (name LIKE 'aprobador/%' OR name LIKE 'proveedor/%')
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'aprobador'
  )
);

-- Política SELECT: Aprobadores pueden leer archivos de aprobador/ y proveedor/
CREATE POLICY "Aprobadores: SELECT archivos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND (name LIKE 'aprobador/%' OR name LIKE 'proveedor/%')
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'aprobador'
  )
);

-- =====================================================
-- PASO 5: CREAR POLÍTICAS PARA OPERACIONES
-- =====================================================

-- Política INSERT: Operaciones pueden subir a cualquier carpeta
CREATE POLICY "Operaciones: INSERT archivos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'operaciones'
  )
);

-- Política SELECT: Operaciones pueden leer todos los archivos
CREATE POLICY "Operaciones: SELECT archivos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'operaciones'
  )
);

-- Política UPDATE: Operaciones pueden actualizar cualquier archivo
CREATE POLICY "Operaciones: UPDATE archivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'operaciones'
  )
)
WITH CHECK (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'operaciones'
  )
);

-- Política DELETE: Operaciones pueden eliminar cualquier archivo
CREATE POLICY "Operaciones: DELETE archivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND EXISTS (
    SELECT 1 FROM portal_users
    WHERE user_id = auth.uid()
    AND role = 'operaciones'
  )
);

-- =====================================================
-- PASO 6: VERIFICAR POLÍTICAS CREADAS
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT
  policyname,
  cmd,
  CASE
    WHEN cmd = 'INSERT' THEN 'Subir archivos'
    WHEN cmd = 'SELECT' THEN 'Leer archivos'
    WHEN cmd = 'UPDATE' THEN 'Actualizar archivos'
    WHEN cmd = 'DELETE' THEN 'Eliminar archivos'
    ELSE cmd
  END as accion
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE 'Proveedores:%'
   OR policyname LIKE 'Aprobadores:%'
   OR policyname LIKE 'Operaciones:%'
ORDER BY policyname;

-- =====================================================
-- RESULTADO ESPERADO
-- =====================================================
-- Deberías ver 12 políticas creadas:
-- - 4 para Proveedores (INSERT, SELECT, UPDATE, DELETE)
-- - 2 para Aprobadores (INSERT, SELECT)
-- - 4 para Operaciones (INSERT, SELECT, UPDATE, DELETE)
--
-- Si ves las 12 políticas, ¡la configuración está completa!
-- =====================================================