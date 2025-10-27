# 🔧 Configuración de Storage para Subida de Archivos

## 📋 Problema

Los proveedores reciben el siguiente error al intentar subir archivos (como la Ficha RUC):

```
Error: Error subiendo archivo RUC: new row violates row-level security policy
```

## 🎯 Causa

El bucket `documentos` en Supabase Storage **NO tiene políticas RLS configuradas**. Cuando no hay políticas, Supabase bloquea todas las operaciones por seguridad.

## ✅ Solución

Debes ejecutar manualmente el archivo SQL que configura las políticas RLS del bucket.

### Pasos para configurar:

1. **Abre el Dashboard de Supabase**
   - Ve a: https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Abre el SQL Editor**
   - En el menú lateral, haz clic en "SQL Editor"
   - Haz clic en "New Query"

3. **Ejecuta el archivo de configuración**
   - Abre el archivo: `supabase/CONFIGURAR_STORAGE_RLS.sql`
   - Copia **TODO** el contenido del archivo
   - Pégalo en el SQL Editor de Supabase
   - Haz clic en "Run" (▶️)

4. **Verifica que se crearon las políticas**
   - Al final del script verás una consulta de verificación
   - Deberías ver **12 políticas creadas**:
     - 4 para Proveedores
     - 2 para Aprobadores
     - 4 para Operaciones

## 📊 Políticas Configuradas

### Para Proveedores:
- ✅ **INSERT**: Pueden subir archivos a `proveedor/`
- ✅ **SELECT**: Pueden leer sus archivos en `proveedor/`
- ✅ **UPDATE**: Pueden actualizar sus archivos
- ✅ **DELETE**: Pueden eliminar sus archivos

### Para Aprobadores:
- ✅ **INSERT**: Pueden subir archivos a `aprobador/` y `proveedor/`
- ✅ **SELECT**: Pueden leer archivos de `aprobador/` y `proveedor/`

### Para Operaciones:
- ✅ **INSERT**: Pueden subir archivos a cualquier carpeta
- ✅ **SELECT**: Pueden leer todos los archivos
- ✅ **UPDATE**: Pueden actualizar cualquier archivo
- ✅ **DELETE**: Pueden eliminar cualquier archivo

## 🔍 Verificar que funcionó

Después de ejecutar el script SQL:

1. Los proveedores podrán subir archivos sin errores
2. El sistema guardará correctamente la Ficha RUC
3. No aparecerá el error de "row-level security policy"

## 🆘 Solución de Problemas

### Error: "policy already exists"
Si ves este error, significa que algunas políticas ya existen. El script las elimina primero, así que puedes ignorar este error.

### Error: "permission denied"
Si ves este error, necesitas:
- Iniciar sesión como administrador del proyecto en Supabase
- Tener permisos de "Service Role" o "Owner"

### Las políticas se crearon pero sigue el error
Verifica que:
1. El usuario esté autenticado correctamente
2. El usuario tenga rol 'proveedor' en la tabla `portal_users`
3. El bucket se llama exactamente `documentos`

## 📝 Estructura de Carpetas

El bucket `documentos` tiene la siguiente estructura:

```
documentos/
├── proveedor/
│   ├── documentos_ruc/
│   ├── facturas/
│   └── entregables/
├── aprobador/
│   └── documentos/
└── operaciones/
    └── documentos/
```

## ✨ Después de Configurar

Una vez configuradas las políticas:

1. ✅ Los proveedores podrán registrarse sin problemas
2. ✅ La Ficha RUC se subirá automáticamente
3. ✅ Los archivos estarán disponibles para las interfaces de Aprobador y Operaciones
4. ✅ El sistema funcionará completamente

---

**Nota**: Esta configuración es necesaria una sola vez. Una vez ejecutada, funcionará para todos los usuarios del sistema.