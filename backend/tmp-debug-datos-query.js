require('dotenv').config();
const supabase = require('./config/supabase');

(async () => {
  const { data, error } = await supabase
    .from('lecturas')
    .select('timestamp, litros_filtrados, litros, litros_dia, calidad_agua, estado_filtro')
    .eq('usuario_id', 6)
    .order('timestamp', { ascending: false });

  console.log('ERROR:', error);
  console.log('DATA LENGTH:', data ? data.length : 'no data');
  console.log('DATA SAMPLE:', JSON.stringify(data ? data.slice(0, 5) : [], null, 2));
})();
