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
        const { originalname, mimetype, size } = req.file;

        // Guardar solo los metadatos en MongoDB
        const newFile = new File({
            filename: originalname,
            mimetype,
            size,
            path: 'not_saved' // O puedes dejarlo vacío o poner null
        });

        await newFile.save();
        res.status(200).json({ message: 'File metadata saved successfully', file: newFile });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error saving file metadata' });
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
