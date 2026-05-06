const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

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

    // Obtener última lectura del usuario desde Supabase
    const { data: lecturaResult, error: lecturaError } = await supabase
      .from('lecturas')
      .select('litros_dia, calidad_agua, estado_filtro')
      .eq('usuario_id', usuario.id)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (lecturaError) {
      console.error('Error obteniendo lecturas:', lecturaError);
      throw lecturaError;
    }

    // Obtener últimas alertas del usuario desde Supabase
    const { data: alertasResult, error: alertasError } = await supabase
      .from('alertas')
      .select('timestamp, tipo_alerta')
      .eq('usuario_id', usuario.id)
      .order('timestamp', { ascending: false })
      .limit(5);

    if (alertasError) {
      console.error('Error obteniendo alertas:', alertasError);
      throw alertasError;
    }

    const alertas = alertasResult.map(a => ({
      fecha: a.timestamp,
      tipo: a.tipo_alerta,
      descripcion:
        a.tipo_alerta === 'Filtro saturado' ? 'El filtro requiere mantenimiento urgente.' :
        a.tipo_alerta === 'Calidad baja' ? 'La calidad del agua está por debajo del umbral recomendado.' :
        'Revisión recomendada del sistema.'
    }));

    let datos;
    if (lecturaResult.length > 0) {
      const lectura = lecturaResult[0];
      datos = {
        litros_totales: 1250,
        litros_hoy: Math.round(parseFloat(lectura.litros_dia)),
        calidad_agua: lectura.calidad_agua,
        estado_filtro: lectura.estado_filtro,
        alertas
      };
    } else {
      datos = {
        litros_totales: 1250,
        litros_hoy: 32,
        calidad_agua: 94,
        estado_filtro: 'bueno',
        alertas: []
      };
    }

    console.log('[DEBUG] Retornando datos exitosamente');
    res.json(datos);

  } catch (error) {
    console.error('[ERROR] Error en /api/datos:', error.message);
    console.error('[ERROR] Stack:', error.stack);
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('[ERROR] JWT Error:', error.message);
      return res.status(403).json({ mensaje: 'Token inválido o expirado.', error: error.message });
    }
    res.status(500).json({ mensaje: 'Error interno del servidor.', error: error.message });
  }
});

module.exports = router;