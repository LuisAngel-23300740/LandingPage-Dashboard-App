const supabase = require('./config/supabase');

async function insertarLectura() {
  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('id');

    if (error) {
      console.error('Error obteniendo usuarios:', error);
      return;
    }

    for (const usuario of usuarios) {
      const litros = Math.floor(Math.random() * 200 + 300);
      const calidad = Math.floor(Math.random() * 40 + 60);
      const estado = calidad > 80 ? 'bueno' : calidad > 70 ? 'regular' : 'malo';

      await supabase
        .from('lecturas')
        .insert([{
          usuario_id: usuario.id,
          litros_dia: litros,
          calidad_agua: calidad,
          estado_filtro: estado
        }]);

      console.log(`✅ Lectura insertada usuario ${usuario.id} | Litros: ${litros} | Calidad: ${calidad}% | Filtro: ${estado}`);

      // ✅ VERIFICAR SI YA EXISTE UNA ALERTA DE ESTE TIPO EN LAS ULTIMAS 24 HORAS
      const hace24Horas = new Date(Date.now() - (24 * 60 * 60 * 1000));

      // ✅ ALERTA FILTRO SATURADO SOLO SI NO HAY OTRA RECIENTE
      if (estado === 'malo') {
        const { data: alertasExistentesFiltro } = await supabase
          .from('alertas')
          .select('id')
          .eq('usuario_id', usuario.id)
          .eq('tipo_alerta', 'Filtro saturado')
          .gte('timestamp', hace24Horas.toISOString())
          .limit(1);

        if (alertasExistentesFiltro.length === 0) {
          await supabase
            .from('alertas')
            .insert([{
              usuario_id: usuario.id,
              tipo_alerta: 'Filtro saturado'
            }]);
          console.log(`🚨 NUEVA ALERTA: Filtro saturado usuario ${usuario.id}`);
        } else {
          console.log(`ℹ️ Ya existe alerta de filtro para usuario ${usuario.id}, no se inserta duplicado`);
        }
      }

      // ✅ ALERTA CALIDAD BAJA SOLO SI NO HAY OTRA RECIENTE
      if (calidad < 75) {
        const { data: alertasExistentesCalidad } = await supabase
          .from('alertas')
          .select('id')
          .eq('usuario_id', usuario.id)
          .eq('tipo_alerta', 'Calidad baja')
          .gte('timestamp', hace24Horas.toISOString())
          .limit(1);

        if (alertasExistentesCalidad.length === 0) {
          await supabase
            .from('alertas')
            .insert([{
              usuario_id: usuario.id,
              tipo_alerta: 'Calidad baja'
            }]);
          console.log(`🚨 NUEVA ALERTA: Calidad baja usuario ${usuario.id}`);
        } else {
          console.log(`ℹ️ Ya existe alerta de calidad para usuario ${usuario.id}, no se inserta duplicado`);
        }
      }

      // ✅ ALERTA CONSUMO EXCESIVO
      if (litros > 600) {
        const { data: alertasExistentesConsumo } = await supabase
          .from('alertas')
          .select('id')
          .eq('usuario_id', usuario.id)
          .eq('tipo_alerta', 'Consumo excesivo')
          .gte('timestamp', hace24Horas.toISOString())
          .limit(1);

        if (alertasExistentesConsumo.length === 0) {
          await supabase
            .from('alertas')
            .insert([{
              usuario_id: usuario.id,
              tipo_alerta: 'Consumo excesivo'
            }]);
          console.log(`🚨 NUEVA ALERTA: Consumo excesivo usuario ${usuario.id}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error en simulador:', error.message);
  }
}

insertarLectura();
setInterval(insertarLectura, 60 * 60 * 1000);