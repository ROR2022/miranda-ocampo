'use client'

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight, 
  SkipBack, 
  SkipForward,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CarouselControlsProps {
  // Estado del carrusel
  isPlaying: boolean;
  currentIndex: number;
  totalItems: number;
  progress: number;
  userHasStartedPlayback: boolean;
  
  // Controles de reproducción
  onTogglePlayback: () => void;
  onStop: () => void;
  
  // Navegación
  onNext: () => void;
  onPrevious: () => void;
  onGoToSlide: (index: number) => void;
  
  // Información de estado
  hasNext: boolean;
  hasPrevious: boolean;
  isFirstSlide: boolean;
  isLastSlide: boolean;
  
  // Configuración visual
  className?: string;
  showProgressBar?: boolean;
  showSlideIndicators?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'minimal';
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  isPlaying,
  currentIndex,
  totalItems,
  progress,
  userHasStartedPlayback,
  onTogglePlayback,
  onStop,
  onNext,
  onPrevious,
  onGoToSlide,
  hasNext,
  hasPrevious,
  isFirstSlide,
  isLastSlide,
  className,
  showProgressBar = true,
  showSlideIndicators = true,
  size = 'md',
  variant = 'default'
}) => {
  
  // Configuración de tamaños
  const sizeConfig = {
    sm: {
      button: 'h-8 w-8',
      playButton: 'h-10 w-10',
      icon: 'h-4 w-4',
      playIcon: 'h-5 w-5',
      text: 'text-xs',
      spacing: 'gap-1'
    },
    md: {
      button: 'h-10 w-10',
      playButton: 'h-12 w-12',
      icon: 'h-5 w-5',
      playIcon: 'h-6 w-6',
      text: 'text-sm',
      spacing: 'gap-2'
    },
    lg: {
      button: 'h-12 w-12',
      playButton: 'h-14 w-14',
      icon: 'h-6 w-6',
      playIcon: 'h-7 w-7',
      text: 'text-base',
      spacing: 'gap-3'
    }
  };

  const currentSize = sizeConfig[size];

  // Estilos del tema Aurora Pastel VIP
  const themeStyles = {
    primary: 'bg-gradient-to-r from-pink-300 to-purple-300 hover:from-pink-400 hover:to-purple-400',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20',
    accent: 'bg-yellow-200/30 hover:bg-yellow-200/50 border border-yellow-300/30'
  };

  /**
   * 🎮 Botón principal de reproducción
   */
  const PlayPauseButton = () => (
    <div className="relative group">
      <Button
        onClick={onTogglePlayback}
        className={cn(
          currentSize.playButton,
          'rounded-full shadow-lg transition-all duration-300 hover:scale-105',
          isPlaying 
            ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500' 
            : 'bg-gradient-to-r from-green-400 to-blue-400 hover:from-green-500 hover:to-blue-500',
          'border-2 border-white/30 backdrop-blur-sm'
        )}
        variant="ghost"
        title={isPlaying ? 'Pausar presentación' : 'Iniciar presentación'}
      >
        {isPlaying ? (
          <Pause className={cn(currentSize.playIcon, 'text-white')} />
        ) : (
          <Play className={cn(currentSize.playIcon, 'text-white ml-1')} />
        )}
      </Button>
      
      {/* Indicador de estado */}
      <div className="absolute -bottom-1 -right-1">
        <div className={cn(
          'w-3 h-3 rounded-full border-2 border-white',
          isPlaying ? 'bg-red-500 animate-pulse' : 'bg-green-500'
        )} />
      </div>
    </div>
  );

  /**
   * 🎯 Barra de progreso del carrusel
   */
  const ProgressBar = () => (
    <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm border border-white/20">
      <div 
        className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-100 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  /**
   * 🔢 Indicadores de slide
   */
  const SlideIndicators = () => (
    <div className={cn('flex items-center justify-center', currentSize.spacing)}>
      {Array.from({ length: totalItems }, (_, index) => (
        <button
          key={index}
          onClick={() => onGoToSlide(index)}
          className={cn(
            'w-2 h-2 rounded-full transition-all duration-200 hover:scale-125',
            index === currentIndex
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 w-4 h-2'
              : 'bg-white/30 hover:bg-white/50'
          )}
          title={`Ir a foto ${index + 1}`}
        />
      ))}
    </div>
  );

  /**
   * 📊 Información del slide actual
   */
  const SlideInfo = () => (
    <div className={cn(
      'text-white/80 font-medium text-center',
      currentSize.text
    )}>
      <span className="text-white">{currentIndex + 1}</span>
      <span className="text-white/60"> / </span>
      <span className="text-white/80">{totalItems}</span>
    </div>
  );

  // Renderizado según variante
  if (variant === 'minimal') {
    return (
      <div className={cn(
        'flex items-center justify-center',
        currentSize.spacing,
        className
      )}>
        <PlayPauseButton />
        {showSlideIndicators && totalItems > 1 && <SlideIndicators />}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex flex-col items-center gap-3 p-4 bg-black/20 backdrop-blur-md rounded-lg border border-white/20',
        className
      )}>
        <div className={cn('flex items-center', currentSize.spacing)}>
          <Button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={cn(
              currentSize.button,
              'rounded-full',
              themeStyles.secondary
            )}
            variant="ghost"
            title="Foto anterior"
          >
            <ChevronLeft className={currentSize.icon} />
          </Button>

          <PlayPauseButton />

          <Button
            onClick={onNext}
            disabled={!hasNext}
            className={cn(
              currentSize.button,
              'rounded-full',
              themeStyles.secondary
            )}
            variant="ghost"
            title="Foto siguiente"
          >
            <ChevronRight className={currentSize.icon} />
          </Button>
        </div>

        {showProgressBar && isPlaying && (
          <div className="w-full">
            <ProgressBar />
          </div>
        )}
      </div>
    );
  }

  // Variante default - controles completos
  return (
    <div className={cn(
      'flex flex-col items-center gap-4 p-6 bg-black/20 backdrop-blur-md rounded-xl border border-white/20 shadow-xl',
      className
    )}>
      {/* Información del slide */}
      <SlideInfo />

      {/* Barra de progreso */}
      {showProgressBar && isPlaying && (
        <div className="w-full">
          <ProgressBar />
        </div>
      )}

      {/* Controles principales */}
      <div className={cn('flex items-center', currentSize.spacing)}>
        {/* Ir al inicio */}
        <Button
          onClick={() => onGoToSlide(0)}
          disabled={isFirstSlide}
          className={cn(
            currentSize.button,
            'rounded-full',
            themeStyles.secondary
          )}
          variant="ghost"
          title="Primera foto"
        >
          <SkipBack className={currentSize.icon} />
        </Button>

        {/* Anterior */}
        <Button
          onClick={onPrevious}
          disabled={!hasPrevious}
          className={cn(
            currentSize.button,
            'rounded-full',
            themeStyles.secondary
          )}
          variant="ghost"
          title="Foto anterior"
        >
          <ChevronLeft className={currentSize.icon} />
        </Button>

        {/* Play/Pause principal */}
        <PlayPauseButton />

        {/* Siguiente */}
        <Button
          onClick={onNext}
          disabled={!hasNext}
          className={cn(
            currentSize.button,
            'rounded-full',
            themeStyles.secondary
          )}
          variant="ghost"
          title="Foto siguiente"
        >
          <ChevronRight className={currentSize.icon} />
        </Button>

        {/* Ir al final */}
        <Button
          onClick={() => onGoToSlide(totalItems - 1)}
          disabled={isLastSlide}
          className={cn(
            currentSize.button,
            'rounded-full',
            themeStyles.secondary
          )}
          variant="ghost"
          title="Última foto"
        >
          <SkipForward className={currentSize.icon} />
        </Button>
      </div>

      {/* Detener reproducción */}
      {userHasStartedPlayback && (
        <Button
          onClick={onStop}
          className={cn(
            'px-4 py-2 rounded-full',
            themeStyles.accent,
            currentSize.text
          )}
          variant="ghost"
          title="Detener y reiniciar"
        >
          <Square className={cn(currentSize.icon, 'mr-2')} />
          Detener
        </Button>
      )}

      {/* Indicadores de slide */}
      {showSlideIndicators && totalItems > 1 && (
        <SlideIndicators />
      )}

      {/* Ayuda de teclado */}
      <div className={cn(
        'text-center text-white/60 max-w-sm',
        currentSize.text
      )}>
        <p>Usa las flechas ← → o espaciador para controlar</p>
      </div>
    </div>
  );
};
