#!/usr/bin/env node

/**
 * Script de Configuración Automática de Supabase
 * Portal de Proveedores - NEO Consulting
 *
 * Este script ayuda a verificar y configurar Supabase automáticamente
 *
 * Uso:
 *   node scripts/setup-supabase.js --check     # Verificar configuración
 *   node scripts/setup-supabase.js --setup     # Configuración guiada
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logHeader(message) {
  log(`\n${'='.repeat(60)}`, 'bright');
  log(message, 'bright');
  log(`${'='.repeat(60)}`, 'bright');
}

// Función para leer input del usuario
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, answer => {
    rl.close();
    resolve(answer);
  }));
}

// Verificar si el archivo .env existe
function checkEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  return fs.existsSync(envPath);
}

// Leer variables de entorno
function readEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

// Verificar configuración de Supabase
async function checkSupabaseConfig() {
  logHeader('🔍 VERIFICANDO CONFIGURACIÓN DE SUPABASE');

  let issuesFound = 0;

  // 1. Verificar archivo .env
  if (!checkEnvFile()) {
    logError('Archivo .env no encontrado');
    logInfo('Crea un archivo .env en la raíz del proyecto');
    issuesFound++;
  } else {
    logSuccess('Archivo .env encontrado');

    const envVars = readEnvFile();

    // Verificar VITE_SUPABASE_URL
    if (!envVars.VITE_SUPABASE_URL || envVars.VITE_SUPABASE_URL === 'your_supabase_project_url') {
      logError('VITE_SUPABASE_URL no configurada correctamente');
      logInfo('Obtén tu URL en: Dashboard de Supabase → Settings → API');
      issuesFound++;
    } else if (!envVars.VITE_SUPABASE_URL.includes('supabase.co')) {
      logWarning('VITE_SUPABASE_URL no parece ser válida');
      issuesFound++;
    } else {
      logSuccess('VITE_SUPABASE_URL configurada');
    }

    // Verificar VITE_SUPABASE_ANON_KEY
    if (!envVars.VITE_SUPABASE_ANON_KEY || envVars.VITE_SUPABASE_ANON_KEY === 'your_supabase_anon_key') {
      logError('VITE_SUPABASE_ANON_KEY no configurada correctamente');
      logInfo('Obtén tu key en: Dashboard de Supabase → Settings → API');
      issuesFound++;
    } else if (envVars.VITE_SUPABASE_ANON_KEY.length < 100) {
      logWarning('VITE_SUPABASE_ANON_KEY parece ser muy corta (debería ser un JWT)');
      issuesFound++;
    } else {
      logSuccess('VITE_SUPABASE_ANON_KEY configurada');
    }
  }

  // 2. Verificar carpeta de migraciones
  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');
  if (!fs.existsSync(migrationsPath)) {
    logError('Carpeta de migraciones no encontrada');
    issuesFound++;
  } else {
    const migrations = fs.readdirSync(migrationsPath).filter(f => f.endsWith('.sql'));
    logSuccess(`Carpeta de migraciones encontrada (${migrations.length} archivos)`);
  }

  // 3. Verificar archivo de configuración de Storage
  const storageRlsPath = path.join(__dirname, '..', 'supabase', 'CONFIGURAR_STORAGE_RLS.sql');
  if (!fs.existsSync(storageRlsPath)) {
    logError('Archivo de configuración de Storage no encontrado');
    issuesFound++;
  } else {
    logSuccess('Archivo de configuración de Storage encontrado');
  }

  // 4. Verificar package.json
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    if (packageJson.dependencies && packageJson.dependencies['@supabase/supabase-js']) {
      logSuccess(`Supabase JS client instalado (v${packageJson.dependencies['@supabase/supabase-js']})`);
    } else {
      logError('Supabase JS client no instalado');
      logInfo('Ejecuta: npm install @supabase/supabase-js');
      issuesFound++;
    }
  }

  // Resumen
  console.log('\n');
  if (issuesFound === 0) {
    logSuccess('🎉 ¡Configuración verificada correctamente!');
    logInfo('Ejecuta el proyecto con: npm run dev');
    return true;
  } else {
    logError(`Se encontraron ${issuesFound} problema(s)`);
    logInfo('Consulta GUIA_CONFIGURACION_SUPABASE.md para más detalles');
    return false;
  }
}

// Crear archivo .env desde template
async function createEnvFile() {
  logHeader('📝 CONFIGURACIÓN DE VARIABLES DE ENTORNO');

  if (checkEnvFile()) {
    const answer = await askQuestion('⚠️  El archivo .env ya existe. ¿Deseas sobrescribirlo? (y/N): ');
    if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
      logInfo('Operación cancelada');
      return;
    }
  }

  log('\nPor favor, proporciona los siguientes datos de tu proyecto Supabase:', 'cyan');
  log('Los encontrarás en: Dashboard de Supabase → Settings → API\n', 'cyan');

  const supabaseUrl = await askQuestion('Supabase URL (https://xxxxx.supabase.co): ');
  const supabaseKey = await askQuestion('Supabase Anon Key (public): ');

  if (!supabaseUrl || !supabaseKey) {
    logError('Debes proporcionar ambos valores');
    return;
  }

  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseKey}

# Development
NODE_ENV=development
`;

  const envPath = path.join(__dirname, '..', '.env');
  fs.writeFileSync(envPath, envContent);

  logSuccess('Archivo .env creado exitosamente');
  logInfo('Recuerda NO subir este archivo a Git (ya está en .gitignore)');
}

// Listar migraciones
function listMigrations() {
  logHeader('📋 MIGRACIONES DISPONIBLES');

  const migrationsPath = path.join(__dirname, '..', 'supabase', 'migrations');
  if (!fs.existsSync(migrationsPath)) {
    logError('Carpeta de migraciones no encontrada');
    return;
  }

  const migrations = fs.readdirSync(migrationsPath)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (migrations.length === 0) {
    logWarning('No se encontraron archivos de migración');
    return;
  }

  log(`\nSe encontraron ${migrations.length} archivos de migración:\n`, 'green');

  migrations.forEach((migration, index) => {
    log(`${index + 1}. ${migration}`, 'cyan');
  });

  log('\n📖 Para aplicar estas migraciones:', 'yellow');
  log('   1. Usando Supabase CLI: supabase db push', 'yellow');
  log('   2. Manualmente: Copia cada archivo en SQL Editor de Supabase', 'yellow');
  log('\n📚 Consulta GUIA_CONFIGURACION_SUPABASE.md para instrucciones detalladas\n', 'yellow');
}

// Mostrar instrucciones de Storage
function showStorageInstructions() {
  logHeader('🗂️  CONFIGURACIÓN DE STORAGE');

  log('\nPara configurar el Storage de archivos:', 'cyan');
  log('\n1. Abre el Dashboard de Supabase', 'yellow');
  log('2. Ve a: SQL Editor → New Query', 'yellow');
  log('3. Abre el archivo: supabase/CONFIGURAR_STORAGE_RLS.sql', 'yellow');
  log('4. Copia TODO el contenido y pégalo en el editor', 'yellow');
  log('5. Ejecuta el script (botón Run)', 'yellow');
  log('\n✅ Deberías ver 12 políticas creadas', 'green');
  log('\n📚 Consulta GUIA_CONFIGURACION_SUPABASE.md sección 5 para más detalles\n', 'cyan');
}

// Setup guiado
async function guidedSetup() {
  logHeader('🚀 CONFIGURACIÓN GUIADA DE SUPABASE');

  log('\nEste asistente te ayudará a configurar Supabase paso a paso.\n', 'cyan');

  // Paso 1: Verificar si ya tiene proyecto Supabase
  const hasProject = await askQuestion('¿Ya creaste un proyecto en Supabase.com? (y/N): ');

  if (hasProject.toLowerCase() !== 'y' && hasProject.toLowerCase() !== 'yes') {
    log('\n📝 Primero debes crear un proyecto en Supabase:', 'yellow');
    log('   1. Ve a: https://supabase.com/dashboard', 'cyan');
    log('   2. Crea una cuenta o inicia sesión', 'cyan');
    log('   3. Haz clic en "New Project"', 'cyan');
    log('   4. Completa los datos del proyecto', 'cyan');
    log('   5. Espera 2-3 minutos a que se cree', 'cyan');
    log('\n   Una vez creado, vuelve a ejecutar este script\n', 'yellow');
    return;
  }

  // Paso 2: Configurar .env
  log('\n📋 Paso 1: Configurar variables de entorno', 'bright');
  await createEnvFile();

  // Paso 3: Verificar configuración
  log('\n📋 Paso 2: Verificar configuración', 'bright');
  const configOk = await checkSupabaseConfig();

  if (!configOk) {
    logError('La configuración tiene errores. Por favor corrígelos antes de continuar.');
    return;
  }

  // Paso 4: Instrucciones de migraciones
  log('\n📋 Paso 3: Aplicar migraciones de base de datos', 'bright');
  listMigrations();

  const migrationsApplied = await askQuestion('\n¿Ya aplicaste las migraciones en Supabase? (y/N): ');
  if (migrationsApplied.toLowerCase() !== 'y' && migrationsApplied.toLowerCase() !== 'yes') {
    log('\n⚠️  Debes aplicar las migraciones antes de continuar', 'red');
    log('   Consulta GUIA_CONFIGURACION_SUPABASE.md sección 4\n', 'yellow');
  }

  // Paso 5: Configurar Storage
  log('\n📋 Paso 4: Configurar Storage', 'bright');
  showStorageInstructions();

  const storageConfigured = await askQuestion('\n¿Ya configuraste el Storage? (y/N): ');
  if (storageConfigured.toLowerCase() !== 'y' && storageConfigured.toLowerCase() !== 'yes') {
    log('\n⚠️  Debes configurar el Storage para que los usuarios puedan subir archivos', 'red');
    log('   Consulta GUIA_CONFIGURACION_SUPABASE.md sección 5\n', 'yellow');
  }

  // Resumen final
  log('\n' + '='.repeat(60), 'bright');
  logSuccess('🎉 ¡Configuración básica completada!');
  log('='.repeat(60) + '\n', 'bright');

  log('📚 Próximos pasos:', 'cyan');
  log('   1. Crea usuarios de prueba (ver sección 7 de la guía)', 'yellow');
  log('   2. Ejecuta el proyecto: npm run dev', 'yellow');
  log('   3. Prueba el login con tus usuarios', 'yellow');
  log('   4. Verifica que todo funcione correctamente', 'yellow');
  log('\n📖 Guía completa: GUIA_CONFIGURACION_SUPABASE.md\n', 'cyan');
}

// Mostrar ayuda
function showHelp() {
  log('\n🔧 Script de Configuración de Supabase', 'bright');
  log('Portal de Proveedores - NEO Consulting\n', 'bright');

  log('Uso:', 'cyan');
  log('  node scripts/setup-supabase.js [opción]\n', 'yellow');

  log('Opciones:', 'cyan');
  log('  --check        Verificar configuración actual', 'yellow');
  log('  --setup        Configuración guiada paso a paso', 'yellow');
  log('  --env          Crear/actualizar archivo .env', 'yellow');
  log('  --migrations   Listar migraciones disponibles', 'yellow');
  log('  --storage      Mostrar instrucciones de Storage', 'yellow');
  log('  --help         Mostrar esta ayuda\n', 'yellow');

  log('Ejemplos:', 'cyan');
  log('  node scripts/setup-supabase.js --check', 'green');
  log('  node scripts/setup-supabase.js --setup\n', 'green');

  log('📚 Para más información, consulta: GUIA_CONFIGURACION_SUPABASE.md\n', 'cyan');
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }

  if (args.includes('--check')) {
    await checkSupabaseConfig();
  } else if (args.includes('--setup')) {
    await guidedSetup();
  } else if (args.includes('--env')) {
    await createEnvFile();
  } else if (args.includes('--migrations')) {
    listMigrations();
  } else if (args.includes('--storage')) {
    showStorageInstructions();
  } else {
    logError('Opción no reconocida');
    showHelp();
  }
}

// Ejecutar
main().catch(error => {
  logError(`Error: ${error.message}`);
  process.exit(1);
});
