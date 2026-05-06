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

      console.log(`Lectura insertada para usuario ${usuario.id} — calidad: ${calidad}, filtro: ${estado}`);

      if (estado === 'malo') {
        await supabase
          .from('alertas')
          .insert([{
            usuario_id: usuario.id,
            tipo_alerta: 'Filtro saturado'
          }]);
        console.log(`Alerta "Filtro saturado" insertada para usuario ${usuario.id}`);
      }

      if (calidad < 75) {
        await supabase
          .from('alertas')
          .insert([{
            usuario_id: usuario.id,
            tipo_alerta: 'Calidad baja'
          }]);
        console.log(`Alerta "Calidad baja" insertada para usuario ${usuario.id}`);
      }
    }
  } catch (error) {
    console.error('Error en simulador:', error.message);
  }
}

insertarLectura();
setInterval(insertarLectura, 60 * 60 * 1000);