# 📂 Scripts de Configuración

Esta carpeta contiene scripts útiles para configurar y mantener el Portal de Proveedores.

---

## 🚀 setup-supabase.js

Script interactivo para configurar Supabase desde cero o verificar la configuración existente.

### Uso

```bash
# Verificar configuración actual
node scripts/setup-supabase.js --check

# Configuración guiada paso a paso
node scripts/setup-supabase.js --setup

# Crear/actualizar archivo .env
node scripts/setup-supabase.js --env

# Listar migraciones disponibles
node scripts/setup-supabase.js --migrations

# Mostrar instrucciones de Storage
node scripts/setup-supabase.js --storage

# Mostrar ayuda
node scripts/setup-supabase.js --help
```

### Funcionalidades

- ✅ Verificar configuración de variables de entorno
- ✅ Crear archivo `.env` de forma interactiva
- ✅ Listar todas las migraciones SQL disponibles
- ✅ Mostrar instrucciones de configuración de Storage
- ✅ Asistente de configuración paso a paso
- ✅ Verificación de dependencias

### Ejemplo de Uso

```bash
# Configuración inicial completa
node scripts/setup-supabase.js --setup

# Verificar que todo esté correcto
node scripts/setup-supabase.js --check
```

---

## 📚 Documentación Relacionada

- [Guía de Configuración de Supabase](../GUIA_CONFIGURACION_SUPABASE.md) - Guía completa paso a paso
- [Configuración de Storage](../supabase/CONFIGURAR_STORAGE_RLS.sql) - Script SQL para Storage
- [README de Storage](../supabase/README_STORAGE.md) - Documentación de Storage

---

## 🔧 Requisitos

- Node.js v16 o superior
- Acceso a internet (para crear proyecto Supabase)
- Cuenta en Supabase.com

---

## 🆘 Solución de Problemas

### Error: "Cannot find module"

```bash
# Asegúrate de estar en la raíz del proyecto
cd /path/to/portal-proveedores

# Ejecuta el script con la ruta completa
node scripts/setup-supabase.js --check
```

### Error: "Permission denied"

En Linux/Mac, dale permisos de ejecución:

```bash
chmod +x scripts/setup-supabase.js
./scripts/setup-supabase.js --check
```

---

## 💡 Tips

1. **Primera vez**: Ejecuta `--setup` para configuración guiada
2. **Verificación rápida**: Usa `--check` antes de iniciar el servidor
3. **Problemas de variables**: Ejecuta `--env` para reconfigurar

---

*Última actualización: 2025-11-05*
