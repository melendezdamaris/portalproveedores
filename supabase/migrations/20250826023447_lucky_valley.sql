/*
  # Permitir que usuarios autenticados creen sus propios registros

  1. Políticas Actualizadas
    - `portal_users`: Usuarios pueden crear su propio perfil
    - `suppliers`: Usuarios pueden crear su registro de proveedor
    - `invoices`: Usuarios pueden crear sus propias facturas
    - `bank_accounts`: Usuarios pueden crear sus cuentas bancarias
    - `feedback_surveys`: Usuarios pueden crear su feedback
    - `announcements`: Solo aprobadores pueden crear comunicados (sin cambios)
    - `company_documents`: Solo aprobadores pueden crear documentos (sin cambios)

  2. Seguridad
    - Se mantiene RLS habilitado en todas las tablas
    - Los usuarios solo pueden crear registros asociados a su user_id
    - Se preservan las políticas de lectura y actualización existentes
    - Se agregan validaciones para asegurar que los usuarios solo creen sus propios datos

  3. Validaciones
    - En portal_users: user_id debe coincidir con auth.uid()
    - En suppliers: portal_user_id debe ser del usuario autenticado
    - En invoices: supplier_id debe pertenecer al usuario autenticado
    - En bank_accounts: supplier_id debe pertenecer al usuario autenticado
    - En feedback_surveys: supplier_id debe pertenecer al usuario autenticado
*/

-- ✅ POLÍTICA 1: Permitir que usuarios creen su propio perfil en portal_users
CREATE POLICY "Users can create own profile"
  ON portal_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ✅ POLÍTICA 2: Permitir que usuarios creen su registro de proveedor
CREATE POLICY "Users can create own supplier record"
  ON suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users 
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.id = suppliers.portal_user_id
    )
  );

-- ✅ POLÍTICA 3: Permitir que usuarios creen sus propias facturas
CREATE POLICY "Users can create own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = invoices.supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

-- ✅ POLÍTICA 4: Permitir que usuarios creen sus cuentas bancarias
CREATE POLICY "Users can create own bank accounts"
  ON bank_accounts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = bank_accounts.supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

-- ✅ POLÍTICA 5: Permitir que usuarios creen su feedback
CREATE POLICY "Users can create own feedback"
  ON feedback_surveys
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM suppliers s
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE s.id = feedback_surveys.supplier_id 
      AND pu.user_id = auth.uid()
    )
  );

-- ✅ POLÍTICA 6: Permitir que usuarios creen archivos de entregables para sus facturas
CREATE POLICY "Users can create deliverable files for own invoices"
  ON deliverable_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i
      JOIN suppliers s ON i.supplier_id = s.id
      JOIN portal_users pu ON s.portal_user_id = pu.id
      WHERE i.id = deliverable_files.invoice_id 
      AND pu.user_id = auth.uid()
    )
  );

-- ✅ POLÍTICA 7: Permitir que usuarios creen archivos adjuntos para comunicados (solo aprobadores)
CREATE POLICY "Approvers can create announcement attachments"
  ON announcement_attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portal_users
      WHERE portal_users.user_id = auth.uid() 
      AND portal_users.role = 'aprobador'
    )
  );

-- ✅ VERIFICACIÓN: Confirmar que las políticas se crearon correctamente
DO $$
BEGIN
  -- Verificar políticas en portal_users
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'portal_users' 
    AND policyname = 'Users can create own profile'
  ) THEN
    RAISE NOTICE '✅ Política de creación en portal_users creada correctamente';
  END IF;

  -- Verificar políticas en suppliers
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'suppliers' 
    AND policyname = 'Users can create own supplier record'
  ) THEN
    RAISE NOTICE '✅ Política de creación en suppliers creada correctamente';
  END IF;

  -- Verificar políticas en invoices
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'invoices' 
    AND policyname = 'Users can create own invoices'
  ) THEN
    RAISE NOTICE '✅ Política de creación en invoices creada correctamente';
  END IF;

  -- Verificar políticas en bank_accounts
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'bank_accounts' 
    AND policyname = 'Users can create own bank accounts'
  ) THEN
    RAISE NOTICE '✅ Política de creación en bank_accounts creada correctamente';
  END IF;

  -- Verificar políticas en feedback_surveys
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'feedback_surveys' 
    AND policyname = 'Users can create own feedback'
  ) THEN
    RAISE NOTICE '✅ Política de creación en feedback_surveys creada correctamente';
  END IF;

  RAISE NOTICE '🎯 Migración completada: Usuarios autenticados pueden crear sus propios registros';
END $$;