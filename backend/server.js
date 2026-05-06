const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
const registerRoute = require('./routes/register');
app.use('/api/register', registerRoute);

const loginRoute = require('./routes/login');
app.use('/api/login', loginRoute);

const datosRoute = require('./routes/datos');
app.use('/api/datos', datosRoute);

const historicoRoute = require('./routes/historico');
app.use('/api/historico', historicoRoute);

// Endpoint de diagnóstico para verificar configuración
app.get('/api/diagnostics', (req, res) => {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    },
    server: {
      status: 'running',
      platform: process.platform,
      nodeVersion: process.version,
      uptime: process.uptime()
    }
  };

  res.json(diagnostics);
});

require('./simulador');

// Puerto (IMPORTANTE para Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});