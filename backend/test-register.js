// Script para probar el registro de usuario
require('dotenv').config();

async function testRegister() {
  try {
    console.log('🧪 Probando registro de usuario...');

    const testUser = {
      name: 'Usuario Test',
      email: `test${Date.now()}@example.com`,
      password: 'password123'
    };

    console.log('Datos de prueba:', testUser);

    // Simular la lógica del registro
    const bcrypt = require('bcrypt');
    const supabase = require('./config/supabase');

    // Verificar si el email ya existe
    console.log('🔍 Verificando email existente...');
    const { data: existing, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', testUser.email)
      .limit(1);

    if (checkError) {
      console.error('❌ Error verificando email:', checkError);
      return;
    }

    if (existing && existing.length > 0) {
      console.log('⚠️ Email ya existe, usando otro...');
      testUser.email = `test${Date.now() + 1}@example.com`;
    }

    // Hash de contraseña
    console.log('🔐 Hasheando contraseña...');
    const hashedPassword = await bcrypt.hash(testUser.password, 10);

    // Insertar usuario
    console.log('💾 Insertando usuario...');
    const { data: insertResult, error: insertError } = await supabase
      .from('usuarios')
      .insert([{
        nombre: testUser.name,
        email: testUser.email,
        password: hashedPassword
      }])
      .select('id');

    if (insertError) {
      console.error('❌ Error insertando usuario:', insertError);
      console.log('💡 Posibles causas:');
      console.log('  - Políticas RLS no permiten inserción');
      console.log('  - La tabla no tiene permisos de escritura');
      console.log('  - Columnas incorrectas en la tabla');
      return;
    }

    console.log('✅ Usuario registrado exitosamente!');
    console.log('ID del usuario:', insertResult[0].id);

    // Limpiar usuario de prueba
    console.log('🧹 Limpiando usuario de prueba...');
    await supabase
      .from('usuarios')
      .delete()
      .eq('email', testUser.email);

    console.log('✅ Prueba completada exitosamente');

  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('Stack:', error.stack);
  }
}

testRegister();