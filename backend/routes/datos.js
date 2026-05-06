const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

router.get('/', async (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);

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

    res.json(datos);

  } catch (error) {
    console.error(error);
    res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
});

module.exports = router;