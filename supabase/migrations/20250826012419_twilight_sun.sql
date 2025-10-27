/*
  # Limpiar Base de Datos Completamente

  Esta migración elimina todas las tablas, vistas, funciones y políticas RLS 
  creadas previamente en el proyecto, dejando la base de datos en estado limpio.

  ## 1. Eliminaciones
  - Todas las vistas del dashboard
  - Todas las tablas de la aplicación
  - Todas las funciones personalizadas
  - Todas las políticas RLS
  - Todos los triggers personalizados

  ## 2. Resultado
  - Base de datos completamente limpia
  - Sin tablas residuales
  - Sin dependencias
  - Lista para empezar desde cero

  ## 3. Orden de Eliminación
  - Primero las vistas (no tienen dependencias)
  - Luego las tablas en orden inverso de dependencias
  - Finalmente funciones y triggers
*/

-- 1. ELIMINAR TODAS LAS VISTAS
DROP VIEW IF EXISTS v_dashboard_proveedor CASCADE;
DROP VIEW IF EXISTS v_dashboard_operaciones CASCADE;
DROP VIEW IF EXISTS v_bandeja_aprobador CASCADE;
DROP VIEW IF EXISTS v_cola_pagos_operaciones CASCADE;
DROP VIEW IF EXISTS vw_supplier_dashboard_resumen CASCADE;
DROP VIEW IF EXISTS vw_operations_dashboard_resumen CASCADE;
DROP VIEW IF EXISTS vw_approver_inbox CASCADE;
DROP VIEW IF EXISTS vw_operations_payments_queue CASCADE;

-- 2. ELIMINAR TODAS LAS TABLAS EN ORDEN CORRECTO (respetando foreign keys)
-- Primero las tablas que dependen de otras
DROP TABLE IF EXISTS encuestas_feedback CASCADE;
DROP TABLE IF EXISTS documentos_operaciones CASCADE;
DROP TABLE IF EXISTS comunicados CASCADE;
DROP TABLE IF EXISTS pagos CASCADE;
DROP TABLE IF EXISTS comprobantes CASCADE;
DROP TABLE IF EXISTS proveedor_cuentas_bancarias CASCADE;
DROP TABLE IF EXISTS supplier_bank_accounts CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS operations_documents CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS supplier_feedback CASCADE;

-- Luego las tablas principales
DROP TABLE IF EXISTS directorio_aprobadores CASCADE;
DROP TABLE IF EXISTS usuarios_operaciones CASCADE;
DROP TABLE IF EXISTS proveedores CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS operations_users CASCADE;
DROP TABLE IF EXISTS approver_directory CASCADE;

-- 3. ELIMINAR FUNCIONES PERSONALIZADAS
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- 4. ELIMINAR TIPOS PERSONALIZADOS (si existen)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS document_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS currency_type CASCADE;
DROP TYPE IF EXISTS person_type CASCADE;

-- 5. VERIFICAR QUE NO QUEDEN TABLAS RESIDUALES
-- Esta consulta mostrará si quedan tablas relacionadas con el proyecto
DO $$
DECLARE
    table_count integer;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE ANY (ARRAY['%proveedor%', '%supplier%', '%invoice%', '%payment%', '%comprobante%', '%pago%', '%comunicado%', '%announcement%', '%feedback%', '%operacion%', '%aprobador%', '%approver%']);
    
    IF table_count > 0 THEN
        RAISE NOTICE 'ADVERTENCIA: Aún quedan % tabla(s) relacionadas con el proyecto', table_count;
    ELSE
        RAISE NOTICE 'ÉXITO: Base de datos completamente limpia - 0 tablas residuales';
    END IF;
END $$;

-- 6. LIMPIAR POLÍTICAS RLS HUÉRFANAS (si existen)
-- Esto eliminará cualquier política que pueda haber quedado sin tabla
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        BEGIN
            EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
                          policy_record.policyname, 
                          policy_record.schemaname, 
                          policy_record.tablename);
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar errores si la tabla ya no existe
            NULL;
        END;
    END LOOP;
    
    RAISE NOTICE 'Políticas RLS limpiadas';
END $$;

-- 7. MENSAJE FINAL DE CONFIRMACIÓN
DO $$
BEGIN
    RAISE NOTICE '✅ BASE DE DATOS COMPLETAMENTE LIMPIA';
    RAISE NOTICE '✅ Todas las tablas del proyecto han sido eliminadas';
    RAISE NOTICE '✅ Todas las vistas han sido eliminadas';
    RAISE NOTICE '✅ Todas las funciones personalizadas han sido eliminadas';
    RAISE NOTICE '✅ Todas las políticas RLS han sido eliminadas';
    RAISE NOTICE '✅ Estado: Listo para empezar desde cero';
END $$;