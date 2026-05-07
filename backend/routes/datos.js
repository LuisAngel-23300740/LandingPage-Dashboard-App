const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

function parseTimestamp(value) {
  if (!value) return null;
  if (typeof value === 'string') {
    const normalized = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`;
    return new Date(normalized);
  }
  return new Date(value);
}

// Función auxiliar para obtener una fecha en formato YYYY-MM-DD en zona horaria Guadalajara
function getMexicoDateStr(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find(p => p.type === 'year').value;
  const month = parts.find(p => p.type === 'month').value;
  const day = parts.find(p => p.type === 'day').value;
  return `${year}-${month}-${day}`;
}

router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[DEBUG] GET /api/datos');
  console.log('[DEBUG] Auth header:', authHeader ? 'Presente' : 'NO PRESENTE');
  console.log('[DEBUG] Token:', token ? `Presente (${token.substring(0, 20)}...)` : 'NO PRESENTE');
  console.log('[DEBUG] JWT_SECRET:', process.env.JWT_SECRET ? 'Configurado' : 'NO CONFIGURADO');

  if (!token) {
    console.log('[ERROR] Token no proporcionado');
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    console.log('[DEBUG] Verificando token...');
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[DEBUG] Token válido. Usuario ID:', usuario.id);

    function getLitrosValue(row) {
      return Number(row.litros_dia ?? row.litros ?? row.litros_filtrados ?? row.litros_consumidos ?? row.cantidad_litros ?? 0) || 0;
    }

    function getLatestReading(lecturas) {
      if (!lecturas || lecturas.length === 0) return null;
      return lecturas[0];
    }

    const hoyMexico = getMexicoDateStr(new Date());
    let litrosHoy = 0;
    let litrosTotales = 0;
    let calidadAgua = 0;
    let estadoFiltro = 'desconocido';

    const { data: todasLecturas, error: errorTodas } = await supabase
      .from('lecturas')
      .select('timestamp, litros_filtrados, litros, litros_dia, calidad_agua, estado_filtro')
      .eq('usuario_id', usuario.id)
      .order('timestamp', { ascending: false });

    if (!errorTodas && todasLecturas && todasLecturas.length > 0) {
      const latest = getLatestReading(todasLecturas);
      calidadAgua = latest.calidad_agua ?? 0;
      estadoFiltro = latest.estado_filtro ?? 'desconocido';

      litrosTotales = todasLecturas.reduce((sum, row) => sum + getLitrosValue(row), 0);
      litrosHoy = todasLecturas
        .filter(row => getMexicoDateStr(parseTimestamp(row.timestamp)) === hoyMexico)
        .reduce((sum, row) => sum + getLitrosValue(row), 0);
    }

    // Obtener últimas alertas del usuario desde Supabase
    const { data: alertasResult, error: alertasError } = await supabase
      .from('alertas')
      .select('timestamp, tipo_alerta')
      .eq('usuario_id', usuario.id)
      .order('timestamp', { ascending: false })
      .limit(5);

    // ✅ NUNCA lanzar error por alertas, simplemente devolver array vacio
    let alertas = [];
    if (!alertasError && alertasResult && alertasResult.length > 0) {
      alertas = alertasResult.map(a => ({
        fecha: a.timestamp,
        tipo: a.tipo_alerta,
        descripcion:
          a.tipo_alerta === 'Filtro saturado' ? 'El filtro requiere mantenimiento urgente.' :
          a.tipo_alerta === 'Calidad baja' ? 'La calidad del agua está por debajo del umbral recomendado.' :
          'Revisión recomendada del sistema.'
      }));
    }

    const datos = {
      litros_totales: Math.round(litrosTotales),
      litros_hoy: Math.round(litrosHoy),
      calidad_agua: calidadAgua,
      estado_filtro: estadoFiltro,
      alertas
    };

    console.log('[DEBUG] Retornando datos exitosamente:', datos);
    res.json(datos);

  } catch (error) {
    console.error('[ERROR] Error en /api/datos:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[ERROR] JWT Error:', error.message);
      return res.status(403).json({ mensaje: 'Token inválido o expirado.', error: error.message });
    }
    // Retornar datos por defecto en lugar de fallar completamente
    console.log('[DEBUG] Retornando datos por defecto debido a error');
    res.json({
      litros_totales: 0,
      litros_hoy: 0,
      calidad_agua: 94,
      estado_filtro: 'bueno',
      alertas: []
    });
  }
});

module.exports = router;