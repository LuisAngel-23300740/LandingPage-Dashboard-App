const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/register body', req.body);
    
    const { name, nombre, email, password } = req.body;
    const userName = (name || nombre || '').trim();

    if (!userName || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Correo electrónico inválido.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const { data: existing, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error verificando email:', checkError);
      throw checkError;
    }

    if (existing.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado (duplicado).' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: insertResult, error: insertError } = await supabase
      .from('usuarios')
      .insert([{ nombre: userName, email, password: hashedPassword }])
      .select('id');

    if (insertError) {
      console.error('Error insertando usuario:', insertError);
      throw insertError;
    }

    console.log('Usuario insertado correctamente id:', insertResult[0].id);

    const token = jwt.sign(
      { id: insertResult[0].id, email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registro exitoso.',
      token,
      name: userName,
      email
    });
  } catch (error) {
    console.error('Error register:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;