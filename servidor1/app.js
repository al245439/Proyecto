const express = require('express');
const axios = require('axios');
const fs = require('fs');
const crypto = require('crypto');  // Asegúrate de incluir esta línea
const app = express();
const port = 3000;

const apiKey = 'AIzaSyCEieAEmAiIb314nRSDUUJpbsfQ3MeqjyA';

app.get('/ubicacion', async (req, res) => {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${apiKey}`);
    const location = response.data.results[0].geometry.location;
    res.json({ latitud: location.lat, longitud: location.lng });
  } catch (error) {
    console.error('Error al obtener la ubicación desde Google Maps:', error);
    res.status(500).json({ error: 'Error al obtener la ubicación' });
  }
});

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
    fs.writeFileSync(`./datos-cifrados/${categoria}-cifrado.json`, datosCifrados);
    res.send('Datos cifrados y almacenados');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Error al cifrar datos: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Servidor1 escuchando en http://localhost:${port}`);
});
