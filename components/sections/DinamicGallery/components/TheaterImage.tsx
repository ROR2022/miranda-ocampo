'use client'

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Loader2, AlertCircle } from 'lucide-react';

// Tipos importados del hook híbrido
interface HybridPhoto {
  id: string;
  originalName: string;
  uploaderName: string;
  uploadedAt: string;
  size: number;
  eventMoment: string;
  comment?: string;
  displayUrl: string;
  thumbnailUrl?: string;
  source: 'cloudinary' | 'local';
  filename: string;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  viewCount?: number;
  status: string;
  isPublic: boolean;
}

// Colores específicos para Modo Teatro
const THEATER_COLORS = {
  background: '#000000',
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  accent: '#E91E63',
  error: '#FF5252'
};

interface TheaterImageProps {
  photo: HybridPhoto;
  getPhotoDisplayUrl: (photo: HybridPhoto, quality?: 'original' | 'compressed' | 'thumbnail') => string;
  isActive: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const TheaterImage: React.FC<TheaterImageProps> = ({
  photo,
  getPhotoDisplayUrl,
  isActive,
  onLoad,
  onError
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
    setImageError(false);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setImageError(true);
    onError?.();
  }, [onError]);

  // URL de la imagen con máxima calidad
  const imageUrl = getPhotoDisplayUrl(photo, 'original');

  // 🔍 DEBUG: Log para verificar la URL de la imagen
  useEffect(() => {
    /* console.log('🖼️ TheaterImage Debug:', {
      photoId: photo.id,
      photoName: photo.originalName,
      imageUrl,
      isActive,
      imageLoading,
      imageError
    }); */
  }, [photo.id, photo.originalName, imageUrl, isActive, imageLoading, imageError]);

  if (!isActive) return null;

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center"
      style={{ 
        backgroundColor: THEATER_COLORS.background,
        padding: '2rem'
      }}
    >
      {/* Loading state */}
      {imageLoading && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <Loader2 
              size={48} 
              className="animate-spin mb-4"
              style={{ color: THEATER_COLORS.accent }}
            />
            <p 
              className="text-lg font-medium"
              style={{ color: THEATER_COLORS.text }}
            >
              Cargando imagen...
            </p>
            <p 
              className="text-sm mt-1"
              style={{ color: THEATER_COLORS.textSecondary }}
            >
              {photo.originalName}
            </p>
          </div>
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <AlertCircle 
              size={48} 
              className="mb-4"
              style={{ color: THEATER_COLORS.error }}
            />
            <p 
              className="text-lg font-medium mb-2"
              style={{ color: THEATER_COLORS.text }}
            >
              Error al cargar la imagen
            </p>
            <p 
              className="text-sm"
              style={{ color: THEATER_COLORS.textSecondary }}
            >
              {photo.originalName}
            </p>
            <p 
              className="text-xs mt-1"
              style={{ color: THEATER_COLORS.textSecondary }}
            >
              URL: {imageUrl}
            </p>
          </div>
        </div>
      )}

      {/* 🎭 IMAGEN PRINCIPAL - MODO TEATRO LIMPIO */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
        style={{ 
          maxHeight: '85vh',
          maxWidth: '90vw'
        }}
      >
        <Image
          src={imageUrl}
          alt={`Modo Teatro: ${photo.originalName}`}
          fill
          className="object-contain"
          sizes="90vw"
          quality={100}
          priority={true}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  );
};

export default TheaterImage;
