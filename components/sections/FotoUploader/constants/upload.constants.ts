// 📸 Upload Constants - Configuración del sistema de upload de fotos

import { UploadConfig } from '../types/upload.types';

// Configuración principal del upload
export const UPLOAD_CONFIG: UploadConfig = {
  maxFileSize: 4.5 * 1024 * 1024, // 4.5MB - Límite unificado
  maxFiles: 10,
  allowedFormats: ['image/jpeg', 'image/png', 'image/webp'],
  compressionOptions: {
    maxWidth: 4000,
    maxHeight: 4000,
    quality: 0.8,
    format: 'webp'
  }
};

// Formatos permitidos con extensiones
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

// Mensajes de error personalizados
export const ERROR_MESSAGES = {
  INVALID_FORMAT: 'Formato de archivo no válido. Solo se permiten JPG, PNG y WEBP.',
  FILE_TOO_LARGE: `El archivo es demasiado grande. Máximo ${UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB.`,
  TOO_MANY_FILES: `Máximo ${UPLOAD_CONFIG.maxFiles} archivos permitidos.`,
  UPLOAD_FAILED: 'Error al subir el archivo. Por favor intenta de nuevo.',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta de nuevo.',
  COMPRESSION_FAILED: 'Error al optimizar la imagen.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado.'
};

// Mensajes de éxito
export const SUCCESS_MESSAGES = {
  UPLOAD_COMPLETE: '¡Fotos subidas exitosamente!',
  FILES_ADDED: 'Archivos agregados correctamente.',
  COMPRESSION_COMPLETE: 'Imágenes optimizadas.'
};

// Estados de progreso
export const PROGRESS_STATES = {
  IDLE: 0,
  VALIDATING: 10,
  COMPRESSING: 30,
  UPLOADING: 50,
  PROCESSING: 80,
  COMPLETE: 100
};

// Configuración de UI
export const UI_CONFIG = {
  previewSize: 120, // px
  thumbnailQuality: 0.7,
  animationDuration: 300, // ms
  maxPreviewHeight: 200, // px
};

// Paleta de colores Aurora Pastel para Quinceañera VIP
export const VIP_COLORS = {
  rosaAurora: '#FFB3D9',
  lavandaAurora: '#E6D9FF',
  oroAurora: '#FFF2CC',
  blancoSeda: '#FDFCFC',
  cremaSuave: '#FAF8F5',
  rosaIntensa: '#FF8FD1',
  lavandaIntensa: '#D9CAFF',
  oroIntensio: '#FFEC99',
  rosaDelicada: '#FFCCE6'
};

// Configuración del endpoint
export const API_CONFIG = {
  uploadEndpoint: '/api/upload-fotos-simple', // Temporary simple endpoint for testing
  timeout: 30000, // 30 segundos
  retryAttempts: 3,
  retryDelay: 1000 // 1 segundo
};
