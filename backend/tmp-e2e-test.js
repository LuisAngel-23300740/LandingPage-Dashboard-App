require('dotenv').config();
const fetch = global.fetch;

(async () => {
  try {
    const baseUrl = 'http://localhost:3000/api';
    const random = Date.now();
    const email = `auto_test_${random}@example.com`;
    const password = '123456';
    const name = 'Auto Test';

    console.log('1) Registrando usuario de prueba:', email);
    let res = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    let body = await res.json();
    console.log('register status', res.status, body);

    if (!res.ok && res.status === 409) {
      console.log('Usuario ya existe, intentando login.');
    } else if (!res.ok) {
      console.error('Error al registrar usuario', body);
      return;
    }

    console.log('2) Haciendo login con usuario de prueba');
    res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    body = await res.json();
    console.log('login status', res.status, body);
    if (!res.ok) {
      console.error('No se pudo loguear', body);
      return;
    }

    const token = body.token;
    console.log('Token recibido:', token ? token.slice(0, 20) + '...' : 'NINGUNO');

    console.log('3) Llamando /api/datos');
    res = await fetch(`${baseUrl}/datos`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    body = await res.json();
    console.log('datos status', res.status, body);

    console.log('4) Llamando /api/historico');
    res = await fetch(`${baseUrl}/historico`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    body = await res.json();
    console.log('historico status', res.status, JSON.stringify(body, null, 2));
  } catch (err) {
    console.error('Error e2e:', err);
  }
})();
