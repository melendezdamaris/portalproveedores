# 🏢 Portal de Proveedores - NEO Consulting

Sistema de gestión integral para proveedores, aprobadores y operaciones.

## 📋 Características

- ✅ **Gestión de Proveedores**: Registro, aprobación y administración de proveedores
- ✅ **Facturas y Comprobantes**: Sistema completo de carga y aprobación de documentos
- ✅ **Gestión de Pagos**: Seguimiento y programación de pagos
- ✅ **Roles y Permisos**: Sistema multi-rol (Proveedor, Aprobador, Operaciones)
- ✅ **Almacenamiento Seguro**: Gestión de archivos con políticas de seguridad
- ✅ **Dashboard en Tiempo Real**: Estadísticas y métricas actualizadas

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js v18 o superior
- Cuenta en [Supabase](https://supabase.com)
- Git

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd portalproveedores

# Instalar dependencias
npm install

# Configurar Supabase (asistente interactivo)
node scripts/setup-supabase.js --setup

# O configurar manualmente
# 1. Crear archivo .env con tus credenciales de Supabase
# 2. Ejecutar migraciones en Supabase SQL Editor
# 3. Configurar Storage RLS

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración de Supabase

### Opción 1: Configuración Asistida (Recomendado)

```bash
# Ejecutar script de configuración
node scripts/setup-supabase.js --setup
```

### Opción 2: Configuración Manual

Consulta la [Guía Completa de Configuración](./GUIA_CONFIGURACION_SUPABASE.md) para instrucciones paso a paso.

**Pasos resumidos:**

1. Crear proyecto en Supabase
2. Configurar variables de entorno (.env)
3. Ejecutar migraciones de base de datos
4. Configurar Storage (bucket `documentos`)
5. Crear usuarios de prueba

### Verificar Configuración

```bash
node scripts/setup-supabase.js --check
```

## 📚 Documentación

- **[Guía de Configuración de Supabase](./GUIA_CONFIGURACION_SUPABASE.md)** - Setup completo de Supabase
- **[Análisis de Migración a Firebase](./MIGRACION_FIREBASE.md)** - Análisis y comparación con Firebase
- **[README de Scripts](./scripts/README.md)** - Documentación de scripts de configuración
- **[README de Storage](./supabase/README_STORAGE.md)** - Configuración de almacenamiento

## 🏗️ Estructura del Proyecto

```
portalproveedores/
├── src/
│   ├── components/         # Componentes React
│   ├── contexts/           # Context API (Auth, App)
│   ├── hooks/              # Custom hooks (useSupabase)
│   ├── lib/                # Configuración (Supabase client)
│   └── types/              # TypeScript types
├── supabase/
│   ├── migrations/         # Migraciones SQL (20+ archivos)
│   └── CONFIGURAR_STORAGE_RLS.sql
├── scripts/
│   └── setup-supabase.js   # Script de configuración
├── .env.example            # Plantilla de variables de entorno
└── package.json
```

## 🔐 Roles del Sistema

### 1. Proveedor
- Registrar empresa y cuentas bancarias
- Subir facturas y documentos
- Ver estado de pagos
- Completar encuestas de satisfacción

### 2. Aprobador
- Revisar facturas pendientes
- Aprobar o rechazar documentos
- Ver bandeja de entrada personalizada

### 3. Operaciones
- Gestión completa de proveedores
- Administración de pagos
- Publicar comunicados
- Subir documentos de la empresa
- Acceso a estadísticas globales

## 🗄️ Base de Datos

### Tablas Principales

- `portal_users` - Usuarios del sistema
- `suppliers` - Información de proveedores
- `bank_accounts` - Cuentas bancarias
- `invoices` - Facturas y comprobantes
- `payments` - Registro de pagos
- `company_documents` - Documentos compartidos
- `announcements` - Comunicados
- `feedback_surveys` - Encuestas

### Vistas

- `vw_supplier_dashboard` - Dashboard del proveedor
- `vw_approver_dashboard` - Dashboard del aprobador
- `vw_approver_inbox` - Bandeja de aprobaciones
- `vw_payment_queue` - Cola de pagos

## 🛠️ Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo (Vite)

# Build
npm run build           # Compilar para producción
npm run preview         # Preview del build

# Configuración
node scripts/setup-supabase.js --setup    # Configuración guiada
node scripts/setup-supabase.js --check    # Verificar configuración
node scripts/setup-supabase.js --env      # Crear .env
```

## 🔒 Seguridad

El proyecto utiliza:

- **Row-Level Security (RLS)** en PostgreSQL
- **Políticas de Storage** basadas en roles
- **Autenticación JWT** con Supabase Auth
- **Variables de entorno** para credenciales sensibles

## 🌐 Tecnologías

- **Frontend**: React 18.3 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI**: Tailwind CSS
- **Estado**: Zustand
- **HTTP**: Axios
- **Iconos**: Lucide React

## 📝 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aquí
NODE_ENV=development
```

## 🐛 Solución de Problemas

### Error: "row violates row-level security policy"
- Verifica que las políticas RLS estén configuradas
- Asegúrate de que el usuario tenga rol asignado en `portal_users`

### Error al subir archivos
- Ejecuta `supabase/CONFIGURAR_STORAGE_RLS.sql` en SQL Editor
- Verifica que el bucket `documentos` sea público

### Error: "Failed to fetch"
- Verifica las variables de entorno en `.env`
- Asegúrate de que la URL de Supabase sea correcta

**Para más ayuda**: Consulta [GUIA_CONFIGURACION_SUPABASE.md](./GUIA_CONFIGURACION_SUPABASE.md)

## 📞 Soporte

Para problemas o preguntas, consulta la documentación o abre un issue.

## 📄 Licencia

[Especifica la licencia aquí]

---

**Versión**: 1.0.0
**Última actualización**: 2025-11-05
