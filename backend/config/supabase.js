const { createClient } = require('@supabase/supabase-js');

// Cargar variables de entorno
const rawSupabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Priorizar SERVICE_ROLE_KEY para operaciones de escritura, usar ANON_KEY como respaldo
const supabaseKey = supabaseServiceKey || supabaseAnonKey;

// Normalizar la URL para eliminar rutas adicionales o texto extra
const supabaseUrl = rawSupabaseUrl
  ? rawSupabaseUrl.trim().split(/\s+/)[0].replace(/\/rest\/v1\/?$/i, '')
  : null;

// Validar credenciales
if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Faltan variables de entorno obligatorias para Supabase: SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY o SUPABASE_ANON_KEY');
}

console.log('Supabase config:', {
  url: supabaseUrl,
  usingServiceKey: !!supabaseServiceKey,
  usingAnonKey: !supabaseServiceKey && !!supabaseAnonKey
});

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