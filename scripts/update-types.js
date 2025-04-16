#!/usr/bin/env node

const { exec } = require('child_process');
const path = require('path');

// Configuración
const TYPES_FILE_PATH = path.join(__dirname, '../src/integrations/supabase/types.ts');

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

async function updateTypes() {
  try {
    console.log('Actualizando tipos de base de datos...');
    await executeCommand(`npx supabase gen types typescript --local > "${TYPES_FILE_PATH}"`);
    console.log(`Tipos actualizados en: ${TYPES_FILE_PATH}`);
  } catch (error) {
    console.error('Error al actualizar tipos:', error);
  }
}

// Ejecutar la actualización
updateTypes();