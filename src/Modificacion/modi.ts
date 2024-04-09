import fs from 'fs';

// Definir la función que leerá el archivo
function readFile(filePath: string, callback: (error: Error | null, data?: string) => void) {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, data);
    }
  });
}

// Usar la función de lectura del archivo con una función de devolución de llamada
readFile('ejemplo.txt', (error, data) => {
  if (error) {
    console.error('Error al leer el archivo:', error);
  } else {
    console.log('Contenido del archivo:', data);
  }
});
