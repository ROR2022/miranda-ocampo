// 📸 Image Validation - Utilidades para validar archivos de imagen

import { ValidationResult } from '../types/upload.types';
import { UPLOAD_CONFIG, ERROR_MESSAGES, ALLOWED_EXTENSIONS } from '../constants/upload.constants';

/**
 * Valida si un archivo es una imagen válida
 */
export const validateImageFile = (file: File): ValidationResult => {
  console.log('🔍 imageValidation: Validando archivo individual:', {
    name: file.name,
    size: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
    type: file.type,
    lastModified: new Date(file.lastModified).toISOString()
  });

  // Validar tipo MIME
  if (!UPLOAD_CONFIG.allowedFormats.includes(file.type)) {
    console.error('❌ imageValidation: Tipo MIME no permitido:', {
      fileName: file.name,
      fileType: file.type,
      allowedTypes: UPLOAD_CONFIG.allowedFormats
    });
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FORMAT
    };
  }
  console.log('✅ imageValidation: Tipo MIME válido:', file.type);

  // Validar extensión del archivo
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => 
    fileName.endsWith(ext)
  );

  if (!hasValidExtension) {
    console.error('❌ imageValidation: Extensión de archivo no válida:', {
      fileName: file.name,
      allowedExtensions: ALLOWED_EXTENSIONS
    });
    return {
      valid: false,
      error: ERROR_MESSAGES.INVALID_FORMAT
    };
  }
  console.log('✅ imageValidation: Extensión de archivo válida');

  // Validar tamaño del archivo
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    console.error('❌ imageValidation: Archivo excede tamaño máximo:', {
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      maxSize: `${(UPLOAD_CONFIG.maxFileSize / 1024 / 1024).toFixed(2)}MB`
    });
    return {
      valid: false,
      error: ERROR_MESSAGES.FILE_TOO_LARGE
    };
  }
  console.log('✅ imageValidation: Tamaño de archivo válido');

  console.log('🎉 imageValidation: Archivo completamente válido:', file.name);
  return { valid: true };
};

/**
 * Valida una lista de archivos
 */
export const validateFileList = (files: FileList): ValidationResult => {
  console.log('📋 imageValidation: Validando lista de archivos:', {
    totalFiles: files.length,
    maxAllowed: UPLOAD_CONFIG.maxFiles,
    files: Array.from(files).map(f => ({
      name: f.name,
      size: `${(f.size / 1024 / 1024).toFixed(2)}MB`,
      type: f.type
    }))
  });

  // Validar cantidad de archivos
  if (files.length > UPLOAD_CONFIG.maxFiles) {
    console.error('❌ imageValidation: Demasiados archivos:', {
      received: files.length,
      maxAllowed: UPLOAD_CONFIG.maxFiles
    });
    return {
      valid: false,
      error: ERROR_MESSAGES.TOO_MANY_FILES
    };
  }
  console.log('✅ imageValidation: Cantidad de archivos válida');

  // Validar cada archivo individualmente
  console.log('🔍 imageValidation: Validando archivos individualmente...');
  for (let i = 0; i < files.length; i++) {
    console.log(`🔄 imageValidation: Validando archivo ${i + 1}/${files.length}...`);
    const validation = validateImageFile(files[i]);
    if (!validation.valid) {
      console.error(`❌ imageValidation: Archivo ${i + 1} falló validación:`, {
        fileName: files[i].name,
        error: validation.error
      });
      return validation;
    }
  }

  console.log('🎉 imageValidation: Todos los archivos son válidos');
  return { valid: true };
};

/**
 * Valida las dimensiones de una imagen
 */
export const validateImageDimensions = (
  image: HTMLImageElement
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const { maxWidth, maxHeight } = UPLOAD_CONFIG.compressionOptions;
    
    if (image.width > maxWidth || image.height > maxHeight) {
      // Las dimensiones exceden el límite, pero esto no es un error
      // ya que podemos comprimirlas automáticamente
      resolve({ 
        valid: true 
      });
    } else {
      resolve({ valid: true });
    }
  });
};

/**
 * Genera un ID único para un archivo
 */
export const generateFileId = (file: File): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const fileName = file.name.replace(/[^a-zA-Z0-9]/g, '');
  return `${timestamp}_${random}_${fileName.substr(0, 10)}`;
};

/**
 * Obtiene información detallada de un archivo
 */
export const getFileInfo = (file: File) => {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    sizeFormatted: formatFileSize(file.size)
  };
};

/**
 * Formatea el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Verifica si el navegador soporta las características necesarias
 */
export const checkBrowserSupport = (): ValidationResult => {
  console.log('🌐 imageValidation: Verificando soporte del navegador...');
  
  // Verificar File API
  if (!window.File || !window.FileReader || !window.FileList) {
    console.error('❌ imageValidation: File API no soportada:', {
      File: !!window.File,
      FileReader: !!window.FileReader,
      FileList: !!window.FileList
    });
    return {
      valid: false,
      error: 'Tu navegador no soporta la subida de archivos.'
    };
  }
  console.log('✅ imageValidation: File API soportada');

  // Verificar Canvas API para compresión
  const canvas = document.createElement('canvas');
  if (!canvas.getContext || !canvas.getContext('2d')) {
    console.error('❌ imageValidation: Canvas API no soportada');
    return {
      valid: false,
      error: 'Tu navegador no soporta el procesamiento de imágenes.'
    };
  }
  console.log('✅ imageValidation: Canvas API soportada');

  console.log('🎉 imageValidation: Navegador completamente compatible');
  return { valid: true };
};
