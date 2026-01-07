'use client'

import React from 'react';
import { Play, Pause } from 'lucide-react';
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

interface AdvancedProgressIndicatorProps {
  // Estado del carrusel
  currentIndex: number;
  totalItems: number;
  progress: number; // 0-100
  isPlaying: boolean;
  
  // Configuración visual
  variant?: 'circular' | 'linear' | 'minimal' | 'ring';
  size?: 'sm' | 'md' | 'lg';
  showNumbers?: boolean;
  showTime?: boolean;
  showThumbnails?: boolean;
  
  // Datos opcionales
  photoTitles?: string[];
  photoThumbnails?: string[];
  timeRemaining?: number; // segundos
  totalDuration?: number; // segundos
  
  // Interactividad
  onGoToSlide?: (index: number) => void;
  onTogglePlayback?: () => void;
  
  // Configuración
  className?: string;
  reducedMotion?: boolean;
  highContrast?: boolean;
}

export const AdvancedProgressIndicator: React.FC<AdvancedProgressIndicatorProps> = ({
  currentIndex,
  totalItems,
  progress,
  isPlaying,
  variant = 'linear',
  size = 'md',
  showNumbers = true,
  showTime = false,
  photoTitles = [],
  timeRemaining = 0,
  totalDuration = 0,
  onGoToSlide,
  onTogglePlayback,
  className,
  reducedMotion = false,
  highContrast = false
}) => {

  // Configuración de tamaños
  const sizeConfig = {
    sm: { height: 4, circleSize: 40, thumbnailSize: 32, fontSize: 'text-xs' },
    md: { height: 6, circleSize: 60, thumbnailSize: 48, fontSize: 'text-sm' },
    lg: { height: 8, circleSize: 80, thumbnailSize: 64, fontSize: 'text-base' }
  };

  const currentSize = sizeConfig[size];

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Estilos según configuración de accesibilidad
  const getAccessibilityStyles = () => {
    const baseStyles = {
      transition: reducedMotion ? 'none' : 'all 0.3s ease',
      animation: reducedMotion ? 'none' : undefined
    };

    if (highContrast) {
      return {
        ...baseStyles,
        filter: 'contrast(1.5)',
        border: '2px solid #000'
      };
    }

    return baseStyles;
  };

  /**
   * 🔵 Indicador Circular
   */
  const CircularProgress = () => {
    const radius = (currentSize.circleSize - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <svg 
          width={currentSize.circleSize} 
          height={currentSize.circleSize}
          className="transform -rotate-90"
          style={getAccessibilityStyles()}
        >
          {/* Círculo de fondo */}
          <circle
            cx={currentSize.circleSize / 2}
            cy={currentSize.circleSize / 2}
            r={radius}
            stroke={`${VIP_COLORS.oroAurora}40`}
            strokeWidth="4"
            fill="transparent"
          />
          
          {/* Círculo de progreso */}
          <circle
            cx={currentSize.circleSize / 2}
            cy={currentSize.circleSize / 2}
            r={radius}
            stroke={isPlaying ? VIP_COLORS.rosaAurora : VIP_COLORS.lavandaAurora}
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: reducedMotion ? 'none' : 'stroke-dashoffset 0.1s ease'
            }}
          />
        </svg>
        
        {/* Contenido central */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showNumbers && (
            <span className={cn(currentSize.fontSize, 'font-bold')} style={{ color: VIP_COLORS.rosaIntensa }}>
              {currentIndex + 1}
            </span>
          )}
          {showNumbers && (
            <span className={cn(currentSize.fontSize, 'opacity-70')} style={{ color: VIP_COLORS.lavandaIntensa }}>
              /{totalItems}
            </span>
          )}
          {showTime && timeRemaining > 0 && (
            <span className="text-xs opacity-60" style={{ color: VIP_COLORS.rosaIntensa }}>
              {formatTime(timeRemaining)}
            </span>
          )}
        </div>

        {/* Botón central */}
        {onTogglePlayback && (
          <button
            onClick={onTogglePlayback}
            className="absolute inset-0 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            aria-label={isPlaying ? 'Pausar presentación' : 'Iniciar presentación'}
          >
            {isPlaying ? (
              <Pause size={16} style={{ color: VIP_COLORS.rosaAurora }} />
            ) : (
              <Play size={16} style={{ color: VIP_COLORS.lavandaAurora }} />
            )}
          </button>
        )}
      </div>
    );
  };

  /**
   * 📏 Indicador Lineal
   */
  const LinearProgress = () => (
    <div className={cn('w-full', className)} style={getAccessibilityStyles()}>
      {/* Información superior */}
      {(showNumbers || showTime) && (
        <div className="flex justify-between items-center mb-2">
          {showNumbers && (
            <span className={cn(currentSize.fontSize, 'font-medium')} style={{ color: VIP_COLORS.rosaIntensa }}>
              Foto {currentIndex + 1} de {totalItems}
            </span>
          )}
          
          {showTime && (
            <div className={cn(currentSize.fontSize, 'flex items-center space-x-2 opacity-70')} style={{ color: VIP_COLORS.lavandaIntensa }}>
              {timeRemaining > 0 && <span>{formatTime(timeRemaining)}</span>}
              {totalDuration > 0 && <span>/ {formatTime(totalDuration)}</span>}
            </div>
          )}
        </div>
      )}

      {/* Barra de progreso principal */}
      <div 
        className="w-full bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/30"
        style={{ height: currentSize.height }}
      >
        <div 
          className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 rounded-full transition-all duration-300 ease-out relative"
          style={{ 
            width: `${progress}%`,
            transition: reducedMotion ? 'none' : 'width 0.1s ease-out'
          }}
        >
          {/* Efecto de brillo animado */}
          {!reducedMotion && isPlaying && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
              style={{ borderRadius: 'inherit' }}
            />
          )}
        </div>
      </div>

      {/* Título de foto actual */}
      {photoTitles[currentIndex] && (
        <div className={cn('mt-2 text-center', currentSize.fontSize)} style={{ color: VIP_COLORS.rosaAurora }}>
          <span className="font-medium">{photoTitles[currentIndex]}</span>
        </div>
      )}
    </div>
  );

  /**
   * 💫 Indicador Minimal
   */
  const MinimalProgress = () => (
    <div className={cn('flex items-center space-x-3', className)} style={getAccessibilityStyles()}>
      {/* Dots indicadores */}
      <div className="flex space-x-1">
        {Array.from({ length: Math.min(totalItems, 8) }, (_, index) => {
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <button
              key={index}
              onClick={() => onGoToSlide?.(index)}
              className={cn(
                'rounded-full transition-all duration-200',
                isActive ? 'w-6 h-3' : 'w-3 h-3'
              )}
              style={{
                backgroundColor: isCompleted 
                  ? VIP_COLORS.rosaAurora 
                  : isActive 
                    ? VIP_COLORS.lavandaAurora 
                    : `${VIP_COLORS.oroAurora}40`,
                transition: reducedMotion ? 'none' : 'all 0.2s ease'
              }}
              aria-label={`Ir a foto ${index + 1}`}
            />
          );
        })}
        
        {totalItems > 8 && (
          <span className={cn(currentSize.fontSize, 'ml-2')} style={{ color: VIP_COLORS.lavandaIntensa }}>
            +{totalItems - 8}
          </span>
        )}
      </div>

      {/* Progreso de slide actual */}
      {isPlaying && (
        <div 
          className="w-8 h-1 bg-white/20 rounded-full overflow-hidden"
          aria-label="Progreso de slide actual"
        >
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"
            style={{ 
              width: `${progress}%`,
              transition: reducedMotion ? 'none' : 'width 0.1s ease'
            }}
          />
        </div>
      )}
    </div>
  );

  /**
   * 💍 Indicador Ring
   */
  const RingProgress = () => {
    const rings = Math.min(totalItems, 10);
    const anglePerRing = 360 / rings;
    
    return (
      <div className={cn('relative', className)} style={getAccessibilityStyles()}>
        <div 
          className="relative"
          style={{ 
            width: currentSize.circleSize, 
            height: currentSize.circleSize 
          }}
        >
          {Array.from({ length: rings }, (_, index) => {
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const angle = index * anglePerRing - 90; // -90 para empezar arriba
            
            const radius = (currentSize.circleSize - 16) / 2;
            const x = Math.cos(angle * Math.PI / 180) * radius + currentSize.circleSize / 2;
            const y = Math.sin(angle * Math.PI / 180) * radius + currentSize.circleSize / 2;
            
            return (
              <button
                key={index}
                onClick={() => onGoToSlide?.(index)}
                className="absolute w-3 h-3 rounded-full transition-all duration-200 hover:scale-125"
                style={{
                  left: x - 6,
                  top: y - 6,
                  backgroundColor: isCompleted 
                    ? VIP_COLORS.rosaAurora 
                    : isActive 
                      ? VIP_COLORS.lavandaAurora 
                      : `${VIP_COLORS.oroAurora}60`,
                  transform: isActive ? 'scale(1.5)' : 'scale(1)',
                  transition: reducedMotion ? 'none' : 'all 0.2s ease'
                }}
                aria-label={`Foto ${index + 1}`}
              />
            );
          })}
          
          {/* Centro con progreso */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div 
              className="w-8 h-8 rounded-full border-4 border-transparent"
              style={{
                borderTopColor: isPlaying ? VIP_COLORS.rosaAurora : VIP_COLORS.lavandaAurora,
                transform: `rotate(${(progress / 100) * 360}deg)`,
                transition: reducedMotion ? 'none' : 'transform 0.1s ease'
              }}
            />
          </div>
        </div>
        
        {totalItems > rings && (
          <div className={cn('text-center mt-2', currentSize.fontSize)} style={{ color: VIP_COLORS.lavandaIntensa }}>
            +{totalItems - rings} más
          </div>
        )}
      </div>
    );
  };

  // Renderizar según variante
  switch (variant) {
    case 'circular':
      return <CircularProgress />;
    case 'minimal':
      return <MinimalProgress />;
    case 'ring':
      return <RingProgress />;
    case 'linear':
    default:
      return <LinearProgress />;
  }
};
