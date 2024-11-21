require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const File = require('./models/File');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Conectar a MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Configurar Multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Ruta para subir archivos
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const { originalname, mimetype, size, path } = req.file;

        // Guardar detalles del archivo en MongoDB
        const newFile = new File({
        filename: originalname,
        mimetype,
        size,
        path
        });

        await newFile.save();
        res.status(200).json({ message: 'File uploaded successfully', file: newFile });
    } catch (error) {
        res.status(500).json({ error: 'Error uploading file' });
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
