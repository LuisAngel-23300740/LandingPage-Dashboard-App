const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

/**
 * Endpoint para verificar la estructura de la base de datos
 * Muestra los nombres de todas las columnas de las tablas principales
 */
router.get('/', async (req, res) => {
  try {
    console.log('[DEBUG] GET /api/db-schema');

    // Verificar tabla usuarios
    console.log('[DEBUG] Verificando tabla usuarios...');
    const { data: usuarios, error: usuariosError } = await supabase
      .from('usuarios')
      .select('*')
      .limit(1);

    // Verificar tabla lecturas
    console.log('[DEBUG] Verificando tabla lecturas...');
    const { data: lecturas, error: lecturasError } = await supabase
      .from('lecturas')
      .select('*')
      .limit(1);

    // Verificar tabla alertas
    console.log('[DEBUG] Verificando tabla alertas...');
    const { data: alertas, error: alertasError } = await supabase
      .from('alertas')
      .select('*')
      .limit(1);

    const schema = {
      timestamp: new Date().toISOString(),
      tables: {
        usuarios: {
          columns: usuarios && usuarios.length > 0 ? Object.keys(usuarios[0]) : ['NO DATA'],
          error: usuariosError ? usuariosError.message : null
        },
        lecturas: {
          columns: lecturas && lecturas.length > 0 ? Object.keys(lecturas[0]) : ['NO DATA'],
          error: lecturasError ? lecturasError.message : null
        },
        alertas: {
          columns: alertas && alertas.length > 0 ? Object.keys(alertas[0]) : ['NO DATA'],
          error: alertasError ? alertasError.message : null
        }
      },
      recommendations: generateRecommendations(usuarios, lecturas, alertas)
    };

    console.log('[DEBUG] Schema:', JSON.stringify(schema, null, 2));
    res.json(schema);
  } catch (error) {
    console.error('[ERROR] Error en /api/db-schema:', error.message);
    res.status(500).json({
      error: 'Error al obtener esquema de la base de datos',
      message: error.message
    });
  }
});

function generateRecommendations(usuarios, lecturas, alertas) {
  const recommendations = [];

  if (usuarios && usuarios.length > 0) {
    const keys = Object.keys(usuarios[0]);
    if (!keys.includes('nombre') && !keys.includes('name')) {
      recommendations.push('⚠️  La tabla usuarios no tiene columna "nombre" o "name"');
    }
    if (!keys.includes('email')) {
      recommendations.push('⚠️  La tabla usuarios no tiene columna "email"');
    }
    if (!keys.includes('password')) {
      recommendations.push('⚠️  La tabla usuarios no tiene columna "password"');
    }
  }

  if (lecturas && lecturas.length > 0) {
    const keys = Object.keys(lecturas[0]);
    if (!keys.includes('litros_dia') && !keys.includes('litros')) {
      recommendations.push('❌ La tabla lecturas NO tiene columna "litros_dia" ni "litros" - FIX REQUIRED');
    }
    if (!keys.includes('calidad_agua') && !keys.includes('calidad')) {
      recommendations.push('⚠️  La tabla lecturas no tiene columna "calidad_agua" o "calidad"');
    }
    if (!keys.includes('estado_filtro') && !keys.includes('estado')) {
      recommendations.push('⚠️  La tabla lecturas no tiene columna "estado_filtro" o "estado"');
    }
  } else {
    recommendations.push('⚠️  La tabla lecturas está vacía - considera insertar datos de prueba');
  }

  if (alertas && alertas.length > 0) {
    const keys = Object.keys(alertas[0]);
    if (!keys.includes('tipo_alerta') && !keys.includes('tipo')) {
      recommendations.push('⚠️  La tabla alertas no tiene columna "tipo_alerta" o "tipo"');
    }
  }

  return recommendations;
}

module.exports = router;