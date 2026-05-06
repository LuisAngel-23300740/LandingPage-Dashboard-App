#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar el estado del backend en Render
 * Ejecutar con: node render-test.js
 */

const https = require('https');

const BASE_URL = process.env.RENDER_EXTERNAL_URL || 'https://tu-app.onrender.com';

console.log('🔍 Iniciando diagnóstico del backend...\n');

async function testEndpoint(endpoint, description) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`Testing: ${description}`);
    console.log(`URL: ${url}`);

    const req = https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📄 Response:`, JSON.stringify(jsonData, null, 2));
          resolve({ success: true, status: res.statusCode, data: jsonData });
        } catch (e) {
          console.log(`✅ Status: ${res.statusCode}`);
          console.log(`📄 Response: ${data}`);
          resolve({ success: true, status: res.statusCode, data });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(10000, () => {
      console.log(`⏰ Timeout after 10 seconds`);
      req.destroy();
      resolve({ success: false, error: 'Timeout' });
    });
  });
}

async function runTests() {
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  // Test 1: Health check
  console.log('='.repeat(50));
  const healthResult = await testEndpoint('/api/health', 'Health Check (conexión Supabase)');
  console.log('');

  // Test 2: Diagnostics
  console.log('='.repeat(50));
  const diagResult = await testEndpoint('/api/diagnostics', 'Environment Diagnostics');
  console.log('');

  // Test 3: Register test (simulado)
  console.log('='.repeat(50));
  console.log('Testing: Register Endpoint (simulated)');
  console.log('Nota: Para probar registro real, usa el frontend o curl');
  console.log('Ejemplo curl:');
  console.log(`curl -X POST ${BASE_URL}/api/register \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"name":"Test","email":"test@example.com","password":"123456"}'`);
  console.log('');

  // Summary
  console.log('='.repeat(50));
  console.log('📊 RESUMEN DE DIAGNÓSTICO:');
  console.log(`Health Check: ${healthResult.success ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Diagnostics: ${diagResult.success ? '✅ PASS' : '❌ FAIL'}`);

  if (!healthResult.success || !diagResult.success) {
    console.log('\n🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verifica que las variables de entorno estén configuradas en Render');
    console.log('2. Revisa los logs de Render para errores de build/deploy');
    console.log('3. Asegúrate de que la base de datos Supabase esté accesible');
    console.log('4. Verifica que el puerto esté configurado correctamente (process.env.PORT)');
  } else {
    console.log('\n✅ El backend parece estar funcionando correctamente.');
    console.log('Si el registro sigue fallando, el problema podría estar en:');
    console.log('- La configuración del frontend (URLs hardcodeadas)');
    console.log('- CORS policy');
    console.log('- La estructura de la base de datos');
  }
}

runTests().catch(console.error);