const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('POST /api/register body', req.body);
    console.log('Environment check:', {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'NOT SET',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET',
      JWT_SECRET: process.env.JWT_SECRET ? 'SET' : 'NOT SET'
    });

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

    console.log('Checking for existing user...');
    const { data: existing, error: checkError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error('Error verificando email:', checkError);
      throw checkError;
    }

    if (existing && existing.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado (duplicado).' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Inserting user...');
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
    console.error('Error stack:', error.stack);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

module.exports = router;