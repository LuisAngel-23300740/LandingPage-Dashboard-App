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

// Endpoint de prueba para verificar conectividad
app.get('/api/health', async (req, res) => {
  try {
    const supabase = require('./config/supabase');
    const { data, error } = await supabase.from('usuarios').select('count').limit(1);

    if (error) {
      console.error('Health check error:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error conectando a Supabase',
        error: error.message
      });
    }

    res.json({
      status: 'ok',
      message: 'Backend funcionando correctamente',
      supabase: 'conectado',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

require('./simulador');

// Puerto (IMPORTANTE para Render)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});