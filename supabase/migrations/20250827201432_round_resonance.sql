/*
  # Crear bucket de Storage para documentos

  1. Nuevo Bucket
    - `documentos` - Bucket principal para todos los archivos del sistema
  
  2. Estructura de Carpetas
    - `/proveedor/` - Documentos subidos por proveedores
    - `/aprobador/` - Documentos subidos por aprobadores  
    - `/operaciones/` - Documentos subidos por operaciones
  
  3. Políticas de Seguridad
    - Proveedores pueden subir solo a su carpeta
    - Aprobadores pueden subir solo a su carpeta
    - Operaciones pueden subir a cualquier carpeta
    - Todos pueden leer archivos según sus permisos
*/

-- Crear bucket de storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Proveedores pueden subir archivos a su carpeta
CREATE POLICY "Proveedores pueden subir a su carpeta"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' 
  AND name LIKE 'proveedor/%'
  AND EXISTS (
    SELECT 1 FROM portal_users 
    WHERE user_id = auth.uid() 
    AND role = 'proveedor'
  )
);

-- Política: Aprobadores pueden subir archivos a su carpeta
CREATE POLICY "Aprobadores pueden subir a su carpeta"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos' 
  AND name LIKE 'aprobador/%'
  AND EXISTS (
    SELECT 1 FROM portal_users 
    WHERE user_id = auth.uid() 
    AND role = 'aprobador'
  )
);

-- Política: Operaciones pueden subir archivos a cualquier carpeta
CREATE POLICY "Operaciones pueden subir a cualquier carpeta"
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

-- Política: Usuarios pueden leer archivos según sus permisos
CREATE POLICY "Usuarios pueden leer archivos según permisos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    -- Proveedores pueden leer sus propios archivos
    (name LIKE 'proveedor/%' AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'proveedor'
    ))
    OR
    -- Aprobadores pueden leer archivos de aprobadores y proveedores
    ((name LIKE 'aprobador/%' OR name LIKE 'proveedor/%') AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'aprobador'
    ))
    OR
    -- Operaciones pueden leer todos los archivos
    (EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'operaciones'
    ))
  )
);

-- Política: Usuarios pueden actualizar archivos según sus permisos
CREATE POLICY "Usuarios pueden actualizar sus archivos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    -- Proveedores pueden actualizar sus propios archivos
    (name LIKE 'proveedor/%' AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'proveedor'
    ))
    OR
    -- Aprobadores pueden actualizar sus archivos
    (name LIKE 'aprobador/%' AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'aprobador'
    ))
    OR
    -- Operaciones pueden actualizar todos los archivos
    (EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'operaciones'
    ))
  )
);

-- Política: Usuarios pueden eliminar archivos según sus permisos
CREATE POLICY "Usuarios pueden eliminar sus archivos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos'
  AND (
    -- Proveedores pueden eliminar sus propios archivos
    (name LIKE 'proveedor/%' AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'proveedor'
    ))
    OR
    -- Aprobadores pueden eliminar sus archivos
    (name LIKE 'aprobador/%' AND EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'aprobador'
    ))
    OR
    -- Operaciones pueden eliminar todos los archivos
    (EXISTS (
      SELECT 1 FROM portal_users 
      WHERE user_id = auth.uid() 
      AND role = 'operaciones'
    ))
  )
);