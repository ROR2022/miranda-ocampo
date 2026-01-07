'use client'

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { Trash2, Loader2, Play, Pause, SkipBack, SkipForward, Maximize2, Download } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import type { CarouselApi } from '@/components/ui/carousel';

// Importar controles manuales FASE 2
import { useCarouselManualPlay } from '../hooks/useCarouselManualPlay';

// 🎭 MODO TEATRO - FASE 5
import TheaterModeModal from './TheaterModeModal';

// Importar tipos del hook híbrido
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

// Paleta Aurora VIP Mejorada para Quinceañera - Mayor Contraste y Visibilidad
const VIP_COLORS = {
  rosaAurora: '#E91E63',      // Rosa principal - mayor contraste
  lavandaAurora: '#9C27B0',   // Púrpura principal - más visible
  oroAurora: '#FF9800',       // Naranja dorado - muy visible
  blancoSeda: '#FFFFFF',      // Blanco puro - máximo contraste
  cremaSuave: '#F5F5F5',      // Gris claro - mejor contraste
  rosaIntensa: '#C2185B',     // Rosa intenso - excelente legibilidad
  lavandaIntensa: '#7B1FA2',  // Púrpura intenso - alto contraste
  oroIntensio: '#F57C00',     // Naranja intenso - muy legible
  rosaDelicada: '#F8BBD9'     // Rosa suave pero visible
};

interface PhotoCarouselViewProps {
  photos: HybridPhoto[];
  loading?: boolean;
  getPhotoDisplayUrl: (photo: HybridPhoto, quality?: 'original' | 'compressed' | 'thumbnail') => string;
  onPhotoSelect: (photo: HybridPhoto) => void;
  onDeletePhoto: (photo: HybridPhoto, e: React.MouseEvent) => void;
  isPhotoDeleting: (photoId: string) => boolean;
}

