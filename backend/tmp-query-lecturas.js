require('dotenv').config();
const supabase = require('./config/supabase');

(async () => {
  try {
    const { data, error } = await supabase
      .from('lecturas')
      .select('*')
      .eq('usuario_id', 6)
      .order('timestamp', { ascending: true })
      .limit(20);
    if (error) {
      console.error('Error al consultar lecturas:', error);
      return;
    }
    console.log('Lecturas (usuario 6):', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(err);
  }
})();
