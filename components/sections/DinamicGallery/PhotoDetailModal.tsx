'use client'

import React from 'react';
import Image from 'next/image';
import { Trash2, Loader2, X, Download } from 'lucide-react';

// Tipos importados del hook híbrido
interface HybridPhoto {
  id: string;
  originalName: string;
  uploaderName: string;
  uploadedAt: string;
  size: number;
  eventMoment: string;
  comment?: string;
  // URLs optimizadas desde MongoDB
  displayUrl: string;        // URL principal para mostrar
  thumbnailUrl?: string;     // URL del thumbnail
  source: 'cloudinary' | 'local'; // Fuente de storage
  // Datos adicionales de MongoDB
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

// Props del componente
interface PhotoDetailModalProps {
  isOpen: boolean;
  photo: HybridPhoto | null;
  currentIndex: number;
  onClose: () => void;
  onDeletePhoto: (photo: HybridPhoto, e: React.MouseEvent) => void;
  getPhotoDisplayUrl: (photo: HybridPhoto, size: 'original' | 'compressed' | 'thumbnail') => string;
  isPhotoDeleting: (photoId: string) => boolean;
}

// Configuración de colores Aurora VIP
const VIP_COLORS = {
  rosaAurora: '#E91E63',      // Rosa principal - mayor contraste
  lavandaAurora: '#9C27B0',   // Lavanda principal
  azulAurora: '#2196F3',      // Azul secundario
  verdeAurora: '#4CAF50',     // Verde de confirmación
  naranjaAurora: '#FF9800',   // Naranja de advertencia
  rojoAurora: '#F44336',      // Rojo para eliminar
  doradoAurora: '#FFD700',    // Dorado para premium
  lavandaIntensa: '#673AB7'   // Lavanda más intensa
};

const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({
  isOpen,
  photo,
  onClose,
  onDeletePhoto,
  getPhotoDisplayUrl,
  isPhotoDeleting
}) => {
  if (!isOpen || !photo) return null;

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

  // Función para eliminar desde el modal
  const handleDeleteFromModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeletePhoto(photo, e);
    onClose();
  };

  // Función para descargar imagen
  const handleDownloadImage = async () => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      {/* 🎨 Overlay del Modal */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
      />

      {/* 🖼️ Contenedor Principal del Modal */}
      <div className="relative z-10 max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl vip-shimmer-aurora">
        {/* 🎨 Fondo Degradado Aurora VIP */}
        <div 
          className="absolute inset-0 opacity-95"
          style={{
            background: `linear-gradient(135deg, 
              ${VIP_COLORS.rosaAurora}15, 
              ${VIP_COLORS.lavandaAurora}20, 
              ${VIP_COLORS.azulAurora}15
            )`
          }}
        />
        
        {/* 📄 Contenido del Modal */}
        <div className="relative bg-white p-6 max-h-[90vh] overflow-y-auto">
          {/* ❌ Botón de Cerrar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full transition-all duration-300 hover:scale-110 vip-shimmer-aurora"
            style={{ 
              background: `linear-gradient(135deg, ${VIP_COLORS.rosaAurora}, ${VIP_COLORS.lavandaAurora})`,
              color: 'white'
            }}
          >
            <X size={20} />
          </button>

          {/* 🖼️ Imagen Principal */}
          <div className="mb-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src={getPhotoDisplayUrl(photo, 'original')}
                alt={photo.originalName}
                width={800}
                height={600}
                className="w-full h-auto object-contain max-h-[60vh]"
                style={{ 
                  filter: 'brightness(1.05) contrast(1.1) saturate(1.2)' 
                }}
              />
              
              {/* 🌟 Overlay decorativo Aurora VIP */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  background: `linear-gradient(45deg, 
                    ${VIP_COLORS.rosaAurora}30, 
                    transparent 50%, 
                    ${VIP_COLORS.lavandaAurora}30
                  )`
                }}
              />
            </div>
          </div>

          {/* 📋 Información de la Imagen */}
          <div className="space-y-3 mb-6">
            <h3 
              className="text-xl font-bold"
              style={{ color: VIP_COLORS.lavandaAurora }}
            >
              {photo.originalName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  📤 Subida por:
                </span>
                <span className="ml-2 text-gray-700">{photo.uploaderName}</span>
              </div>
              
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  🎉 Momento:
                </span>
                <span className="ml-2 text-gray-700">{photo.eventMoment}</span>
              </div>
              
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  📅 Fecha:
                </span>
                <span className="ml-2 text-gray-700">{formatDate(photo.uploadedAt)}</span>
              </div>
              
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  📏 Tamaño:
                </span>
                <span className="ml-2 text-gray-700">{formatFileSize(photo.size)}</span>
              </div>
              
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  🖼️ Dimensiones:
                </span>
                <span className="ml-2 text-gray-700">
                  {photo.dimensions.width} × {photo.dimensions.height}px
                </span>
              </div>
              
              <div>
                <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                  � Fuente:
                </span>
                <span className="ml-2 text-gray-700">
                  {photo.source === 'cloudinary' ? '☁️ Cloudinary' : '💻 Local'}
                </span>
              </div>

              {photo.comment && (
                <div className="col-span-1 md:col-span-2">
                  <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                    💬 Comentario:
                  </span>
                  <span className="ml-2 text-gray-700">{photo.comment}</span>
                </div>
              )}

              {photo.viewCount && (
                <div>
                  <span className="font-semibold" style={{ color: VIP_COLORS.rosaAurora }}>
                    👀 Vistas:
                  </span>
                  <span className="ml-2 text-gray-700">{photo.viewCount}</span>
                </div>
              )}
            </div>
          </div>

          {/* 📥 Botón de Descargar */}
          <button
            onClick={handleDownloadImage}
            className="w-full mb-3 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 vip-shimmer-aurora"
            style={{
              background: `linear-gradient(135deg, ${VIP_COLORS.azulAurora}, ${VIP_COLORS.verdeAurora})`,
              color: 'white'
            }}
          >
            <Download size={18} />
            <span>Descargar Imagen</span>
          </button>

          {/* 🗑️ Botón de Eliminar Foto */}
          <button
            onClick={handleDeleteFromModal}
            disabled={isPhotoDeleting(photo.id)}
            className="w-full px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 vip-shimmer-aurora"
            style={{
              background: `linear-gradient(135deg, ${VIP_COLORS.lavandaAurora}, ${VIP_COLORS.lavandaIntensa})`,
              color: 'white'
            }}
          >
            {isPhotoDeleting(photo.id) ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={18} />
                <span>Eliminar Foto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhotoDetailModal;
