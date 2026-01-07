'use client'

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Colores específicos para Modo Teatro
const THEATER_COLORS = {
  controls: 'rgba(255,255,255,0.1)',
  controlsHover: 'rgba(255,255,255,0.2)',
  controlsActive: 'rgba(233,30,99,0.3)', // Rosa Aurora semi-transparente
  text: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  accent: '#E91E63'
};

interface TheaterControlsProps {
  currentIndex: number;
  totalPhotos: number;
  onPrevious: () => void;
  onNext: () => void;
  autoPlay?: boolean;
  onToggleAutoPlay?: () => void;
  autoHide?: boolean;
}

const TheaterControls: React.FC<TheaterControlsProps> = ({
  currentIndex,
  totalPhotos,
  onPrevious,
  onNext,
  autoPlay = false,
  onToggleAutoPlay,
  autoHide = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Auto-hide functionality
  useEffect(() => {
    if (!autoHide) return;

    const handleActivity = () => {
      setIsVisible(true);
      setLastActivity(Date.now());
    };

    // Event listeners para detectar actividad
    const events = ['mousemove', 'keydown', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Timer para auto-hide
    const hideTimer = setInterval(() => {
      if (Date.now() - lastActivity > 3000) { // 3 segundos sin actividad
        setIsVisible(false);
      }
    }, 500);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      clearInterval(hideTimer);
    };
  }, [autoHide, lastActivity]);

  // Estilo base para botones
  const buttonBaseStyle = {
    backgroundColor: THEATER_COLORS.controls,
    color: THEATER_COLORS.text,
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  return (
    <div 
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 p-4 rounded-full transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{
        backgroundColor: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}
    >
      {/* Botón Anterior */}
      <button
        onClick={onPrevious}
        disabled={totalPhotos <= 1}
        className="p-3 rounded-full hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={buttonBaseStyle}
        onMouseEnter={(e) => {
          if (totalPhotos > 1) {
            e.currentTarget.style.backgroundColor = THEATER_COLORS.controlsHover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = THEATER_COLORS.controls;
        }}
        aria-label="Foto anterior"
      >
        <ChevronLeft size={28} />
      </button>

      {/* Contador de fotos */}
      <div 
        className="px-6 py-3 rounded-full text-center min-w-[120px]"
        style={{
          backgroundColor: THEATER_COLORS.controls,
          color: THEATER_COLORS.text,
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="text-lg font-bold">
          {currentIndex + 1} / {totalPhotos}
        </div>
        <div 
          className="text-xs mt-1"
          style={{ color: THEATER_COLORS.textSecondary }}
        >
          FOTOS
        </div>
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={onNext}
        disabled={totalPhotos <= 1}
        className="p-3 rounded-full hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={buttonBaseStyle}
        onMouseEnter={(e) => {
          if (totalPhotos > 1) {
            e.currentTarget.style.backgroundColor = THEATER_COLORS.controlsHover;
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = THEATER_COLORS.controls;
        }}
        aria-label="Siguiente foto"
      >
        <ChevronRight size={28} />
      </button>

      {/* Separador */}
      <div 
        className="w-px h-8 mx-2"
        style={{ backgroundColor: THEATER_COLORS.textSecondary }}
      />

      {/* 🎮 BOTÓN AUTO-PLAY */}
      {onToggleAutoPlay && (
        <button
          onClick={onToggleAutoPlay}
          className="p-3 rounded-full hover:scale-110 active:scale-95 transition-all duration-200"
          style={{
            ...buttonBaseStyle,
            backgroundColor: autoPlay ? THEATER_COLORS.controlsActive : THEATER_COLORS.controls
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = autoPlay 
              ? THEATER_COLORS.controlsActive 
              : THEATER_COLORS.controlsHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = autoPlay 
              ? THEATER_COLORS.controlsActive 
              : THEATER_COLORS.controls;
          }}
          aria-label={autoPlay ? "Pausar presentación" : "Iniciar presentación"}
        >
          {autoPlay ? (
            <span className="text-lg">⏸️</span>
          ) : (
            <span className="text-lg">▶️</span>
          )}
        </button>
      )}
    </div>
  );
};

export default TheaterControls;
