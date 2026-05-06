const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

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

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    console.log('[DEBUG] GET /api/historico');
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[DEBUG] Token válido. Usuario ID:', usuario.id);

    // Obtener lecturas de los últimos 7 días desde Supabase
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    let resultado = null;
    let error = null;

    // Intentar con litros_dia
    const { data: data1, error: error1 } = await supabase
      .from('lecturas')
      .select('timestamp, litros_dia, calidad_agua')
      .eq('usuario_id', usuario.id)
      .gte('timestamp', hace7Dias.toISOString())
      .order('timestamp', { ascending: true });

    if (error1 && error1.code === '42703') {
      console.log('[DEBUG] Columna litros_dia no existe, intentando con litros...');
      // Intentar con litros
      const { data: data2, error: error2 } = await supabase
        .from('lecturas')
        .select('timestamp, litros, calidad_agua')
        .eq('usuario_id', usuario.id)
        .gte('timestamp', hace7Dias.toISOString())
        .order('timestamp', { ascending: true });
      
      if (error2 && error2.code === '42703') {
        console.log('[DEBUG] Columna litros no existe, intentando con litros_filtrados...');
        // Intentar con litros_filtrados
        const { data: data3, error: error3 } = await supabase
          .from('lecturas')
          .select('timestamp, litros_filtrados, calidad_agua')
          .eq('usuario_id', usuario.id)
          .gte('timestamp', hace7Dias.toISOString())
          .order('timestamp', { ascending: true });
        
        resultado = data3;
        error = error3;
      } else {
        resultado = data2;
        error = error2;
      }
    } else {
      resultado = data1;
      error = error1;
    }

    if (error && error.code !== '42703') {
      console.error('[ERROR] Error obteniendo histórico:', error);
      throw error;
    }

    // Generar las 7 fechas requeridas (desde hace 6 días hasta hoy) en zona horaria Guadalajara
    const fechasRequeridas = [];
    const hoyMexicoStr = getMexicoDateStr(new Date());
    const [hoyYear, hoyMonth, hoyDay] = hoyMexicoStr.split('-').map(Number);
    const hoyMexicoMiddayUtc = Date.UTC(hoyYear, hoyMonth - 1, hoyDay, 12);

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoyMexicoMiddayUtc - i * 24 * 60 * 60 * 1000);
      fechasRequeridas.push(getMexicoDateStr(fecha));
    }

    // Si no hay ningún dato en los últimos 7 días, devolver CEROS en todos los dias
    if (!resultado || resultado.length === 0) {
      const datosVacios = fechasRequeridas.map(fecha => ({
        fecha,
        litros: 0,
        calidad: 0
      }));
      return res.json(datosVacios);
    }

    // Agrupar datos por día y calcular sumas y promedios
    const mapDatos = new Map();
    resultado.forEach(row => {
      const fecha = getMexicoDateStr(new Date(row.timestamp));
      const actual = mapDatos.get(fecha) || { sumaLitros: 0, sumaCalidad: 0, cantidad: 0 };
      
      // Intentar con todos los posibles nombres de columna para litros
      actual.sumaLitros += row.litros_dia || row.litros || row.litros_consumidos || row.cantidad_litros || row.litros_filtrados || 0;
      actual.sumaCalidad += row.calidad_agua || row.calidad || 0;
      actual.cantidad += 1;
      
      mapDatos.set(fecha, actual);
    });

    // Convertir sumas a valores finales
    const datosPorDia = new Map();
    mapDatos.forEach((val, fecha) => {
      datosPorDia.set(fecha, {
        litros: Math.round(val.sumaLitros),
        calidad: Math.round(val.sumaCalidad / val.cantidad)
      });
    });

    // Construir el histórico completo (rellenando con ceros donde falte)
    const historicoCompleto = fechasRequeridas.map(fecha => ({
      fecha,
      litros: datosPorDia.get(fecha)?.litros ?? 0,
      calidad: datosPorDia.get(fecha)?.calidad ?? 0
    }));

    // Enviar la respuesta (con cabecera anti-caché opcional)
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.json(historicoCompleto);

  } catch (error) {
    console.error('[ERROR] Error en /api/historico:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[ERROR] JWT Error:', error.message);
      return res.status(403).json({ mensaje: 'Token inválido o expirado.', error: error.message });
    }
    // Retornar datos vacíos en caso de error
    console.log('[DEBUG] Retornando datos vacíos debido a error');
    const fechasRequeridas = [];
    const hoyMexicoStr = getMexicoDateStr(new Date());
    const [hoyYear, hoyMonth, hoyDay] = hoyMexicoStr.split('-').map(Number);
    const hoyMexicoMiddayUtc = Date.UTC(hoyYear, hoyMonth - 1, hoyDay, 12);

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoyMexicoMiddayUtc - i * 24 * 60 * 60 * 1000);
      fechasRequeridas.push(getMexicoDateStr(fecha));
    }
    
    const datosVacios = fechasRequeridas.map(fecha => ({
      fecha,
      litros: 0,
      calidad: 0
    }));
    
    res.json(datosVacios);
  }
});

module.exports = router;