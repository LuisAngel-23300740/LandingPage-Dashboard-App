// Script para verificar la estructura de la base de datos Supabase
require('dotenv').config();
const supabase = require('./config/supabase');

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a Supabase...');

    // Verificar conexión básica
    const { data: connectionTest, error: connectionError } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError);
      return;
    }

    console.log('✅ Conexión a Supabase exitosa');

    // Verificar si la tabla usuarios existe y tiene la estructura correcta
    console.log('🔍 Verificando tabla usuarios...');

    const { data: tableInfo, error: tableError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accediendo a tabla usuarios:', tableError);
      console.log('💡 Posible solución: Crear la tabla usuarios en Supabase con columnas: id, nombre, email, password');
      return;
    }

    console.log('✅ Tabla usuarios existe');

    // Verificar estructura de la tabla
    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0]);
      console.log('📋 Columnas encontradas:', columns);

      const requiredColumns = ['id', 'nombre', 'email', 'password'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));

      if (missingColumns.length > 0) {
        console.error('❌ Columnas faltantes:', missingColumns);
        console.log('💡 Crear tabla con SQL:');
        console.log(`
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
        `);
      } else {
        console.log('✅ Estructura de tabla correcta');
      }
    } else {
      console.log('⚠️ Tabla usuarios está vacía');
    }

    // Verificar políticas RLS
    console.log('🔍 Verificando políticas RLS...');
    console.log('💡 Asegúrate de que las políticas RLS permitan operaciones de escritura con la SERVICE_ROLE_KEY');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkDatabase();