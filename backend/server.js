require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const File = require('./models/File');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Conectar a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Configurar Multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta para subir archivos (solo guarda metadatos, no el archivo en sí)
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            console.log('No se recibió ningún archivo');
            return res.status(400).json({ error: 'No file received' });
        }

        console.log('Archivo recibido:', req.file);

        const { originalname, mimetype, size } = req.file;

        const newFile = new File({
            filename: originalname,
            mimetype,
            size,
            path: 'not_saved'
        });

        await newFile.save();
        res.status(200).json({ message: 'File metadata saved', file: newFile });

    } catch (error) {
        console.error('Error en /upload:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Ruta para obtener todos los archivos
app.get('/files', async (req, res) => {
    try {
        const files = await File.find();
        res.status(200).json(files);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching files' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
