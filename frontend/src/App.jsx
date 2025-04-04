import React, { useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import { Button, message, Upload } from 'antd';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';


const App = () => {
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileType, setFileType] = useState(null);

  // Limitar el tamaño del archivo (50 MB)
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB en bytes

  // Tipos de archivo permitidos (se puede extender según sea necesario)
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
  ];

  // Manejo del cambio de archivo
  const handleFileChange = (file) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileType(file.type);
    setFileList([file]); // Solo mantiene el archivo recién seleccionado
  };

  // Función para manejar la subida de archivos
  const handleUpload = () => {
    if (fileList.length === 0) {
      message.error('No file selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', fileList[0]);
  
    setUploading(true);
  
    fetch('https://backend-62m0.onrender.com', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        message.success('Upload successful!');
        console.log(data);
      })
      .catch(() => {
        message.error('Upload failed.');
      })
      .finally(() => {
        setUploading(false);
      });
  };
  
  // Configuración del componente Upload de Ant Design
  const props = {
    onRemove: () => {
      setFileList([]); // Limpiar la lista de archivos
      setPreviewUrl(null); // Limpiar la vista previa
      setFileType(null); // Limpiar el tipo de archivo
    },
    beforeUpload: (file) => {
      // Validación del tamaño del archivo (50 MB)
      if (file.size > MAX_FILE_SIZE) {
        message.error('File size exceeds the limit of 50MB.');
        return false;
      }

      // Validación de tipo de archivo
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        message.error('File type not allowed.');
        return false;
      }

      handleFileChange(file); // Establecer la vista previa antes de la carga
      return false; // Evitar la carga automática del archivo
    },
    fileList, // Solo mostrar el archivo seleccionado
  };

  // Función para renderizar la vista previa del archivo
  const renderPreview = () => {
    if (!previewUrl) return null;

    if (fileType === 'application/pdf') {
      return (
        <div style={{ marginTop: 20, height: '440px' }}>
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer fileUrl={previewUrl} />
          </Worker>
        </div>
      );
    } else if (fileType.startsWith('image/')) {
      return <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: 20 }} />;
    } else if (fileType.startsWith('video/')) {
      return (
        <video controls style={{ maxWidth: '100%', marginTop: 20 }}>
          <source src={previewUrl} type={fileType} />
          Your browser does not support the video tag.
        </video>
      );
    } else if (fileType.startsWith('audio/')) {
      return (
        <audio controls style={{ maxWidth: '100%', marginTop: 20 }}>
          <source src={previewUrl} type={fileType} />
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      return <p>No preview available for this file type.</p>;
    }
  };

  return (
    <>
      <Upload {...props}>
        <Button icon={<UploadOutlined />}>Select File</Button>
      </Upload>

      {renderPreview()}

      {fileList.length > 0 && (
        <Button 
          type="primary"
          onClick={handleUpload}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>
      )}
    </>
  );
};

export default App;
