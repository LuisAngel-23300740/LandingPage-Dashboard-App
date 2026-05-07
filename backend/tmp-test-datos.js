require('dotenv').config();
const supabase = require('./config/supabase');
const jwt = require('jsonwebtoken');

(async () => {
  try {
    const { data, error } = await supabase.from('usuarios').select('id,email,nombre').limit(10);
    if (error) {
      console.error('Error al listar usuarios:', error);
      return;
    }
    console.log('Usuarios:', data);
    if (!data || data.length === 0) {
      console.log('No hay usuarios para probar.');
      return;
    }
    const user = data.find(u => u.id === 6) || data[0];
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Token de prueba para usuario:', user.email, 'id=', user.id);
    console.log(token);

    const res = await fetch('http://localhost:3000/api/datos', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', body);
  } catch (err) {
    console.error('Error en prueba:', err);
  }
})();
