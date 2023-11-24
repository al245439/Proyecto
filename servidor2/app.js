const express = require('express');
const fs = require('fs');
const crypto = require('crypto');
const app = express();
const port = 3001;

app.get('/posts', async (req, res) => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/posts');
    const posts = response.data;
    res.json(posts);
  } catch (error) {
    console.error('Error al obtener posts desde JSONPlaceholder:', error);
    res.status(500).json({ error: 'Error al obtener posts' });
  }
});

// Función para descifrar datos
function descifrarDatos(datosCifrados, clave) {
  const descifrador = crypto.createDecipher('aes-256-cbc', clave);
  let descifrado = descifrador.update(datosCifrados, 'hex', 'utf8');
  descifrado += descifrador.final('utf8');
  return JSON.parse(descifrado);
}

// Validación de categorías
const categoriasValidas = ['mamiferos', 'aves', 'reptiles'];

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

app.listen(port, () => {
  console.log(`Servidor2 escuchando en http://localhost:${port}`);
});
