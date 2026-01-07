// 🌩️ Cloudinary Configuration and Utilities
// Configuración central para integración con Cloudinary

import { v2 as cloudinary } from 'cloudinary';

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Usar HTTPS
});

export default cloudinary;

// Tipos para TypeScript basados en la respuesta real de Cloudinary
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
  version: number;
  signature: string;
  resource_type: string;
  type: string;
  etag: string;
  placeholder?: boolean;
  access_mode?: string;
  original_filename?: string;
}

// Configuraciones de transformación predefinidas
export const TRANSFORMATIONS = {
  // Thumbnail para previews rápidos
  thumbnail: { 
    width: 300, 
    height: 300, 
    crop: 'fill', 
    quality: 'auto:good',
    fetch_format: 'auto'
  },
  
  // Imagen comprimida para galería
  compressed: { 
    width: 1200, 
    height: 1200, 
    crop: 'limit', 
    quality: 'auto:good',
    fetch_format: 'auto'
  },
  
  // Imagen optimizada para visualización en galería
  gallery: { 
    width: 800, 
    height: 600, 
    crop: 'fit', 
    quality: 'auto:good',
    fetch_format: 'auto'
  },

  // Imagen para modal/zoom
  modal: {
    width: 1920,
    height: 1080,
    crop: 'limit',
    quality: 'auto:best',
    fetch_format: 'auto'
  }
};

// Configuración específica para la boda VIP
export const CLOUDINARY_CONFIG = {
  folder: process.env.CLOUDINARY_FOLDER || 'carpeta_temporal',
  tags: (process.env.CLOUDINARY_TAGS || 'invitacion,evento,vip').split(','),
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  autoOptimize: true,
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || 'new_upload_preset',
};

// Utilidad para generar URLs optimizadas
export const generateOptimizedUrl = (
  publicId: string, 
  transformation: keyof typeof TRANSFORMATIONS = 'gallery'
): string => {
  return cloudinary.url(publicId, TRANSFORMATIONS[transformation]);
};

// Utilidad para validar configuración
export const validateCloudinaryConfig = (): boolean => {
  const requiredEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY', 
    'CLOUDINARY_API_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing Cloudinary environment variables:', missingVars);
    return false;
  }

  console.log('✅ Cloudinary configuration validated');
  return true;
};
