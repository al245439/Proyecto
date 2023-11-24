const express = require('express');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const port = 3000;

// Función para cifrar datos
function cifrarDatos(datos, clave) {
  const cifrador = crypto.createCipher('aes-256-cbc', clave);
  let cifrado = cifrador.update(JSON.stringify(datos), 'utf8', 'hex');
  cifrado += cifrador.final('hex');
  return cifrado;
}

// Función para descifrar datos
function descifrarDatos(datosCifrados, clave) {
  const descifrador = crypto.createDecipher('aes-256-cbc', clave);
  let descifrado = descifrador.update(datosCifrados, 'hex', 'utf8');
  descifrado += descifrador.final('utf8');
  return JSON.parse(descifrado);
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
    fs.writeFileSync(`./datos-cifrados/${categoria}-cifrado.json`, datosCifrados, 'utf8');
    res.send('Datos cifrados y almacenados');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al cifrar datos: ${error.message}` });
  }
});

app.get('/datos/:categoria', (req, res) => {
  const categoria = req.params.categoria.toLowerCase();
  
  if (!categoriasValidas.includes(categoria)) {
    return res.status(400).json({ error: 'Categoría no válida' });
  }

  try {
    const claveSecreta = process.env.CLAVE_SECRETA || 'alfredo2002';
    const datosCifrados = fs.readFileSync(`./datos-cifrados/${categoria}-cifrado.json`, 'utf8');
    const datosDescifrados = descifrarDatos(datosCifrados, claveSecreta);
    res.json(datosDescifrados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al descifrar datos: ${error.message}` });
  }
});

app.get('/ubicacion', async (req, res) => {
  try {
    const apiKey = 'AIzaSyB87CkkbjR2iJTDvl9RQYniV4rCGB3Bm-g';
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=Los+Angeles&key=${apiKey}`);
    const location = response.data.results[0].geometry.location;
    res.json({ latitud: location.lat, longitud: location.lng });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la ubicación' });
  }
});

app.get('/', (req, res) => {
  res.send('¡Hola, mundo!');
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
