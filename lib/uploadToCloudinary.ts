// 📤 Upload Functions for Cloudinary Integration
// Funciones para subir imágenes a Cloudinary con optimizaciones automáticas

import cloudinary, { 
  CloudinaryUploadResult, 
  CLOUDINARY_CONFIG,
  generateOptimizedUrl 
} from './cloudinary';

// Interfaz para opciones de upload
export interface UploadOptions {
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  transformation?: object;
  publicId?: string;
}

// Interfaz para resultado de upload con URLs optimizadas
export interface UploadResultWithUrls {
  original: CloudinaryUploadResult;
  urls: {
    original: string;
    compressed: string;
    thumbnail: string;
    gallery: string;
    modal: string;
  };
  metadata: {
    publicId: string;
    width: number;
    height: number;
    format: string;
    size: number;
    uploadedAt: string;
  };
}

/**
 * Función principal para subir imagen a Cloudinary
 * @param buffer - Buffer de la imagen
 * @param fileName - Nombre original del archivo
 * @param options - Opciones adicionales de upload
 * @returns Resultado con URLs optimizadas
 */
export const uploadImageToCloudinary = async (
  buffer: Buffer,
  fileName: string,
  options: UploadOptions = {}
): Promise<UploadResultWithUrls> => {
  try {
    console.log(`📤 Uploading image: ${fileName}`);

    // Generar public_id único si no se proporciona
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const defaultPublicId = `${timestamp}_${sanitizedFileName}`;

    // Configurar opciones de upload
    const uploadOptions = {
      resource_type: 'image' as const,
      folder: options.folder || CLOUDINARY_CONFIG.folder,
      public_id: options.publicId || defaultPublicId,
      tags: [...(CLOUDINARY_CONFIG.tags), ...(options.tags || [])],
      context: {
        original_filename: fileName,
        upload_timestamp: new Date().toISOString(),
        ...options.context
      },
      // Transformaciones automáticas en upload
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
        ...(options.transformation ? [options.transformation] : [])
      ],
      // Configuraciones adicionales
      overwrite: false,
      unique_filename: true,
      use_filename: false,
    };

    console.log('🔧 Upload options:', { 
      folder: uploadOptions.folder,
      publicId: uploadOptions.public_id,
      tags: uploadOptions.tags 
    });

    // Realizar upload usando stream
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else if (result) {
            console.log('✅ Upload successful:', result.public_id);
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new Error('Upload failed: No result returned'));
          }
        }
      );

      // Escribir buffer al stream
      uploadStream.end(buffer);
    });

    // Generar URLs optimizadas para diferentes usos
    const optimizedUrls = {
      original: uploadResult.secure_url,
      compressed: generateOptimizedUrl(uploadResult.public_id, 'compressed'),
      thumbnail: generateOptimizedUrl(uploadResult.public_id, 'thumbnail'),
      gallery: generateOptimizedUrl(uploadResult.public_id, 'gallery'),
      modal: generateOptimizedUrl(uploadResult.public_id, 'modal'),
    };

    console.log('🎨 Generated optimized URLs for:', uploadResult.public_id);

    // Preparar metadata estructurada
    const metadata = {
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
      uploadedAt: uploadResult.created_at,
    };

    return {
      original: uploadResult,
      urls: optimizedUrls,
      metadata,
    };

  } catch (error) {
    console.error('❌ Error uploading to Cloudinary:', error);
    
    // Re-throw con más contexto
    const errorMessage = error instanceof Error 
      ? `Cloudinary upload failed: ${error.message}` 
      : 'Unknown error during Cloudinary upload';
    
    throw new Error(errorMessage);
  }
};

/**
 * Función para subir múltiples imágenes en lote
 * @param files - Array de archivos con sus buffers
 * @param baseOptions - Opciones base para todos los uploads
 * @returns Array de resultados
 */
export const uploadMultipleImages = async (
  files: Array<{ buffer: Buffer; fileName: string; options?: UploadOptions }>,
  baseOptions: UploadOptions = {}
): Promise<UploadResultWithUrls[]> => {
  console.log(`📦 Starting batch upload of ${files.length} images`);

  const uploadPromises = files.map(async (file, index) => {
    const mergedOptions = {
      ...baseOptions,
      ...file.options,
      context: {
        batch_upload: 'true',
        batch_index: index.toString(),
        batch_total: files.length.toString(),
        ...baseOptions.context,
        ...file.options?.context,
      },
    };

    return uploadImageToCloudinary(file.buffer, file.fileName, mergedOptions);
  });

  try {
    const results = await Promise.all(uploadPromises);
    console.log(`✅ Batch upload completed: ${results.length} images uploaded`);
    return results;
  } catch (error) {
    console.error('❌ Batch upload failed:', error);
    throw error;
  }
};

/**
 * Función para obtener información de una imagen ya subida
 * @param publicId - ID público de la imagen en Cloudinary
 * @returns Información de la imagen
 */
export const getImageInfo = async (publicId: string) => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      image_metadata: true,
      colors: true,
      faces: true,
    });

    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      createdAt: result.created_at,
      tags: result.tags,
      context: result.context,
      metadata: result.image_metadata,
    };
  } catch (error) {
    console.error('❌ Error getting image info:', error);
    throw error;
  }
};

/**
 * Función para eliminar imagen de Cloudinary
 * @param publicId - ID público de la imagen
 * @returns Resultado de la eliminación
 */
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`🗑️  Image deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error('❌ Error deleting image:', error);
    throw error;
  }
};
