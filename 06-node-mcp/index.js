// Importar dependencias
const connection = require('./database/connection');
const express = require('express');
const cors = require('cors');


//Conexión a la base de datos
connection();

//Crear servidor
const app = express();
const port = 3977;

// Configurar el cors
app.use(cors());

// Convertir los datos del body a objetos
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar rutas
const projectRoutes = require('./routes/project');

app.use('/api/project', projectRoutes);

//Crear endpoints de prueba

// Poner el servidor a escuchar
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});