'use client'

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Paleta Aurora Pastel VIP
const VIP_COLORS = {
  rosaAurora: '#FFB3D9',
  lavandaAurora: '#E6D9FF',
  oroAurora: '#FFF2CC',
  blancoSeda: '#FDFCFC',
  rosaIntensa: '#FF8FD1',
  lavandaIntensa: '#D9CAFF'
};

interface TouchFeedbackOverlayProps {
  showLeftFeedback: boolean;
  showRightFeedback: boolean;
  feedbackIntensity: number; // 0-1
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  style?: 'minimal' | 'vibrant' | 'elegant';
}

export const TouchFeedbackOverlay: React.FC<TouchFeedbackOverlayProps> = ({
  showLeftFeedback,
  showRightFeedback,
  feedbackIntensity,
  className,
  size = 'md',
  style = 'elegant'
}) => {
  
  // Configuración de tamaños
  const sizeConfig = {
    sm: { width: 40, height: 40, iconSize: 16 },
    md: { width: 60, height: 60, iconSize: 24 },
    lg: { width: 80, height: 80, iconSize: 32 }
  };

  const currentSize = sizeConfig[size];

  // No mostrar si no hay feedback activo
  if (!showLeftFeedback && !showRightFeedback) {
    return null;
  }

  // Calcular propiedades basadas en la intensidad
  const opacity = feedbackIntensity * 0.9;
  const scale = 0.7 + (feedbackIntensity * 0.4); // Escala de 0.7 a 1.1
  const blur = Math.max(20 - (feedbackIntensity * 10), 5); // Menos blur = más intensidad

  // Estilos según el tema
  const getStyleVariant = () => {
    switch (style) {
      case 'minimal':
        return {
          background: showLeftFeedback 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          iconColor: showLeftFeedback ? VIP_COLORS.rosaIntensa : VIP_COLORS.lavandaIntensa
        };
      
      case 'vibrant':
        return {
          background: showLeftFeedback 
            ? `linear-gradient(135deg, ${VIP_COLORS.rosaAurora}, ${VIP_COLORS.rosaIntensa})` 
            : `linear-gradient(135deg, ${VIP_COLORS.lavandaAurora}, ${VIP_COLORS.lavandaIntensa})`,
          border: '2px solid rgba(255, 255, 255, 0.8)',
          iconColor: 'white'
        };
      
      case 'elegant':
      default:
        return {
          background: showLeftFeedback 
            ? `linear-gradient(135deg, rgba(255, 179, 217, 0.8), rgba(255, 143, 209, 0.9))` 
            : `linear-gradient(135deg, rgba(230, 217, 255, 0.8), rgba(217, 202, 255, 0.9))`,
          border: '2px solid rgba(255, 255, 255, 0.6)',
          iconColor: 'white'
        };
    }
  };

  const styleVariant = getStyleVariant();

  // Componente de feedback individual
  const FeedbackIndicator = ({ isLeft }: { isLeft: boolean }) => (
    <div
      className={cn(
        'absolute top-1/2 flex items-center justify-center rounded-full transition-all duration-150 ease-out pointer-events-none z-50',
        isLeft ? 'left-6' : 'right-6',
        className
      )}
      style={{
        width: `${currentSize.width}px`,
        height: `${currentSize.height}px`,
        transform: `translateY(-50%) scale(${scale})`,
        opacity,
        background: styleVariant.background,
        border: styleVariant.border,
        backdropFilter: `blur(${blur}px)`,
        boxShadow: `0 8px 32px rgba(0, 0, 0, ${0.1 + feedbackIntensity * 0.2})`
      }}
    >
      {/* Icono principal */}
      {isLeft ? (
        <ChevronLeft 
          size={currentSize.iconSize} 
          style={{ color: styleVariant.iconColor }}
          className="drop-shadow-sm"
        />
      ) : (
        <ChevronRight 
          size={currentSize.iconSize} 
          style={{ color: styleVariant.iconColor }}
          className="drop-shadow-sm"
        />
      )}

      {/* Anillo de progreso para feedback intenso */}
      {feedbackIntensity > 0.5 && (
        <div 
          className="absolute inset-0 rounded-full border-2 animate-pulse"
          style={{
            borderColor: `rgba(255, 255, 255, ${feedbackIntensity * 0.8})`,
            borderTopColor: 'transparent',
            animation: `spin ${1 - feedbackIntensity * 0.5}s linear infinite`
          }}
        />
      )}

      {/* Partículas de feedback para intensidad máxima */}
      {feedbackIntensity > 0.8 && (
        <>
          <div 
            className="absolute w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor: styleVariant.iconColor,
              top: '10%',
              left: '20%',
              animationDelay: '0ms'
            }}
          />
          <div 
            className="absolute w-1 h-1 rounded-full animate-ping"
            style={{
              backgroundColor: styleVariant.iconColor,
              bottom: '15%',
              right: '25%',
              animationDelay: '150ms'
            }}
          />
          <div 
            className="absolute w-1.5 h-1.5 rounded-full animate-ping"
            style={{
              backgroundColor: styleVariant.iconColor,
              top: '60%',
              left: '10%',
              animationDelay: '300ms'
            }}
          />
        </>
      )}
    </div>
  );

  return (
    <>
      {showLeftFeedback && <FeedbackIndicator isLeft={true} />}
      {showRightFeedback && <FeedbackIndicator isLeft={false} />}
      
      {/* Overlay sutil para indicar área de swipe activa */}
      {feedbackIntensity > 0.3 && (
        <div 
          className="absolute inset-0 pointer-events-none z-40"
          style={{
            background: showLeftFeedback 
              ? `linear-gradient(to right, rgba(255, 179, 217, ${feedbackIntensity * 0.1}), transparent 30%)`
              : `linear-gradient(to left, rgba(230, 217, 255, ${feedbackIntensity * 0.1}), transparent 30%)`,
            transition: 'background 0.1s ease-out'
          }}
        />
      )}
    </>
  );
};

