// 📸 Image Compression - Utilidades para comprimir y optimizar imágenes

import { CompressionOptions } from '../types/upload.types';
import { UPLOAD_CONFIG } from '../constants/upload.constants';

/**
 * Comprime una imagen usando Canvas API
 */
export const compressImage = (
  file: File,
  options: Partial<CompressionOptions> = {}
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const {
      maxWidth = UPLOAD_CONFIG.compressionOptions.maxWidth,
      maxHeight = UPLOAD_CONFIG.compressionOptions.maxHeight,
      quality = UPLOAD_CONFIG.compressionOptions.quality,
      format = UPLOAD_CONFIG.compressionOptions.format
    } = options;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    if (!ctx) {
      reject(new Error('No se pudo crear el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      const { width: newWidth, height: newHeight } = calculateNewDimensions(
        img.width,
        img.height,
        maxWidth,
        maxHeight
      );

      // Configurar canvas
      canvas.width = newWidth;
      canvas.height = newHeight;

      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al crear el blob de la imagen'));
            return;
          }

          // Crear nuevo archivo comprimido
          const compressedFile = new File(
            [blob],
            getCompressedFileName(file.name, format),
            {
              type: `image/${format}`,
              lastModified: Date.now()
            }
          );

          resolve(compressedFile);
        },
        `image/${format}`,
        quality
      );
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };

    // Cargar la imagen
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Calcula las nuevas dimensiones manteniendo el aspect ratio
 */
export const calculateNewDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } => {
  let { width, height } = { width: originalWidth, height: originalHeight };

  // Si la imagen es más pequeña que los límites, no redimensionar
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calcular ratios
  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const ratio = Math.min(widthRatio, heightRatio);

  // Aplicar ratio
  width = Math.round(width * ratio);
  height = Math.round(height * ratio);

  return { width, height };
};

/**
 * Genera el nombre del archivo comprimido
 */
export const getCompressedFileName = (
  originalName: string,
  format: string
): string => {
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, '');
  return `${nameWithoutExtension}_compressed.${format}`;
};

/**
 * Obtiene las dimensiones de una imagen
 */
export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error('Error al cargar la imagen para obtener dimensiones'));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Verifica si una imagen necesita compresión
 */
export const needsCompression = async (file: File): Promise<boolean> => {
  try {
    const dimensions = await getImageDimensions(file);
    const { maxWidth, maxHeight } = UPLOAD_CONFIG.compressionOptions;
    
    return (
      dimensions.width > maxWidth ||
      dimensions.height > maxHeight ||
      file.size > UPLOAD_CONFIG.maxFileSize * 0.8 // Comprimir si está cerca del límite
    );
  } catch {
    // Si no se pueden obtener las dimensiones, comprimir por seguridad
    return true;
  }
};

/**
 * Comprime múltiples imágenes de forma secuencial
 */
export const compressMultipleImages = async (
  files: File[],
  options: Partial<CompressionOptions> = {},
  onProgress?: (progress: number, currentFile: string) => void
): Promise<File[]> => {
  const compressedFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Reportar progreso
      if (onProgress) {
        const progress = (i / files.length) * 100;
        onProgress(progress, file.name);
      }

      // Verificar si necesita compresión
      const needsComp = await needsCompression(file);
      
      if (needsComp) {
        const compressedFile = await compressImage(file, options);
        compressedFiles.push(compressedFile);
      } else {
        compressedFiles.push(file);
      }
    } catch (error) {
      console.warn(`Error comprimiendo ${file.name}:`, error);
      // En caso de error, usar archivo original
      compressedFiles.push(file);
    }
  }

  // Reportar progreso completo
  if (onProgress) {
    onProgress(100, 'Compresión completada');
  }

  return compressedFiles;
};
