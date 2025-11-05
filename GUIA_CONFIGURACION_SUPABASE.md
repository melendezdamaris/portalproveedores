# 🚀 Guía Completa de Configuración de Supabase

## Portal de Proveedores - NEO Consulting

Esta guía te llevará paso a paso para configurar Supabase desde cero o migrar a una nueva instancia de Supabase.

---

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Crear Proyecto en Supabase](#crear-proyecto-en-supabase)
3. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
4. [Ejecutar Migraciones de Base de Datos](#ejecutar-migraciones-de-base-de-datos)
5. [Configurar Storage (Almacenamiento de Archivos)](#configurar-storage)
6. [Configurar Autenticación](#configurar-autenticación)
7. [Crear Usuarios Iniciales](#crear-usuarios-iniciales)
8. [Verificar Configuración](#verificar-configuración)
9. [Solución de Problemas](#solución-de-problemas)

---

## 1️⃣ Requisitos Previos

Antes de comenzar, asegúrate de tener:

- ✅ Una cuenta en [Supabase](https://supabase.com) (gratis o de pago)
- ✅ Node.js instalado (v18 o superior)
- ✅ Git instalado
- ✅ Acceso al código del proyecto Portal Proveedores

### Instalar Supabase CLI (Opcional pero recomendado)

```bash
npm install -g supabase
```

Verifica la instalación:
```bash
supabase --version
```

---

## 2️⃣ Crear Proyecto en Supabase

### Opción A: Desde la Interfaz Web (Recomendado)

1. **Ir al Dashboard de Supabase**
   - Visita: https://supabase.com/dashboard
   - Inicia sesión o crea una cuenta

2. **Crear Nuevo Proyecto**
   - Haz clic en "New Project"
   - Organización: Selecciona o crea una
   - Nombre del proyecto: `portal-proveedores` (o el nombre que prefieras)
   - Base de datos password: Crea una contraseña segura (¡GUÁRDALA!)
   - Región: Selecciona la más cercana a tus usuarios (ej: South America - São Paulo)
   - Plan: Free o Pro según tus necesidades

3. **Esperar a que se cree el proyecto**
   - Toma aproximadamente 2-3 minutos
   - Supabase creará automáticamente:
     - Base de datos PostgreSQL
     - API REST
     - API Realtime
     - Auth service
     - Storage

### Opción B: Desde CLI

```bash
# Login a Supabase
supabase login

# Inicializar proyecto local
cd /path/to/portal-proveedores
supabase init

# Link con proyecto remoto (si ya existe)
supabase link --project-ref your-project-ref
```

---

## 3️⃣ Configurar Variables de Entorno

### Obtener Credenciales de Supabase

1. En el Dashboard de Supabase, ve a **Settings → API**
2. Copia los siguientes valores:
   - **Project URL**: `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Crear archivo `.env`

En la raíz del proyecto, crea o actualiza el archivo `.env`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxxxx

# Development
NODE_ENV=development
```

**IMPORTANTE**:
- Reemplaza `xxxxxxxxxxxx` con tus valores reales
- NO subas el archivo `.env` a Git (ya está en `.gitignore`)
- Para producción, configura estas variables en tu servicio de hosting

### Crear archivo `.env.example` (para referencia del equipo)

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development
NODE_ENV=development
```

---

## 4️⃣ Ejecutar Migraciones de Base de Datos

El proyecto tiene **20+ archivos de migración** que crean toda la estructura de base de datos.

### Método 1: Usando Supabase CLI (Recomendado)

```bash
# Asegúrate de estar en la raíz del proyecto
cd /path/to/portal-proveedores

# Aplicar todas las migraciones
supabase db push
```

Si recibes un error, intenta:

```bash
# Reset de la base de datos (¡CUIDADO! Esto borra todo)
supabase db reset

# O aplicar migraciones manualmente
supabase db push --include-all
```

### Método 2: Usando SQL Editor (Manual)

Si prefieres hacerlo manualmente o no tienes CLI instalado:

#### Paso 1: Migración Principal

1. Ve a **SQL Editor** en el Dashboard de Supabase
2. Haz clic en **New Query**
3. Abre el archivo: `supabase/migrations/20250808160356_dark_union.sql`
4. Copia **TODO** el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run** (▶️)
7. Espera a que termine (puede tomar 1-2 minutos)

**Resultado esperado:**
- ✅ 9 tablas creadas
- ✅ 4 vistas creadas
- ✅ Políticas RLS configuradas
- ✅ Triggers de timestamp creados
- ✅ Datos de ejemplo insertados

#### Paso 2: Migraciones Adicionales (en orden)

Ejecuta las siguientes migraciones en el orden listado:

```bash
# Lista de migraciones a ejecutar en orden
supabase/migrations/20250826012419_twilight_sun.sql
supabase/migrations/20250826013934_lucky_river.sql
supabase/migrations/20250826013941_peaceful_rice.sql
supabase/migrations/20250826013951_twilight_jungle.sql
supabase/migrations/20250826013959_dusty_portal.sql
supabase/migrations/20250826014010_foggy_truth.sql
supabase/migrations/20250826014016_velvet_dune.sql
supabase/migrations/20250826014023_azure_hill.sql
supabase/migrations/20250826014031_proud_band.sql
supabase/migrations/20250826014043_noisy_leaf.sql
supabase/migrations/20250826014059_gentle_oasis.sql
supabase/migrations/20250826014117_winter_credit.sql
supabase/migrations/20250826020533_small_night.sql
supabase/migrations/20250826021812_late_spark.sql
supabase/migrations/20250826022947_long_block.sql
supabase/migrations/20250826023447_lucky_valley.sql
supabase/migrations/20250826153931_flat_resonance.sql
supabase/migrations/20250826155707_twilight_band.sql
supabase/migrations/20250827201432_round_resonance.sql
```

Para cada archivo:
1. Ábrelo en tu editor
2. Copia el contenido
3. Pega en SQL Editor de Supabase
4. Ejecuta
5. Verifica que no haya errores

### Verificar Tablas Creadas

En el SQL Editor, ejecuta:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deberías ver:**
- `announcements`
- `announcement_attachments`
- `bank_accounts`
- `company_documents`
- `deliverable_files`
- `feedback_surveys`
- `invoices`
- `payments`
- `portal_users`
- `proveedores`
- `suppliers`

### Verificar Vistas Creadas

```sql
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deberías ver:**
- `vw_approver_dashboard`
- `vw_approver_inbox`
- `vw_payment_queue`
- `vw_supplier_dashboard`

---

## 5️⃣ Configurar Storage (Almacenamiento de Archivos)

El storage es **CRÍTICO** para que el sistema funcione. Sin esto, los proveedores no podrán subir archivos.

### Paso 1: Crear Bucket

#### Opción A: Desde la Interfaz Web

1. Ve a **Storage** en el Dashboard
2. Haz clic en **New Bucket**
3. Configuración:
   - Name: `documentos`
   - Public bucket: ✅ (marcado)
   - File size limit: `52428800` (50 MB)
   - Allowed MIME types: Dejar vacío (permite todos)
4. Haz clic en **Create Bucket**

#### Opción B: Desde SQL

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Paso 2: Configurar Políticas RLS del Storage

**ESTE PASO ES OBLIGATORIO**. Sin estas políticas, ningún usuario podrá subir archivos.

1. Ve a **SQL Editor** en Supabase
2. Haz clic en **New Query**
3. Abre el archivo: `supabase/CONFIGURAR_STORAGE_RLS.sql`
4. Copia **TODO** el contenido
5. Pégalo en el SQL Editor
6. Haz clic en **Run** (▶️)

**Resultado esperado:**
```
✅ 12 políticas creadas:
   - 4 para Proveedores (INSERT, SELECT, UPDATE, DELETE)
   - 2 para Aprobadores (INSERT, SELECT)
   - 4 para Operaciones (INSERT, SELECT, UPDATE, DELETE)
   - 2 para lectura general
```

### Verificar Políticas de Storage

```sql
SELECT
  policyname,
  cmd as operacion,
  CASE
    WHEN cmd = 'INSERT' THEN '✅ Subir archivos'
    WHEN cmd = 'SELECT' THEN '✅ Leer archivos'
    WHEN cmd = 'UPDATE' THEN '✅ Actualizar archivos'
    WHEN cmd = 'DELETE' THEN '✅ Eliminar archivos'
    ELSE cmd
  END as descripcion
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND (
  policyname LIKE 'Proveedores:%'
  OR policyname LIKE 'Aprobadores:%'
  OR policyname LIKE 'Operaciones:%'
)
ORDER BY policyname;
```

### Estructura de Carpetas del Storage

El bucket `documentos` debe tener esta estructura:

```
documentos/
├── proveedor/
│   ├── documentos_ruc/      # Fichas RUC de proveedores
│   ├── facturas/             # Facturas PDF
│   └── entregables/          # Archivos entregables
├── aprobador/
│   └── documentos/           # Documentos de aprobadores
└── operaciones/
    └── documentos/           # Documentos de operaciones
```

**Nota**: Las carpetas se crean automáticamente al subir el primer archivo.

---

## 6️⃣ Configurar Autenticación

### Configurar Email Authentication

1. Ve a **Authentication → Settings** en el Dashboard
2. **Email Auth**: Verificar que esté habilitado ✅
3. **Confirm email**: Recomendado deshabilitar para desarrollo (puedes habilitarlo en producción)
4. **Secure email change**: Habilitar ✅
5. **Secure password change**: Habilitar ✅

### Configurar Email Templates (Opcional)

Ve a **Authentication → Email Templates** para personalizar:

- **Confirm signup**: Email de confirmación de registro
- **Reset password**: Email de recuperación de contraseña
- **Magic Link**: Email de login sin contraseña (si lo usas)

### Configurar Site URL (para redirecciones)

1. Ve a **Authentication → URL Configuration**
2. **Site URL**: Agrega tu URL de producción o local:
   - Desarrollo: `http://localhost:5173`
   - Producción: `https://tu-dominio.com`
3. **Redirect URLs**: Agrega las URLs permitidas para redirecciones post-login

---

## 7️⃣ Crear Usuarios Iniciales

### Opción A: Desde SQL (Recomendado para testing)

Ejecuta en SQL Editor:

```sql
-- =====================================================
-- USUARIOS DE PRUEBA
-- =====================================================

-- 1. Usuario Operaciones
-- Email: operaciones@neoconsulting.com
-- Password: (configura en Auth)

-- Primero crear el usuario en Supabase Auth desde la interfaz
-- Luego ejecutar:

INSERT INTO portal_users (user_id, full_name, role, is_active)
VALUES (
  'uuid-del-usuario-creado',  -- Reemplazar con el UUID del usuario creado en Auth
  'María González - Operaciones',
  'operaciones',
  true
);

-- 2. Usuario Aprobador
-- Email: aprobador@neoconsulting.com
-- Password: (configura en Auth)

INSERT INTO portal_users (user_id, full_name, role, is_active)
VALUES (
  'uuid-del-aprobador',  -- Reemplazar con el UUID del usuario creado en Auth
  'Carlos Rodríguez - Aprobador Finanzas',
  'aprobador',
  true
);

-- 3. Usuario Proveedor
-- Email: proveedor@example.com
-- Password: (configura en Auth)

INSERT INTO portal_users (user_id, full_name, role, is_active)
VALUES (
  'uuid-del-proveedor',  -- Reemplazar con el UUID del usuario creado en Auth
  'Juan Pérez - ABC Consulting',
  'proveedor',
  true
);

-- Crear registro de proveedor completo
INSERT INTO suppliers (
  portal_user_id,
  ruc,
  business_name,
  trade_name,
  person_type,
  country,
  address,
  phone,
  email,
  contact_person,
  contact_phone,
  contact_email,
  contracted_service,
  document_type,
  status
) VALUES (
  'uuid-del-proveedor',  -- Mismo UUID del portal_users
  '20123456789',
  'Empresa ABC Sociedad Anónima Cerrada',
  'ABC Consulting',
  'juridica',
  'Perú',
  'Av. Javier Prado Este 123, San Isidro, Lima',
  '+51 987654321',
  'proveedor@example.com',
  'Juan Pérez García',
  '+51 987654321',
  'proveedor@example.com',
  'Consultoría en sistemas y desarrollo de software',
  'factura',
  'approved'
);

-- Agregar cuentas bancarias del proveedor
INSERT INTO bank_accounts (supplier_id, bank_name, account_number, account_type, currency, is_primary)
SELECT
  id,
  'Banco de Crédito del Perú',
  '194-123456789-0-12',
  'corriente',
  'PEN',
  true
FROM suppliers WHERE ruc = '20123456789';

INSERT INTO bank_accounts (supplier_id, bank_name, account_number, account_type, currency, is_primary)
SELECT
  id,
  'Banco Interbank',
  '898-123456789-0-15',
  'corriente',
  'USD',
  false
FROM suppliers WHERE ruc = '20123456789';
```

### Opción B: Crear Usuarios desde la Interfaz

#### Crear Usuario en Authentication

1. Ve a **Authentication → Users** en el Dashboard
2. Haz clic en **Add user → Create new user**
3. Completa los datos:
   - Email: El correo del usuario
   - Password: Contraseña temporal (min 6 caracteres)
   - Email confirm: ✅ (marcar para confirmar automáticamente)
4. Haz clic en **Create User**
5. **COPIA EL UUID** del usuario creado (lo necesitarás)

#### Crear Registro en portal_users

En SQL Editor, ejecuta:

```sql
INSERT INTO portal_users (user_id, full_name, role, is_active)
VALUES (
  'PEGAR-UUID-AQUÍ',
  'Nombre Completo del Usuario',
  'proveedor',  -- O 'aprobador' u 'operaciones'
  true
);
```

#### Si es Proveedor: Crear Registro en suppliers

```sql
INSERT INTO suppliers (
  portal_user_id,
  ruc,
  business_name,
  email,
  contact_person,
  contact_email,
  country,
  address,
  phone,
  document_type,
  status
) VALUES (
  'PEGAR-UUID-AQUÍ',
  'RUC-DEL-PROVEEDOR',
  'Razón Social',
  'email@proveedor.com',
  'Nombre Contacto',
  'email@proveedor.com',
  'Perú',
  'Dirección completa',
  '+51 999999999',
  'factura',
  'approved'
);
```

### Usuarios Recomendados para Testing

| Rol | Email | Password | Descripción |
|-----|-------|----------|-------------|
| Operaciones | `operaciones@neoconsulting.com` | `Neo2024!` | Acceso completo al sistema |
| Aprobador | `aprobador@neoconsulting.com` | `Aprobador2024!` | Puede aprobar/rechazar facturas |
| Proveedor | `proveedor@example.com` | `Proveedor2024!` | Proveedor de ejemplo |

---

## 8️⃣ Verificar Configuración

### Checklist de Verificación

Ejecuta estos comandos en SQL Editor para verificar que todo esté correcto:

#### 1. Verificar Tablas

```sql
SELECT
  COUNT(*) as total_tablas,
  STRING_AGG(table_name, ', ' ORDER BY table_name) as tablas
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE';
```

**Resultado esperado**: `11 tablas` o más

#### 2. Verificar Vistas

```sql
SELECT
  COUNT(*) as total_vistas,
  STRING_AGG(table_name, ', ' ORDER BY table_name) as vistas
FROM information_schema.views
WHERE table_schema = 'public';
```

**Resultado esperado**: `4 vistas`

#### 3. Verificar Políticas RLS

```sql
SELECT
  tablename,
  COUNT(*) as politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

**Resultado esperado**: Cada tabla debe tener al menos 2-4 políticas

#### 4. Verificar Storage Bucket

```sql
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'documentos';
```

**Resultado esperado**: 1 fila con el bucket `documentos`

#### 5. Verificar Políticas de Storage

```sql
SELECT COUNT(*) as total_politicas_storage
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects';
```

**Resultado esperado**: Al menos `12 políticas`

#### 6. Verificar Usuarios

```sql
SELECT
  pu.full_name,
  pu.role,
  pu.is_active,
  pu.created_at
FROM portal_users pu
ORDER BY pu.created_at DESC;
```

**Resultado esperado**: Ver tus usuarios creados

### Test de Integración Completo

```sql
-- Este query verifica toda la estructura
SELECT
  'Tablas' as tipo,
  COUNT(*)::text as cantidad
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'Vistas' as tipo,
  COUNT(*)::text as cantidad
FROM information_schema.views
WHERE table_schema = 'public'

UNION ALL

SELECT
  'Políticas RLS' as tipo,
  COUNT(*)::text as cantidad
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Políticas Storage' as tipo,
  COUNT(*)::text as cantidad
FROM pg_policies
WHERE schemaname = 'storage'

UNION ALL

SELECT
  'Buckets' as tipo,
  COUNT(*)::text as cantidad
FROM storage.buckets

UNION ALL

SELECT
  'Usuarios' as tipo,
  COUNT(*)::text as cantidad
FROM portal_users;
```

**Resultado esperado:**
```
| tipo               | cantidad |
|--------------------|----------|
| Tablas             | 11+      |
| Vistas             | 4        |
| Políticas RLS      | 30+      |
| Políticas Storage  | 12+      |
| Buckets            | 1        |
| Usuarios           | 3+       |
```

---

## 9️⃣ Solución de Problemas

### ❌ Error: "row violates row-level security policy"

**Causa**: Las políticas RLS no están configuradas correctamente.

**Solución**:
1. Ejecuta nuevamente las migraciones
2. Verifica que las políticas se crearon:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'public';
   ```
3. Verifica que el usuario tiene rol asignado en `portal_users`

### ❌ Error: "permission denied for table"

**Causa**: El usuario autenticado no tiene permisos.

**Solución**:
1. Verifica que el usuario esté autenticado correctamente
2. Verifica que exista en `portal_users`:
   ```sql
   SELECT * FROM portal_users WHERE user_id = 'UUID-DEL-USUARIO';
   ```
3. Verifica que el rol sea correcto (`proveedor`, `aprobador`, `operaciones`)

### ❌ Error al subir archivos al Storage

**Causa**: Políticas RLS del storage no configuradas.

**Solución**:
1. Ejecuta el archivo `supabase/CONFIGURAR_STORAGE_RLS.sql`
2. Verifica las políticas:
   ```sql
   SELECT * FROM pg_policies WHERE schemaname = 'storage';
   ```
3. Verifica que el bucket sea público:
   ```sql
   UPDATE storage.buckets SET public = true WHERE id = 'documentos';
   ```

### ❌ Error: "Failed to fetch"

**Causa**: Variables de entorno incorrectas.

**Solución**:
1. Verifica `.env`:
   ```bash
   cat .env
   ```
2. Verifica que las URLs sean correctas en el Dashboard de Supabase
3. Reinicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### ❌ Error: "Invalid JWT token"

**Causa**: Token de autenticación expirado o inválido.

**Solución**:
1. Cierra sesión y vuelve a iniciar
2. Limpia localStorage del navegador:
   ```javascript
   localStorage.clear()
   ```
3. Verifica que la `VITE_SUPABASE_ANON_KEY` sea correcta

### ❌ Error: "relation does not exist"

**Causa**: Tabla o vista no creada.

**Solución**:
1. Verifica que las migraciones se ejecutaron:
   ```sql
   SELECT * FROM information_schema.tables WHERE table_schema = 'public';
   ```
2. Ejecuta nuevamente la migración que crea esa tabla
3. Verifica el orden de las migraciones

### ❌ Las vistas no funcionan

**Causa**: Las vistas dependen de las tablas. Si las tablas se modificaron, las vistas pueden estar desactualizadas.

**Solución**:
```sql
-- Recrear todas las vistas
DROP VIEW IF EXISTS vw_supplier_dashboard CASCADE;
DROP VIEW IF EXISTS vw_approver_dashboard CASCADE;
DROP VIEW IF EXISTS vw_approver_inbox CASCADE;
DROP VIEW IF EXISTS vw_payment_queue CASCADE;

-- Luego ejecuta nuevamente la migración principal
```

---

## 🔄 Migración desde otra instancia de Supabase

Si ya tienes datos en otra instancia de Supabase y quieres migrarlos:

### Paso 1: Exportar Datos

```bash
# Usando Supabase CLI
supabase db dump -f backup.sql --data-only

# O desde pgAdmin / SQL Editor
pg_dump --data-only --host=db.xxxx.supabase.co --username=postgres --dbname=postgres > backup.sql
```

### Paso 2: Crear Estructura en Nueva Instancia

1. Ejecuta todas las migraciones (Paso 4)
2. Configura Storage (Paso 5)

### Paso 3: Importar Datos

```bash
# Usando Supabase CLI
supabase db push --include-all --file backup.sql

# O desde SQL Editor
# Copia el contenido de backup.sql y ejecútalo
```

### Paso 4: Migrar Archivos del Storage

**No hay comando directo, debes hacerlo manualmente:**

1. Descarga todos los archivos de la instancia antigua
2. Súbelos a la nueva instancia usando:
   - La interfaz web de Storage
   - O el SDK de Supabase con un script

**Script ejemplo para migrar archivos:**

```typescript
import { createClient } from '@supabase/supabase-js';

// Instancia antigua
const oldSupabase = createClient(
  'https://old-project.supabase.co',
  'old-anon-key'
);

// Instancia nueva
const newSupabase = createClient(
  'https://new-project.supabase.co',
  'new-anon-key'
);

async function migrateFiles() {
  // Listar archivos de la instancia antigua
  const { data: files } = await oldSupabase.storage
    .from('documentos')
    .list();

  for (const file of files) {
    // Descargar archivo
    const { data: fileData } = await oldSupabase.storage
      .from('documentos')
      .download(file.name);

    // Subir a nueva instancia
    await newSupabase.storage
      .from('documentos')
      .upload(file.name, fileData);
  }
}

migrateFiles();
```

---

## 📊 Resumen de Comandos Importantes

### Verificar Estado Completo

```sql
-- Ejecuta este query para ver el estado completo del sistema
SELECT 'Base de datos configurada correctamente' as mensaje
WHERE (
  -- Verificar tablas
  (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') >= 11
  AND
  -- Verificar vistas
  (SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public') >= 4
  AND
  -- Verificar políticas
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 20
  AND
  -- Verificar storage
  (SELECT COUNT(*) FROM storage.buckets WHERE id = 'documentos') = 1
  AND
  -- Verificar políticas storage
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'storage') >= 12
);
```

Si este query devuelve `Base de datos configurada correctamente`, ¡todo está listo! 🎉

---

## 🎯 Próximos Pasos

Una vez completada la configuración:

1. ✅ **Iniciar el proyecto**
   ```bash
   npm install
   npm run dev
   ```

2. ✅ **Probar login** con los usuarios creados

3. ✅ **Probar subida de archivos** como proveedor

4. ✅ **Verificar roles** (proveedor, aprobador, operaciones)

5. ✅ **Probar flujo completo**:
   - Proveedor sube factura
   - Aprobador revisa y aprueba
   - Operaciones programa pago

---

## 📞 Soporte

Si tienes problemas:

1. **Revisa la sección "Solución de Problemas"** arriba
2. **Consulta la documentación de Supabase**: https://supabase.com/docs
3. **Revisa los logs de Supabase**: Dashboard → Logs
4. **Verifica el código en**: `src/lib/supabase.ts`

---

## ✅ Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Migración principal ejecutada (tablas creadas)
- [ ] Todas las migraciones adicionales ejecutadas
- [ ] Bucket `documentos` creado
- [ ] Políticas RLS de Storage configuradas
- [ ] Autenticación configurada
- [ ] Al menos 3 usuarios de prueba creados (operaciones, aprobador, proveedor)
- [ ] Todas las verificaciones SQL ejecutadas con éxito
- [ ] Aplicación local ejecutándose sin errores
- [ ] Login funciona correctamente
- [ ] Subida de archivos funciona

**Si todos los ítems están marcados, ¡tu configuración está completa!** 🎉

---

*Documento generado: 2025-11-05*
*Versión: 1.0*
*Proyecto: Portal de Proveedores - NEO Consulting*
