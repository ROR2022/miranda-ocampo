// 🖼️ Componente de imagen optimizada para Cloudinary
// Maneja la carga, optimización y fallbacks de imágenes desde Cloudinary

'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle, ImageIcon } from 'lucide-react';

// Props del componente
interface CloudinaryImageProps {
  cloudinaryId: string;
  alt: string;
  width?: number;
  height?: number;
  transformation?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'limit' | 'scale' | 'crop';
  onLoad?: () => void;
  onError?: () => void;
  showLoader?: boolean;
  showErrorState?: boolean;
  fallbackSrc?: string;
}

export const CloudinaryImage: React.FC<CloudinaryImageProps> = ({
  cloudinaryId,
  alt,
  width = 800,
  height = 600,
  transformation,
  className = '',
  priority = false,
  sizes,
  quality = 'auto:good',
  format = 'auto',
  crop = 'fit',
  onLoad,
  onError,
  showLoader = true,
  showErrorState = true,
  fallbackSrc,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Obtener cloud name del entorno
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  // Construir URL de Cloudinary
  const buildCloudinaryUrl = useCallback((customTransformation?: string) => {
    if (!cloudName) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not configured');
      return fallbackSrc || '/placeholder.jpg';
    }

    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
    
    // Usar transformación personalizada o construir una automática
    const transformationString = customTransformation || 
      `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
    
    return `${baseUrl}/${transformationString}/${cloudinaryId}`;
  }, [cloudName, cloudinaryId, width, height, crop, quality, format, fallbackSrc]);

  // Manejar carga exitosa
  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  // Manejar error de carga
  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
    console.error(`❌ Failed to load Cloudinary image: ${cloudinaryId}`);
  }, [cloudinaryId, onError]);

  // Función para reintentar carga
  const handleRetry = useCallback(() => {
    if (retryCount < 3) {
      setIsLoading(true);
      setHasError(false);
      setRetryCount(prev => prev + 1);
    }
  }, [retryCount]);

  // Construir URL principal
  const imageUrl = buildCloudinaryUrl(transformation);

  // Determinar sizes si no se proporciona
  const responsiveSizes = sizes || 
    `(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw`;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loader */}
      {isLoading && showLoader && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Cargando imagen...</span>
          </div>
        </div>
      )}

      {/* Estado de error */}
      {hasError && showErrorState && (
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-3 p-4 text-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">Error al cargar imagen</p>
              <p className="text-xs text-gray-500 mt-1">No se pudo cargar la imagen desde Cloudinary</p>
            </div>
            {retryCount < 3 && (
              <button
                onClick={handleRetry}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Reintentar ({retryCount + 1}/3)
              </button>
            )}
          </div>
        </div>
      )}

      {/* Imagen principal */}
      {!hasError && (
        <Image
          src={imageUrl}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes={responsiveSizes}
          className={`
            transition-opacity duration-300 object-cover
            ${isLoading ? 'opacity-0' : 'opacity-100'}
          `}
          onLoad={handleLoad}
          onError={handleError}
          // Agregar key para forzar re-render en retry
          key={`${cloudinaryId}-${retryCount}`}
        />
      )}

      {/* Placeholder cuando hay error y no se muestra estado de error */}
      {hasError && !showErrorState && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Componente especializado para thumbnail
export const CloudinaryThumbnail: React.FC<Omit<CloudinaryImageProps, 'width' | 'height' | 'crop'> & {
  size?: number;
}> = ({ size = 150, ...props }) => (
  <CloudinaryImage
    {...props}
    width={size}
    height={size}
    crop="fill"
    transformation={`w_${size},h_${size},c_fill,q_auto:good,f_auto`}
  />
);

// Componente especializado para galería
export const CloudinaryGalleryImage: React.FC<Omit<CloudinaryImageProps, 'crop' | 'quality'>> = (props) => (
  <CloudinaryImage
    {...props}
    crop="fit"
    quality="auto:good"
    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
  />
);

// Componente especializado para modal/zoom
export const CloudinaryModalImage: React.FC<Omit<CloudinaryImageProps, 'width' | 'height' | 'crop' | 'quality'>> = (props) => (
  <CloudinaryImage
    {...props}
    width={1920}
    height={1080}
    crop="limit"
    quality="auto:best"
    sizes="100vw"
    priority={true}
  />
);