export const PhotoCarouselView: React.FC<PhotoCarouselViewProps> = ({
  photos,
  loading = false,
  getPhotoDisplayUrl,
  onPhotoSelect,
  onDeletePhoto,
  isPhotoDeleting
}) => {
  // Estados del carrusel
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  // � Estado para Modo Teatro
  const [theaterMode, setTheaterMode] = useState(false);

  // �🎮 FASE 2: Integración de controles manuales
  const manualPlayback = useCarouselManualPlay({
    totalItems: photos.length,
    onSlideChange: (index: number) => {
      api?.scrollTo(index);
    },
    initialIndex: 0
  });

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Efectos para sincronización con Embla Carousel
  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  // Función para ir a una diapositiva específica
  const goToSlide = useCallback((index: number) => {
    api?.scrollTo(index);
  }, [api]);

  // Función para descargar imagen
  const handleDownloadImage = async (photo: HybridPhoto, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const imageUrl = getPhotoDisplayUrl(photo, 'original');
      const response = await fetch(imageUrl);
      
      if (!response.ok) {
        throw new Error(`Error al descargar imagen: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Crear elemento de descarga
      const link = document.createElement('a');
      link.href = url;
      
      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
      const fileName = `frida-quince-${timestamp}-${photo.originalName || 'imagen.jpg'}`;
      link.download = fileName;
      
      // Ejecutar descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      alert('No se pudo descargar la imagen. Por favor, intenta nuevamente.');
    }
  };

  // Mostrar loading si no hay fotos
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: VIP_COLORS.rosaAurora }} />
          <p className="text-gray-600">Cargando galería...</p>
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
        <div className="mb-6">
          <div 
            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: `${VIP_COLORS.lavandaAurora}30` }}
          >
            📸
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: VIP_COLORS.rosaAurora }}>
            No hay fotos en la galería
          </h3>
          <p className="text-gray-600">
            Las fotos que subas aparecerán aquí en formato carrusel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: false
        }}
      >
        <CarouselContent>
          {photos.map((photo, index) => (
            <CarouselItem key={photo.id} className="basis-full">
              <div className="relative group">
                {/* Imagen principal */}
                <div 
                  className="relative aspect-[4/3] w-full overflow-hidden rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-2xl"
                  style={{ 
                    background: `linear-gradient(135deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 100%)` 
                  }}
                >
                  <Image
                    src={getPhotoDisplayUrl(photo, 'compressed')}
                    alt={`Foto: ${photo.originalName}`}
                    fill
                    className="object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                    onClick={() => onPhotoSelect(photo)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    priority={index < 2} // Priorizar las primeras 2 imágenes
                    quality={80}
                  />
                  
                  {/* Overlay con información */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-end">
                    <div className="w-full p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="font-semibold text-lg mb-2 truncate">
                        {photo.originalName}
                      </h3>
                      <div className="flex justify-between items-center text-sm">
                        <span>Por: {photo.uploaderName}</span>
                        <span>{formatFileSize(photo.size)}</span>
                      </div>
                      <p className="text-xs mt-1 opacity-90">
                        {formatDate(photo.uploadedAt)} • {photo.eventMoment}
                      </p>
                      {photo.comment && (
                        <p className="text-xs mt-2 italic opacity-80 line-clamp-2">
                          &quot;{photo.comment}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Botón de descarga */}
                  <button
                    onClick={(e) => handleDownloadImage(photo, e)}
                    className="absolute top-4 left-4 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    style={{
                      background: 'linear-gradient(135deg, #2196F3, #4CAF50)'
                    }}
                    aria-label={`Descargar foto ${photo.originalName}`}
                  >
                    <Download size={16} />
                  </button>

                  {/* Botón de eliminación */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePhoto(photo, e);
                    }}
                    disabled={isPhotoDeleting(photo.id)}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                    aria-label={`Eliminar foto ${photo.originalName}`}
                  >
                    {isPhotoDeleting(photo.id) ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>

                {/* Metadatos expandidos debajo de la imagen */}
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium" style={{ color: VIP_COLORS.rosaAurora }}>Dimensiones:</span>
                      <p className="text-gray-700">{photo.dimensions.width} × {photo.dimensions.height}px</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: VIP_COLORS.lavandaAurora }}>Tipo:</span>
                      <p className="text-gray-700">{photo.mimeType}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: VIP_COLORS.oroAurora }}>Estado:</span>
                      <p className="text-gray-700">{photo.isPublic ? 'Público' : 'Privado'}</p>
                    </div>
                    <div>
                      <span className="font-medium" style={{ color: VIP_COLORS.rosaIntensa }}>Vistas:</span>
                      <p className="text-gray-700">{photo.viewCount || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navegación con flechas personalizadas */}
        <CarouselPrevious 
          className="left-2 bg-white/90 hover:bg-white border-2 hover:scale-110 transition-all duration-300"
          style={{ 
            borderColor: VIP_COLORS.lavandaAurora,
            color: VIP_COLORS.rosaAurora
          }}
        />
        <CarouselNext 
          className="right-2 bg-white/90 hover:bg-white border-2 hover:scale-110 transition-all duration-300"
          style={{ 
            borderColor: VIP_COLORS.lavandaAurora,
            color: VIP_COLORS.rosaAurora
          }}
        />
      </Carousel>

      {/* Indicadores de posición simples */}
      {photos.length > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          {photos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index + 1 ? 'scale-125' : 'hover:scale-110'
              }`}
              style={{
                backgroundColor: current === index + 1 ? VIP_COLORS.rosaAurora : `${VIP_COLORS.lavandaAurora}60`
              }}
              aria-label={`Ir a foto ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 🎮 FASE 2: Controles manuales de reproducción */}
      {photos.length > 1 && (
        <div className="flex flex-col md:flex-row gap-3 items-center justify-center mt-8 space-x-6">
          {/* 🎭 BOTÓN MODO TEATRO - PROMINENTE */}
          <button
            onClick={() => setTheaterMode(true)}
            className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-violet-600 to-pink-600 
                      hover:from-violet-500 hover:to-pink-500 text-white rounded-xl transition-all duration-300 
                      shadow-lg hover:shadow-violet-500/25 transform hover:scale-105 font-medium"
            title="Modo Teatro - Vista inmersiva completa"
          >
            <Maximize2 className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span>Modo Teatro</span>
            <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Pantalla completa
            </div>
          </button>

          {/* 🎮 CONTROLES DE REPRODUCCIÓN */}
          <div className="flex items-center space-x-4 p-4 rounded-lg shadow-lg" 
               style={{ backgroundColor: VIP_COLORS.blancoSeda, borderColor: VIP_COLORS.oroAurora, borderWidth: '2px' }}>
            
            {/* Botón anterior */}
            <button
              onClick={manualPlayback.goToPrevious}
              disabled={!manualPlayback.hasPrevious}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
              style={{ backgroundColor: VIP_COLORS.lavandaAurora, color: 'white' }}
              aria-label="Foto anterior"
            >
              <SkipBack size={20} />
            </button>

            {/* Botón Play/Pause PROMINENTE */}
            <button
              onClick={manualPlayback.togglePlayback}
              className="p-4 rounded-full transition-all duration-300 hover:scale-110 shadow-lg"
              style={{ 
                backgroundColor: manualPlayback.isPlaying ? VIP_COLORS.rosaIntensa : VIP_COLORS.rosaAurora,
                color: 'white'
              }}
              aria-label={manualPlayback.isPlaying ? 'Pausar presentación' : 'Iniciar presentación'}
            >
              {manualPlayback.isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>

            {/* Botón siguiente */}
            <button
              onClick={manualPlayback.goToNext}
              disabled={!manualPlayback.hasNext}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110 disabled:opacity-50"
              style={{ backgroundColor: VIP_COLORS.lavandaAurora, color: 'white' }}
              aria-label="Siguiente foto"
            >
              <SkipForward size={20} />
            </button>

            {/* Contador */}
            <div className="text-sm font-medium ml-4" style={{ color: VIP_COLORS.rosaIntensa }}>
              {current} de {count}
            </div>

            {/* Barra de progreso del intervalo */}
            {manualPlayback.isPlaying && (
              <div className="ml-4 w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-100"
                  style={{ 
                    width: `${manualPlayback.progress}%`,
                    backgroundColor: VIP_COLORS.oroAurora
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer con información */}
      <div className="text-center mt-8 text-sm" style={{ color: VIP_COLORS.rosaIntensa }}>
        <p>Haz clic en una foto para ver detalles completos o activa el <strong>Modo Teatro</strong> para una experiencia inmersiva</p>
        <p className="opacity-75">
          {manualPlayback.isPlaying 
            ? "Reproducción automática activa cada 2 segundos - Presiona pausa para detener"
            : "Presiona ▶️ para iniciar presentación automática o usa las flechas ← → para navegar"
          }
        </p>
      </div>

      {/* 🎭 MODO TEATRO - MODAL FULLSCREEN */}
      {theaterMode && (
        <>
          {/* {console.log('🎭 Abriendo Teatro:', { 
            photos: photos.length, 
            current, 
            initialIndex: Math.max(0, current - 1),
            firstPhoto: photos[0]?.originalName 
          })} */}
          <TheaterModeModal
            photos={photos}
            initialIndex={Math.max(0, current - 1)} // Asegurar que no sea negativo
            isOpen={theaterMode}
            onClose={() => setTheaterMode(false)}
            getPhotoDisplayUrl={getPhotoDisplayUrl}
          />
        </>
      )}
    </div>
  );
};

export default PhotoCarouselView;