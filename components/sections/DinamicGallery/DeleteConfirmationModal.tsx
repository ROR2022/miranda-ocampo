'use client'

import React from 'react';
import { Trash2, Loader2, AlertTriangle, X } from 'lucide-react';

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

interface DeleteConfirmationModalProps {
  photo: HybridPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (photoId: string) => Promise<void>;
  isDeleting: boolean;
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

/**
 * Modal de confirmación para eliminar fotos con diseño Aurora Pastel VIP
 */
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  photo,
  isOpen,
  onClose,
  onConfirm,
  isDeleting
}) => {
  if (!isOpen || !photo) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm(photo.id);
    } catch (error) {
      console.error('Error in modal confirm:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onClose();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      style={{ 
        animation: 'fadeIn 200ms ease-out',
      }}
    >
      <div 
        className="max-w-md w-full rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 100%)`,
          border: `2px solid ${VIP_COLORS.oroAurora}40`,
          animation: 'slideIn 200ms ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-6 border-b-2"
          style={{ 
            borderColor: `${VIP_COLORS.oroAurora}40`,
            background: `linear-gradient(135deg, ${VIP_COLORS.rosaAurora}10, ${VIP_COLORS.lavandaAurora}10)`
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center vip-pulse-aurora"
                style={{
                  background: `linear-gradient(135deg, ${VIP_COLORS.lavandaAurora}, ${VIP_COLORS.lavandaIntensa})`
                }}
              >
                <AlertTriangle size={24} color="white" />
              </div>
              <div>
                <h3 
                  className="text-xl font-semibold"
                  style={{ color: VIP_COLORS.rosaAurora }}
                >
                  ¿Eliminar foto?
                </h3>
                <p 
                  className="text-sm opacity-75"
                  style={{ color: VIP_COLORS.rosaIntensa }}
                >
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
            
            {!isDeleting && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                style={{
                  backgroundColor: `${VIP_COLORS.oroAurora}20`,
                  color: VIP_COLORS.rosaIntensa
                }}
                aria-label="Cerrar modal"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Información de la foto */}
          <div 
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: VIP_COLORS.cremaSuave,
              borderColor: `${VIP_COLORS.oroAurora}30`
            }}
          >
            <div className="space-y-2 text-sm">
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: VIP_COLORS.rosaAurora }}
                >
                  Archivo:
                </span>
                <br />
                <span style={{ color: VIP_COLORS.rosaIntensa }}>
                  {photo.originalName}
                </span>
              </div>
              
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: VIP_COLORS.rosaAurora }}
                >
                  Subido por:
                </span>
                <br />
                <span style={{ color: VIP_COLORS.rosaIntensa }}>
                  {photo.uploaderName}
                </span>
              </div>
              
              <div>
                <span 
                  className="font-semibold"
                  style={{ color: VIP_COLORS.rosaAurora }}
                >
                  Momento:
                </span>
                <br />
                <span style={{ color: VIP_COLORS.rosaIntensa }}>
                  {photo.eventMoment}
                </span>
              </div>
              
              <div className="flex justify-between">
                <div>
                  <span 
                    className="font-semibold"
                    style={{ color: VIP_COLORS.rosaAurora }}
                  >
                    Tamaño:
                  </span>
                  <br />
                  <span 
                    className="text-xs"
                    style={{ color: VIP_COLORS.rosaIntensa }}
                  >
                    {formatFileSize(photo.size)}
                  </span>
                </div>
                
                <div>
                  <span 
                    className="font-semibold"
                    style={{ color: VIP_COLORS.rosaAurora }}
                  >
                    Fecha:
                  </span>
                  <br />
                  <span 
                    className="text-xs"
                    style={{ color: VIP_COLORS.rosaIntensa }}
                  >
                    {formatDate(photo.uploadedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de advertencia */}
          <div 
            className="p-3 rounded-lg border-l-4 text-sm"
            style={{
              backgroundColor: `${VIP_COLORS.lavandaAurora}10`,
              borderColor: VIP_COLORS.lavandaAurora,
              color: VIP_COLORS.lavandaIntensa
            }}
          >
            <strong>⚠️ Advertencia:</strong> Esta foto será eliminada permanentemente de la galería de la quinceañera.
          </div>
        </div>

        {/* Footer con botones */}
        <div 
          className="p-6 border-t-2 flex space-x-3"
          style={{ 
            borderColor: `${VIP_COLORS.oroAurora}40`,
            background: `linear-gradient(135deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.blancoSeda} 100%)`
          }}
        >
          {/* Botón Cancelar */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-lg border-2 font-semibold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              borderColor: VIP_COLORS.oroAurora,
              color: VIP_COLORS.rosaAurora,
              backgroundColor: 'transparent'
            }}
          >
            Cancelar
          </button>

          {/* Botón Eliminar */}
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 vip-shimmer-aurora"
            style={{
              background: `linear-gradient(135deg, ${VIP_COLORS.lavandaAurora}, ${VIP_COLORS.lavandaIntensa})`
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Eliminando...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Eliminar</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default DeleteConfirmationModal;
