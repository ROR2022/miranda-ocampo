// 📤 Hook para upload de archivos a Cloudinary
// Maneja el estado y lógica de subida de imágenes

import { useState, useCallback } from 'react';

// Interfaces
interface CloudinaryUploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  uploadedFiles: CloudinaryUploadedFile[];
  uploadId: string | null;
}

interface CloudinaryUploadedFile {
  originalName: string;
  size: number;
  type: string;
  cloudinaryId: string;
  uploadedAt: string;
  urls: {
    original: string;
    compressed: string;
    thumbnail: string;
    gallery: string;
    modal: string;
  };
  metadata: {
    width: number;
    height: number;
    format: string;
    optimizedSize: number;
  };
}

interface UploadMetadata {
  uploaderName: string;
  eventMoment: string;
  comment?: string;
}

export const useCloudinaryUpload = () => {
  const [state, setState] = useState<CloudinaryUploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false,
    uploadedFiles: [],
    uploadId: null,
  });

  // Función para subir archivos
  const uploadFiles = useCallback(async (files: File[], metadata: UploadMetadata) => {
    if (!files || files.length === 0) {
      setState(prev => ({ 
        ...prev, 
        error: 'No se seleccionaron archivos para subir' 
      }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      uploading: true, 
      error: null, 
      progress: 0,
      success: false,
      uploadedFiles: [],
      uploadId: null,
    }));

    try {
      // Crear FormData
      const formData = new FormData();
      
      // Agregar archivos
      files.forEach(file => {
        formData.append('files', file);
      });

      // Agregar metadata
      formData.append('uploaderName', metadata.uploaderName);
      formData.append('eventMoment', metadata.eventMoment);
      if (metadata.comment) {
        formData.append('comment', metadata.comment);
      }

      console.log('📤 Starting Cloudinary upload:', { 
        fileCount: files.length, 
        metadata 
      });

      // Crear XMLHttpRequest para tracking de progreso
      const xhr = new XMLHttpRequest();
      
      // Configurar tracking de progreso
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setState(prev => ({ ...prev, progress }));
          console.log(`📊 Upload progress: ${progress}%`);
        }
      });

      // Realizar upload con Promise wrapper
      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.response, { status: xhr.status }));
          } else {
            reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Error de red durante el upload'));
        xhr.ontimeout = () => reject(new Error('Timeout durante el upload'));

        xhr.open('POST', '/api/upload-fotos-cloudinary');
        xhr.timeout = 300000; // 5 minutos timeout
        xhr.send(formData);
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Cloudinary upload successful:', result.data);
        
        setState(prev => ({
          ...prev,
          uploading: false,
          success: true,
          uploadedFiles: result.data.files,
          uploadId: result.data.uploadId,
          progress: 100,
        }));

        return result.data;
      } else {
        throw new Error(result.message || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Error desconocido durante el upload';

      setState(prev => ({
        ...prev,
        uploading: false,
        error: errorMessage,
        progress: 0,
      }));

      throw error;
    }
  }, []);

  // Función para resetear el estado
  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      success: false,
      uploadedFiles: [],
      uploadId: null,
    });
  }, []);

  // Función para limpiar solo errores
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    // Estado
    uploading: state.uploading,
    progress: state.progress,
    error: state.error,
    success: state.success,
    uploadedFiles: state.uploadedFiles,
    uploadId: state.uploadId,
    
    // Acciones
    uploadFiles,
    reset,
    clearError,
    
    // Estado computado
    hasFiles: state.uploadedFiles.length > 0,
    totalFiles: state.uploadedFiles.length,
    totalSize: state.uploadedFiles.reduce((sum, file) => sum + file.size, 0),
  };
};
