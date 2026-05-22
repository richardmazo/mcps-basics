const mongoose = require('mongoose');

const connection = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/db-portafolio');
        console.log('Conexión a la base de datos establecida');
    } catch (error) {
        console.error(error);
        throw new Error('No se ha podido establecer la conexión a la base de datos');
    }
}

module.exports = connection;