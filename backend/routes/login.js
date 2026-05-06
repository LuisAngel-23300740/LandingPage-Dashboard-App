const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .limit(1);

    if (error) {
      console.error('Error consultando usuario:', error);
      throw error;
    }

    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const usuario = usuarios[0];
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login exitoso.', token, name: usuario.nombre, email: usuario.email });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

module.exports = router;