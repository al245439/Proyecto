const express = require('express');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-config/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://whozooredes3-default-rtdb.firebaseio.com/',
});

const db = admin.database();

const app = express();
const port = 3000;

// Función para cifrar datos
function cifrarDatos(datos, clave) {
  const cifrador = crypto.createCipher('aes-256-cbc', clave);
  let cifrado = cifrador.update(JSON.stringify(datos), 'utf8', 'hex');
  cifrado += cifrador.final('hex');
  return cifrado;
}

// Validación de categorías
const categoriasValidas = ['mamiferos', 'aves', 'reptiles'];

app.get('/datos-cifrados/:categoria', async (req, res) => {
  const categoria = req.params.categoria.toLowerCase();
  
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }

  try {
    const datos = require(`./datos/${categoria}.json`);
    const claveSecreta = process.env.CLAVE_SECRETA || 'alfredo2002';
    const datosCifrados = cifrarDatos(datos, claveSecreta);
    db.ref(`datos-cifrados/${categoria}-cifrado`).set(datosCifrados);
    res.send('Datos cifrados y almacenados');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al cifrar datos: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Servidor1 escuchando en http://localhost:${port}`);
});
