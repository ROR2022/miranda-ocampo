'use client'

import React, { useState } from 'react';
import { 
  Monitor, 
  Smartphone, 
  Accessibility, 
  Zap, 
  Palette, 
  Clock,
  Save,
  RotateCcw,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Tipos de configuración
interface CarouselUserPreferences {
  autoPlayEnabled: boolean;
  playbackSpeed: number;
  loopEnabled: boolean;
  swipeEnabled: boolean;
  swipeSensitivity: 'low' | 'medium' | 'high';
  hapticFeedbackEnabled: boolean;
  showProgressBar: boolean;
  showSlideIndicators: boolean;
  feedbackStyle: 'minimal' | 'vibrant' | 'elegant';
  controlsVariant: 'default' | 'compact' | 'minimal';
  reducedMotion: boolean;
  highContrast: boolean;
  keyboardNavigationEnabled: boolean;
  screenReaderOptimized: boolean;
  showHints: boolean;
  autoHideHints: boolean;
  hasSeenTutorial: boolean;
  preloadImages: boolean;
  imageQuality: 'thumbnail' | 'compressed' | 'original';
  enableAnalytics: boolean;
  themeVariant: 'aurora' | 'minimal' | 'elegant';
  animationDuration: number;
}

interface CarouselSettingsProps {
  preferences: CarouselUserPreferences;
  onUpdatePreference: <K extends keyof CarouselUserPreferences>(
    key: K,
    value: CarouselUserPreferences[K]
  ) => void;
  onUpdateMultiple: (updates: Partial<CarouselUserPreferences>) => void;
  onSave: () => void;
  onReset: () => void;
  hasUnsavedChanges: boolean;
  className?: string;
}

const VIP_COLORS = {
  rosaAurora: '#FFB3D9',
  lavandaAurora: '#E6D9FF',
  oroAurora: '#FFF2CC',
  blancoSeda: '#FDFCFC',
  rosaIntensa: '#FF8FD1',
  lavandaIntensa: '#D9CAFF'
};

export const CarouselSettings: React.FC<CarouselSettingsProps> = ({
  preferences,
  onUpdatePreference,
  onUpdateMultiple,
  onSave,
  onReset,
  hasUnsavedChanges,
  className
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['playback']));
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  // Configuraciones predefinidas
  const presetConfigs: Record<string, Partial<CarouselUserPreferences>> = {
    beginner: {
      autoPlayEnabled: false,
      playbackSpeed: 3,
      swipeSensitivity: 'low' as const,
      showHints: true,
      controlsVariant: 'default' as const,
      reducedMotion: true
    },
    standard: {
      autoPlayEnabled: false,
      playbackSpeed: 2,
      swipeSensitivity: 'medium' as const,
      showHints: true,
      controlsVariant: 'compact' as const,
      reducedMotion: false
    },
    advanced: {
      autoPlayEnabled: true,
      playbackSpeed: 1.5,
      swipeSensitivity: 'high' as const,
      showHints: false,
      controlsVariant: 'minimal' as const,
      reducedMotion: false
    }
  };

  const applyPreset = (preset: keyof typeof presetConfigs) => {
    onUpdateMultiple(presetConfigs[preset]);
  };

  // Componente de sección colapsable
  const CollapsibleSection: React.FC<{
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, title, description, icon, children }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <Card className="mb-4">
        <CardHeader 
          className="cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection(id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${VIP_COLORS.lavandaAurora}20` }}>
                {icon}
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="pt-0">
            <Separator className="mb-6" />
            {children}
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className={cn('max-w-4xl mx-auto p-6', className)}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: VIP_COLORS.rosaAurora }}>
          ⚙️ Configuración del Carrusel
        </h2>
        <p className="text-gray-600">
          Personaliza tu experiencia de visualización de fotos
        </p>
        
        {hasUnsavedChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Tienes cambios sin guardar
            </p>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <Button
          onClick={onSave}
          disabled={!hasUnsavedChanges}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar Cambios
        </Button>
        
        <Button variant="outline" onClick={onReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Predeterminados
        </Button>
      </div>

      {/* Configuraciones predefinidas */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5" style={{ color: VIP_COLORS.rosaAurora }} />
            <span>Configuraciones Rápidas</span>
          </CardTitle>
          <CardDescription>
            Aplica configuraciones predefinidas según tu nivel de experiencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => applyPreset('beginner')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold mb-2">👶 Principiante</div>
              <div className="text-sm text-left text-gray-600">
                Controles simples, velocidad lenta, muchas ayudas
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => applyPreset('standard')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold mb-2">⚡ Estándar</div>
              <div className="text-sm text-left text-gray-600">
                Balance perfecto entre funcionalidad y simplicidad
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => applyPreset('advanced')}
              className="h-auto p-4 flex flex-col items-start"
            >
              <div className="font-semibold mb-2">🚀 Avanzado</div>
              <div className="text-sm text-left text-gray-600">
                Máximo control, velocidad rápida, mínimas ayudas
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuración detallada */}
      <div className="space-y-4">
        
        {/* Reproducción */}
        <CollapsibleSection
          id="playback"
          title="Reproducción"
          description="Configuración de reproducción automática y velocidad"
          icon={<Clock className="w-5 h-5" style={{ color: VIP_COLORS.rosaAurora }} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="autoplay">Reproducción automática</Label>
                <Switch
                  id="autoplay"
                  checked={preferences.autoPlayEnabled}
                  onCheckedChange={(checked) => onUpdatePreference('autoPlayEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="loop">Reproducción en bucle</Label>
                <Switch
                  id="loop"
                  checked={preferences.loopEnabled}
                  onCheckedChange={(checked) => onUpdatePreference('loopEnabled', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Velocidad de reproducción: {preferences.playbackSpeed}s</Label>
                <Slider
                  value={[preferences.playbackSpeed]}
                  onValueChange={([value]) => onUpdatePreference('playbackSpeed', value)}
                  min={0.5}
                  max={5}
                  step={0.5}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Gestos táctiles */}
        <CollapsibleSection
          id="touch"
          title="Gestos Táctiles"
          description="Configuración de navegación táctil y swipe"
          icon={<Smartphone className="w-5 h-5" style={{ color: VIP_COLORS.lavandaAurora }} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="swipe">Gestos de deslizamiento</Label>
                <Switch
                  id="swipe"
                  checked={preferences.swipeEnabled}
                  onCheckedChange={(checked) => onUpdatePreference('swipeEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="haptic">Vibración táctil</Label>
                <Switch
                  id="haptic"
                  checked={preferences.hapticFeedbackEnabled}
                  onCheckedChange={(checked) => onUpdatePreference('hapticFeedbackEnabled', checked)}
                />
              </div>
            </div>
            
            <div>
              <Label>Sensibilidad de gestos</Label>
              <Select
                value={preferences.swipeSensitivity}
                onValueChange={(value: 'low' | 'medium' | 'high') => onUpdatePreference('swipeSensitivity', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja - Gestos más largos</SelectItem>
                  <SelectItem value="medium">Media - Balance perfecto</SelectItem>
                  <SelectItem value="high">Alta - Gestos rápidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Interfaz */}
        <CollapsibleSection
          id="interface"
          title="Interfaz"
          description="Personalización visual y controles"
          icon={<Palette className="w-5 h-5" style={{ color: VIP_COLORS.oroAurora }} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="progress">Barra de progreso</Label>
                <Switch
                  id="progress"
                  checked={preferences.showProgressBar}
                  onCheckedChange={(checked) => onUpdatePreference('showProgressBar', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="indicators">Indicadores de posición</Label>
                <Switch
                  id="indicators"
                  checked={preferences.showSlideIndicators}
                  onCheckedChange={(checked) => onUpdatePreference('showSlideIndicators', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="hints">Mostrar ayudas</Label>
                <Switch
                  id="hints"
                  checked={preferences.showHints}
                  onCheckedChange={(checked) => onUpdatePreference('showHints', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Estilo de controles</Label>
                <Select
                  value={preferences.controlsVariant}
                  onValueChange={(value: 'default' | 'compact' | 'minimal') => onUpdatePreference('controlsVariant', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Completo - Todos los controles</SelectItem>
                    <SelectItem value="compact">Compacto - Controles esenciales</SelectItem>
                    <SelectItem value="minimal">Mínimo - Solo lo básico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Estilo visual</Label>
                <Select
                  value={preferences.feedbackStyle}
                  onValueChange={(value: 'minimal' | 'vibrant' | 'elegant') => onUpdatePreference('feedbackStyle', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">Mínimo - Discreto</SelectItem>
                    <SelectItem value="elegant">Elegante - Aurora VIP</SelectItem>
                    <SelectItem value="vibrant">Vibrante - Llamativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Accesibilidad */}
        <CollapsibleSection
          id="accessibility"
          title="Accesibilidad"
          description="Opciones para mejorar la experiencia de todos los usuarios"
          icon={<Accessibility className="w-5 h-5" style={{ color: VIP_COLORS.rosaIntensa }} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="reduced-motion">Reducir animaciones</Label>
                <Switch
                  id="reduced-motion"
                  checked={preferences.reducedMotion}
                  onCheckedChange={(checked) => onUpdatePreference('reducedMotion', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast">Alto contraste</Label>
                <Switch
                  id="high-contrast"
                  checked={preferences.highContrast}
                  onCheckedChange={(checked) => onUpdatePreference('highContrast', checked)}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="keyboard">Navegación por teclado</Label>
                <Switch
                  id="keyboard"
                  checked={preferences.keyboardNavigationEnabled}
                  onCheckedChange={(checked) => onUpdatePreference('keyboardNavigationEnabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="screen-reader">Lector de pantalla</Label>
                <Switch
                  id="screen-reader"
                  checked={preferences.screenReaderOptimized}
                  onCheckedChange={(checked) => onUpdatePreference('screenReaderOptimized', checked)}
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Rendimiento */}
        <CollapsibleSection
          id="performance"
          title="Rendimiento"
          description="Optimizaciones de carga y calidad de imagen"
          icon={<Monitor className="w-5 h-5" style={{ color: VIP_COLORS.lavandaIntensa }} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="preload">Precargar imágenes</Label>
                <Switch
                  id="preload"
                  checked={preferences.preloadImages}
                  onCheckedChange={(checked) => onUpdatePreference('preloadImages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="analytics">Métricas de uso</Label>
                <Switch
                  id="analytics"
                  checked={preferences.enableAnalytics}
                  onCheckedChange={(checked) => onUpdatePreference('enableAnalytics', checked)}
                />
              </div>
            </div>
            
            <div>
              <Label>Calidad de imagen</Label>
              <Select
                value={preferences.imageQuality}
                onValueChange={(value: 'thumbnail' | 'compressed' | 'original') => onUpdatePreference('imageQuality', value)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thumbnail">Miniatura - Rápida</SelectItem>
                  <SelectItem value="compressed">Comprimida - Balance</SelectItem>
                  <SelectItem value="original">Original - Máxima calidad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* Footer con información */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 mt-1" style={{ color: VIP_COLORS.lavandaAurora }} />
            <div>
              <h4 className="font-semibold mb-2">Información importante</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Los cambios se guardan automáticamente cada 30 segundos</li>
                <li>• Algunas configuraciones requieren recargar la página</li>
                <li>• Las preferencias se sincronizan entre dispositivos</li>
                <li>• Usa Shift+? en el carrusel para ver atajos de teclado</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
