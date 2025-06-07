const express = require('express');
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;
const fs = require('fs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'secreto-super-seguro';
const USERS_FILE = 'usuarios.json';

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '/')));

// Middleware para verificar autenticación JWT
function verificarAutenticacion(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    console.log('❌ No se encontró token');
    return res.status(401).json({ mensaje: 'No autenticado' });
  }

  try {
    const verificado = jwt.verify(token, JWT_SECRET);
    req.usuario = verificado;
    console.log('✅ Token verificado correctamente:', verificado.username);
    next();
  } catch (err) {
    console.log('❌ Token inválido');
    return res.status(403).json({ mensaje: 'Token inválido' });
  }
}

// Registro de usuario
app.post('/api/registro', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  let usuarios = [];
  if (fs.existsSync(USERS_FILE)) {
    usuarios = JSON.parse(fs.readFileSync(USERS_FILE));
  }

  if (usuarios.find(u => u.username === username)) {
    return res.status(409).json({ mensaje: 'El usuario ya existe' });
  }

  const hash = bcrypt.hashSync(password, SALT_ROUNDS);
  usuarios.push({ username, password: hash });
  fs.writeFileSync(USERS_FILE, JSON.stringify(usuarios, null, 2));

  res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
});

// Login de usuario
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  if (!fs.existsSync(USERS_FILE)) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  const usuarios = JSON.parse(fs.readFileSync(USERS_FILE));
  const encontrado = usuarios.find(u => u.username === username);
  if (!encontrado || !bcrypt.compareSync(password, encontrado.password)) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax',
    maxAge: 60 * 60 * 1000
  });

  res.status(200).json({ mensaje: 'Inicio de sesión exitoso' });
});

// Ruta protegida para guardar consultas
app.post('/api/consultas', verificarAutenticacion, (req, res) => {
  console.log('Solicitud recibida:', req.body);

  const nuevoDato = req.body;
  const dbFile = 'db.json';
  let datos = [];

  if (fs.existsSync(dbFile)) {
    datos = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
  }

  datos.push(nuevoDato);

  fs.writeFile(dbFile, JSON.stringify(datos, null, 2), err => {
    if (err) {
      console.error('Error al guardar:', err);
      return res.status(500).send('Error al guardar los datos');
    }
    res.status(200).send('Datos guardados con éxito');
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ mensaje: 'Sesión cerrada' });
});

// Página protegida
app.get('/privado.html', verificarAutenticacion, (req, res) => {
  res.sendFile(path.resolve(__dirname, 'privado.html'));
});

app.get('/api/usuario', verificarAutenticacion, (req, res) => {
  res.json({ username: req.usuario.username });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
