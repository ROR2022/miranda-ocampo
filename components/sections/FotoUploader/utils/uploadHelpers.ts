// 📸 Upload Helpers - Utilidades auxiliares para el sistema de upload

import { UploadResponse, UploaderFormData } from '../types/upload.types';
import { API_CONFIG, ERROR_MESSAGES } from '../constants/upload.constants';

/**
 * Sube un archivo individual al servidor
 */
export const uploadToServer = async (
  file: File,
  options: {
    originalName?: string;
    userName?: string;
    eventMoment?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<void> => {
  try {
    // Crear FormData
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.originalName) {
      formData.append('originalName', options.originalName);
    }
    if (options.userName) {
      formData.append('userName', options.userName);
    }
    if (options.eventMoment) {
      formData.append('eventMoment', options.eventMoment);
    }
    
    formData.append('timestamp', Date.now().toString());

    // Configurar la petición con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    console.log('📸 Uploading to server:', options.originalName || file.name);

    // Realizar la petición al API
    const response = await fetch(API_CONFIG.uploadEndpoint, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Verificar respuesta
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Parsear respuesta exitosa
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    // Simular progreso final (el progreso real se implementaría con XMLHttpRequest)
    if (options.onProgress) {
      options.onProgress(100);
    }
    
    console.log('✅ Upload successful:', result.message);
    
  } catch (error) {
    console.error('❌ Upload error:', error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Upload timeout - La subida tomó demasiado tiempo');
      }
      throw error;
    }
    
    throw new Error('Error desconocido durante la subida');
  }
};

/**
 * Realiza el upload de archivos al servidor
 */
export const uploadFilesToServer = async (
  files: File[],
  formData?: UploaderFormData
): Promise<UploadResponse> => {
  try {
    // Crear FormData
    const uploadFormData = new FormData();
    
    // Agregar archivos
    files.forEach((file) => {
      uploadFormData.append('files', file);
    });
    
    // Agregar datos del formulario si están disponibles
    if (formData?.uploaderName) {
      uploadFormData.append('uploaderName', formData.uploaderName);
    }
    
    if (formData?.comment) {
      uploadFormData.append('comment', formData.comment);
    }
    
    // Agregar timestamp
    uploadFormData.append('timestamp', Date.now().toString());

    // Configurar la petición
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(API_CONFIG.uploadEndpoint, {
      method: 'POST',
      body: uploadFormData,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Verificar respuesta
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: UploadResponse = await response.json();
    return result;

  } catch (error) {
    console.error('Error uploading files:', error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Upload timeout - La subida tomó demasiado tiempo',
          error: 'TIMEOUT'
        };
      }
      
      return {
        success: false,
        message: error.message || ERROR_MESSAGES.UPLOAD_FAILED,
        error: 'UPLOAD_ERROR'
      };
    }
    
    return {
      success: false,
      message: ERROR_MESSAGES.UNKNOWN_ERROR,
      error: 'UNKNOWN_ERROR'
    };
  }
};

/**
 * Reintenta una operación con backoff exponencial
 */
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = API_CONFIG.retryAttempts,
  baseDelay: number = API_CONFIG.retryDelay
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // Calcular delay con backoff exponencial
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
};

/**
 * Verifica la conectividad de red
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('/favicon.ico', {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Genera metadatos para el upload
 */
export const generateUploadMetadata = (
  files: File[],
  formData?: UploaderFormData
) => {
  return {
    timestamp: new Date().toISOString(),
    fileCount: files.length,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    fileNames: files.map(file => file.name),
    uploaderName: formData?.uploaderName || 'Anónimo',
    comment: formData?.comment || '',
    userAgent: navigator.userAgent,
    uploadId: generateUploadId()
  };
};

/**
 * Genera un ID único para el upload
 */
export const generateUploadId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `upload_${timestamp}_${random}`;
};

/**
 * Formatea la fecha para nombres de archivo
 */
export const formatDateForFilename = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}_${hours}-${minutes}`;
};

/**
 * Limpia caracteres especiales de nombres de archivo
 */
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

/**
 * Calcula el progreso total del upload
 */
export const calculateTotalProgress = (
  fileProgresses: Record<string, number>
): number => {
  const progresses = Object.values(fileProgresses);
  if (progresses.length === 0) return 0;
  
  const total = progresses.reduce((sum, progress) => sum + progress, 0);
  return Math.round(total / progresses.length);
};
