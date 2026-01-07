'use client'

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Grid3X3, Play, Maximize2, RefreshCw, Upload, Settings } from 'lucide-react';

// Paleta Aurora VIP - colores heredados del componente principal
const VIP_COLORS = {
  rosaAurora: '#E91E63',
  lavandaAurora: '#9C27B0',
  oroAurora: '#FF9800',
  blancoSeda: '#FFFFFF',
  cremaSuave: '#F5F5F5',
  rosaIntensa: '#C2185B',
  lavandaIntensa: '#7B1FA2',
  oroIntensio: '#F57C00',
  rosaDelicada: '#F8BBD9'
};

interface GalleryControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewMode: 'grid' | 'carousel';
  onViewModeChange: (mode: 'grid' | 'carousel') => void;
  onOpenTheaterMode: () => void;
  onRefresh: () => void;
  loading: boolean;
  photosCount: number;
}

const GalleryControlsModal: React.FC<GalleryControlsModalProps> = ({
  isOpen,
  onClose,
  viewMode,
  onViewModeChange,
  onOpenTheaterMode,
  onRefresh,
  loading,
  photosCount
}) => {
  // ESC key para cerrar modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevenir scroll del body cuando modal está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose} // Click fuera para cerrar
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{
          background: `linear-gradient(135deg, ${VIP_COLORS.blancoSeda} 0%, ${VIP_COLORS.cremaSuave} 100%)`,
        }}
        onClick={(e) => e.stopPropagation()} // Prevenir cierre al click dentro
      >
        {/* Header del Modal */}
        <div 
          className="flex items-center justify-between p-6 border-b border-gray-200"
          style={{ borderColor: VIP_COLORS.rosaDelicada }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: VIP_COLORS.rosaAurora }}
            >
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h3 
                className="text-xl font-semibold"
                style={{ color: VIP_COLORS.rosaAurora }}
              >
                Controles de Galería
              </h3>
              <p 
                className="text-sm"
                style={{ color: VIP_COLORS.lavandaIntensa }}
              >
                {photosCount} fotos disponibles
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar controles"
          >
            <X size={24} style={{ color: VIP_COLORS.rosaAurora }} />
          </button>
        </div>

        {/* Contenido del Modal */}
        <div className="p-6 space-y-6">
          
          {/* 🎭 SECCIÓN: MODOS DE VISTA */}
          <div className="space-y-3">
            <h4 
              className="text-lg font-medium flex items-center space-x-2"
              style={{ color: VIP_COLORS.lavandaAurora }}
            >
              <span>🎭</span>
              <span>Modos de Vista</span>
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Vista Grid */}
              <button
                onClick={() => {
                  onViewModeChange('grid');
                  onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  viewMode === 'grid' ? 'shadow-lg' : 'hover:shadow-md'
                }`}
                style={{
                  borderColor: VIP_COLORS.oroAurora,
                  backgroundColor: viewMode === 'grid' ? VIP_COLORS.rosaAurora : 'transparent',
                  color: viewMode === 'grid' ? 'white' : VIP_COLORS.rosaAurora
                }}
              >
                <div className="flex items-center space-x-3">
                  <Grid3X3 size={20} />
                  <div className="text-left">
                    <div className="font-medium">Vista Grid</div>
                    <div className="text-sm opacity-75">Galería en cuadrícula</div>
                  </div>
                </div>
                {viewMode === 'grid' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </button>

              {/* Vista Carrusel */}
              <button
                onClick={() => {
                  onViewModeChange('carousel');
                  onClose();
                }}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  viewMode === 'carousel' ? 'shadow-lg' : 'hover:shadow-md'
                }`}
                style={{
                  borderColor: VIP_COLORS.oroAurora,
                  backgroundColor: viewMode === 'carousel' ? VIP_COLORS.rosaAurora : 'transparent',
                  color: viewMode === 'carousel' ? 'white' : VIP_COLORS.rosaAurora
                }}
              >
                <div className="flex items-center space-x-3">
                  <Play size={20} />
                  <div className="text-left">
                    <div className="font-medium">Vista Carrusel</div>
                    <div className="text-sm opacity-75">Presentación deslizante</div>
                  </div>
                </div>
                {viewMode === 'carousel' && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </button>

              {/* Modo Teatro */}
              <button
                onClick={() => {
                  onOpenTheaterMode();
                  onClose();
                }}
                disabled={photosCount === 0}
                className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                style={{
                  borderColor: VIP_COLORS.lavandaAurora,
                  color: VIP_COLORS.lavandaAurora,
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center space-x-3">
                  <Maximize2 size={20} />
                  <div className="text-left">
                    <div className="font-medium">Modo Teatro</div>
                    <div className="text-sm opacity-75">Vista inmersiva completa</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Separador */}
          <div 
            className="h-px"
            style={{ backgroundColor: VIP_COLORS.rosaDelicada }}
          ></div>

          {/* 🔄 SECCIÓN: ACCIONES */}
          <div className="space-y-3">
            <h4 
              className="text-lg font-medium flex items-center space-x-2"
              style={{ color: VIP_COLORS.lavandaAurora }}
            >
              <span>🔄</span>
              <span>Acciones</span>
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Actualizar Galería */}
              <button
                onClick={() => {
                  onRefresh();
                  onClose();
                }}
                disabled={loading}
                className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50"
                style={{
                  borderColor: VIP_COLORS.oroAurora,
                  color: VIP_COLORS.rosaAurora,
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center space-x-3">
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                  <div className="text-left">
                    <div className="font-medium">
                      {loading ? 'Actualizando...' : 'Actualizar Galería'}
                    </div>
                    <div className="text-sm opacity-75">Buscar nuevas fotos</div>
                  </div>
                </div>
              </button>

              {/* Subir Fotos */}
              <Link
                href="/fotos"
                onClick={onClose}
                className="flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                style={{
                  borderColor: VIP_COLORS.lavandaAurora,
                  color: VIP_COLORS.lavandaAurora,
                  backgroundColor: 'transparent'
                }}
              >
                <div className="flex items-center space-x-3">
                  <Upload size={20} />
                  <div className="text-left">
                    <div className="font-medium">Subir Fotos</div>
                    <div className="text-sm opacity-75">Agregar nuevas imágenes</div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer opcional */}
        <div 
          className="px-6 py-4 text-center text-sm border-t"
          style={{ 
            backgroundColor: VIP_COLORS.cremaSuave,
            borderColor: VIP_COLORS.rosaDelicada,
            color: VIP_COLORS.lavandaIntensa
          }}
        >
          Presiona ESC para cerrar
        </div>
      </div>
    </div>
  );
};

export default GalleryControlsModal;