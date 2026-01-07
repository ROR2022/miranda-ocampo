'use client'

import React, { useState, useEffect } from 'react';
import { Settings, Accessibility, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CarouselSettingsButtonProps {
  onClick: () => void;
  hasUnsavedChanges?: boolean;
  shortcutsEnabled?: boolean;
  className?: string;
}

const VIP_COLORS = {
  rosaAurora: '#FFB3D9',
  lavandaAurora: '#E6D9FF',
  oroAurora: '#FFF2CC',
  blancoSeda: '#FDFCFC',
  rosaIntensa: '#FF8FD1'
};

export const CarouselSettingsButton: React.FC<CarouselSettingsButtonProps> = ({
  onClick,
  hasUnsavedChanges = false,
  shortcutsEnabled = true,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Mostrar tooltip la primera vez
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem('carousel-settings-tooltip-seen');
    if (!hasSeenTooltip) {
      setShowTooltip(true);
      setTimeout(() => {
        setShowTooltip(false);
        localStorage.setItem('carousel-settings-tooltip-seen', 'true');
      }, 3000);
    }
  }, []);

  // Efecto de pulso para cambios no guardados
  useEffect(() => {
    if (hasUnsavedChanges) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges]);

  // Atajos de teclado
  useEffect(() => {
    if (!shortcutsEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift + / para ayuda rápida
      if (event.shiftKey && event.key === '?') {
        event.preventDefault();
        setIsExpanded(true);
        setTimeout(() => setIsExpanded(false), 3000);
      }
      
      // Ctrl + , para abrir configuración
      if ((event.ctrlKey || event.metaKey) && event.key === ',') {
        event.preventDefault();
        onClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsEnabled, onClick]);

  return (
    <TooltipProvider>
      <div className={cn(
        'fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2',
        className
      )}>
        
        {/* Ayudas expandidas */}
        {isExpanded && (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border p-4 max-w-xs animate-in slide-in-from-bottom-2">
            <h4 className="font-semibold mb-2 text-sm" style={{ color: VIP_COLORS.rosaAurora }}>
              🎛️ Atajos del Carrusel
            </h4>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl + ,</kbd> Configuración</div>
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Espacio</kbd> Play/Pausa</div>
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">← →</kbd> Navegar</div>
              <div>• <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Shift + ?</kbd> Ayuda</div>
            </div>
          </div>
        )}

        {/* Botones de acceso rápido */}
        <div className="flex flex-col space-y-2">
          
          {/* Botón de ayuda rápida */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-10 h-10 rounded-full shadow-lg bg-white/90 hover:bg-white border-2"
                style={{ borderColor: VIP_COLORS.lavandaAurora }}
              >
                <HelpCircle className="w-4 h-4" style={{ color: VIP_COLORS.lavandaAurora }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Mostrar atajos de teclado</p>
            </TooltipContent>
          </Tooltip>

          {/* Botón de accesibilidad rápida */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Aplicar configuración de accesibilidad rápida
                  const event = new CustomEvent('carousel-quick-accessibility');
                  window.dispatchEvent(event);
                }}
                className="w-10 h-10 rounded-full shadow-lg bg-white/90 hover:bg-white border-2"
                style={{ borderColor: VIP_COLORS.oroAurora }}
              >
                <Accessibility className="w-4 h-4" style={{ color: VIP_COLORS.oroAurora }} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Configuración de accesibilidad</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Botón principal de configuración */}
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <Button
              onClick={onClick}
              className={cn(
                'relative w-14 h-14 rounded-full shadow-lg transition-all duration-300',
                'bg-gradient-to-r from-pink-500 to-purple-500',
                'hover:from-pink-600 hover:to-purple-600',
                'hover:scale-105 active:scale-95',
                showPulse && 'animate-pulse'
              )}
            >
              {/* Indicador de cambios no guardados */}
              {hasUnsavedChanges && (
                <Badge 
                  className="absolute -top-1 -right-1 w-3 h-3 p-0 bg-orange-500 border-2 border-white"
                  style={{ backgroundColor: '#F59E0B' }}
                >
                  <span className="sr-only">Cambios sin guardar</span>
                </Badge>
              )}
              
              <Settings className="w-6 h-6 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <div className="text-center">
              <p className="font-semibold">⚙️ Configuración del Carrusel</p>
              <p className="text-xs mt-1">
                Personaliza tu experiencia de visualización
              </p>
              {hasUnsavedChanges && (
                <p className="text-xs mt-1 text-orange-400">
                  ⚠️ Tienes cambios sin guardar
                </p>
              )}
              <p className="text-xs mt-2 opacity-75">
                Atajo: Ctrl + ,
              </p>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Indicador de funciones avanzadas */}
        <div className="flex items-center space-x-1 mt-2 opacity-60">
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          <span className="text-xs text-gray-500">Configuración avanzada</span>
          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
        </div>
      </div>
    </TooltipProvider>
  );
};
