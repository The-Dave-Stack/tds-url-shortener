#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Configuración
const MIGRATIONS_DIR = path.join(__dirname, '../supabase/migrations');

// Crear la interfaz para leer input del usuario
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para ejecutar comandos y mostrar output
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    console.log(`Ejecutando: ${command}`);
    
    const childProcess = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return reject(error);
      }
      
      if (stderr) {
        console.error(`stderr: ${stderr}`);
      }
      
      console.log(`stdout: ${stdout}`);
      resolve(stdout);
    });

    childProcess.stdout.pipe(process.stdout);
    childProcess.stderr.pipe(process.stderr);
  });
}

// Función para crear una nueva migración
async function createMigration() {
  rl.question('Nombre de la migración (sin espacios): ', async (name) => {
    if (!name) {
      console.error('El nombre de la migración es obligatorio.');
      rl.close();
      return;
    }

    // Formatear el nombre para el archivo
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14);
    const fileName = `${timestamp}_${name.replace(/\s+/g, '_').toLowerCase()}.sql`;
    const filePath = path.join(MIGRATIONS_DIR, fileName);

    // Crear archivo de migración
    fs.writeFileSync(filePath, `-- Migration: ${name}\n-- Created at: ${new Date().toISOString()}\n\n-- Write your SQL here\n`);

    console.log(`Migración creada: ${filePath}`);
    rl.close();
  });
}

// Función para aplicar migraciones pendientes
async function applyMigrations() {
  try {
    await executeCommand('npx supabase db push');
    console.log('Migraciones aplicadas correctamente');
    rl.close();
  } catch (error) {
    console.error('Error al aplicar migraciones:', error);
    rl.close();
  }
}

// Función para revertir la última migración
async function revertLastMigration() {
  try {
    // Obtener lista de migraciones ordenadas por nombre (que incluye timestamp)
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort((a, b) => b.localeCompare(a)); // Orden descendente

    if (files.length === 0) {
      console.log('No hay migraciones para revertir');
      rl.close();
      return;
    }

    const lastMigration = files[0];
    console.log(`Revertiendo última migración: ${lastMigration}`);
    
    // Aquí normalmente usarías un comando como supabase db revert
    // Pero como es una operación compleja, mostraremos instrucciones
    console.log('Para revertir manualmente:');
    console.log(`1. Conecta a la base de datos`);
    console.log(`2. Examina ${lastMigration} y ejecuta las operaciones inversas`);
    console.log(`3. Elimina el archivo ${lastMigration} del directorio de migraciones`);
    
    rl.close();
  } catch (error) {
    console.error('Error al revertir migración:', error);
    rl.close();
  }
}

// Menú principal
function showMenu() {
  console.log('\n===== DB Migration Tool =====');
  console.log('1. Crear nueva migración');
  console.log('2. Aplicar migraciones pendientes');
  console.log('3. Revertir última migración');
  console.log('4. Salir');
  
  rl.question('Selecciona una opción: ', (answer) => {
    switch (answer) {
      case '1':
        createMigration();
        break;
      case '2':
        applyMigrations();
        break;
      case '3':
        revertLastMigration();
        break;
      case '4':
        console.log('Saliendo...');
        rl.close();
        break;
      default:
        console.log('Opción no válida');
        showMenu();
        break;
    }
  });
}

// Verificar que el directorio de migraciones existe
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  console.log(`Directorio de migraciones creado: ${MIGRATIONS_DIR}`);
}

// Iniciar la herramienta
showMenu();