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

const dbSchemaRoute = require('./routes/db-schema');
app.use('/api/db-schema', dbSchemaRoute);

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

// Endpoint de health check con prueba de Supabase
app.get('/api/health', async (req, res) => {
  try {
    const supabase = require('./config/supabase');

    // Probar conexión con Supabase
    const { data, error } = await supabase
      .from('usuarios')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('Health check - Supabase error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error conectando con Supabase',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      status: 'healthy',
      message: 'Servidor y base de datos funcionando correctamente',
      database: {
        connected: true,
        userCount: data || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

require('./simulador');

// Puerto (IMPORTANTE para Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});