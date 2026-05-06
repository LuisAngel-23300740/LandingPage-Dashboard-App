const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
const rawSupabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// Normalizar la URL para eliminar rutas adicionales o texto extra
const supabaseUrl = rawSupabaseUrl
  ? rawSupabaseUrl.trim().split(/\s+/)[0].replace(/\/rest\/v1\/?$/i, '')
  : null;

// Validar credenciales
if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Faltan variables de entorno obligatorias para Supabase: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY');
}

// Inicializar cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
    detectSessionInUrl: false
  },
  global: {
    headers: {
      'X-Application-Name': 'Dashboard App Backend'
    }
  }
});

module.exports = supabase;