/**
 * 🎯 Componente de ayuda para primeros usos
 */
interface SwipeHintProps {
  show: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const SwipeHint: React.FC<SwipeHintProps> = ({
  show,
  onDismiss,
  className
}) => {
  if (!show) return null;

  return (
    <div className={cn(
      'absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-md rounded-xl px-4 py-3 z-50 pointer-events-auto',
      className
    )}>
      <div className="flex items-center space-x-3 text-white text-sm">
        <div className="flex items-center space-x-1">
          <ChevronLeft size={16} className="text-pink-300" />
          <span>Desliza</span>
          <ChevronRight size={16} className="text-purple-300" />
        </div>
        <span className="text-white/70">para navegar</span>
        {onDismiss && (
          <button 
            onClick={onDismiss}
            className="text-white/50 hover:text-white/80 ml-2"
          >
            ✕
          </button>
        )}
      </div>
      
      {/* Animación de deslizamiento */}
      <div className="flex justify-center mt-2 space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1 h-1 bg-white/40 rounded-full animate-pulse"
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * 📱 Wrapper principal para gestos táctiles
 */
interface TouchSwipeWrapperProps {
  children: React.ReactNode;
  swipeLeftFeedback: boolean;
  swipeRightFeedback: boolean;
  feedbackIntensity: number;
  showHint?: boolean;
  onDismissHint?: () => void;
  className?: string;
  feedbackStyle?: 'minimal' | 'vibrant' | 'elegant';
  feedbackSize?: 'sm' | 'md' | 'lg';
}

export const TouchSwipeWrapper: React.FC<TouchSwipeWrapperProps> = ({
  children,
  swipeLeftFeedback,
  swipeRightFeedback,
  feedbackIntensity,
  showHint = false,
  onDismissHint,
  className,
  feedbackStyle = 'elegant',
  feedbackSize = 'md'
}) => {
  return (
    <div className={cn('relative touch-none select-none', className)}>
      {children}
      
      <TouchFeedbackOverlay
        showLeftFeedback={swipeLeftFeedback}
        showRightFeedback={swipeRightFeedback}
        feedbackIntensity={feedbackIntensity}
        style={feedbackStyle}
        size={feedbackSize}
      />
      
      <SwipeHint 
        show={showHint}
        onDismiss={onDismissHint}
      />
    </div>
  );
};
