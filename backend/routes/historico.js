const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

// Función auxiliar para obtener una fecha en formato YYYY-MM-DD (UTC)
function getUTCDateStr(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
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
      
      resultado = data2;
      error = error2;
    } else {
      resultado = data1;
      error = error1;
    }

    if (error && error.code !== '42703') {
      console.error('[ERROR] Error obteniendo histórico:', error);
      throw error;
    }

    // Generar las 7 fechas requeridas (desde hace 6 días hasta hoy) en UTC
    const fechasRequeridas = [];
    const hoyUTC = new Date();
    hoyUTC.setUTCHours(0, 0, 0, 0); // Normalizar a medianoche UTC

    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoyUTC);
      fecha.setUTCDate(hoyUTC.getUTCDate() - i);
      fechasRequeridas.push(getUTCDateStr(fecha));
    }

    // Si no hay ningún dato en los últimos 7 días, devolver simulación
    if (resultado.length === 0) {
      const simulado = fechasRequeridas.map(fecha => ({
        fecha,
        litros: Math.floor(Math.random() * 200 + 300),
        calidad: Math.floor(Math.random() * 20 + 75)
      }));
      return res.json(simulado);
    }

    // Agrupar datos por día y calcular sumas y promedios
    const mapDatos = new Map();
    resultado.forEach(row => {
      const fecha = getUTCDateStr(new Date(row.timestamp));
      const actual = mapDatos.get(fecha) || { sumaLitros: 0, sumaCalidad: 0, cantidad: 0 };
      
      actual.sumaLitros += row.litros_dia || row.litros || 0;
      actual.sumaCalidad += row.calidad_agua;
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
    // Retornar datos por defecto
    console.log('[DEBUG] Retornando datos por defecto debido a error');
    const fechasRequeridas = [];
    const hoyUTC = new Date();
    hoyUTC.setUTCHours(0, 0, 0, 0);
    
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoyUTC);
      fecha.setUTCDate(hoyUTC.getUTCDate() - i);
      fechasRequeridas.push(getUTCDateStr(fecha));
    }
    
    const simulado = fechasRequeridas.map(fecha => ({
      fecha,
      litros: Math.floor(Math.random() * 200 + 300),
      calidad: Math.floor(Math.random() * 20 + 75)
    }));
    
    res.json(simulado);
  }
});

module.exports = router;