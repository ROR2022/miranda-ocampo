'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { CarouselSettings } from './CarouselSettings';
import { useCarouselSettings } from '../hooks/useCarouselSettings';
import { cn } from '@/lib/utils';

interface CarouselSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const VIP_COLORS = {
  rosaAurora: '#FFB3D9',
  lavandaAurora: '#E6D9FF',
  oroAurora: '#FFF2CC',
  blancoSeda: '#FDFCFC'
};

export const CarouselSettingsModal: React.FC<CarouselSettingsModalProps> = ({
  isOpen,
  onClose,
  className
}) => {
  const {
    preferences,
    hasUnsavedChanges,
    updatePreference,
    updateMultiple,
    saveChanges,
    resetToDefaults,
    exportSettings,
    importSettings
  } = useCarouselSettings();

  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportedSettings, setExportedSettings] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Manejar guardado con feedback
  const handleSave = useCallback(async () => {
    setSaveStatus('saving');
    try {
      await saveChanges();
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
        console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  }, [saveChanges]);

  // Manejar reset con confirmación
  const handleReset = useCallback(() => {
    if (window.confirm('¿Estás seguro de que quieres restaurar todas las configuraciones a sus valores predeterminados?')) {
      resetToDefaults();
    }
  }, [resetToDefaults]);

  // Manejar exportación
  const handleExport = () => {
    const settings = exportSettings();
    setExportedSettings(settings);
    setShowExportDialog(true);
  };

  // Manejar importación
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importSettings(content)) {
        setImportError(null);
        // Mostrar confirmación
        alert('Configuración importada exitosamente');
      } else {
        setImportError('El archivo no tiene un formato válido');
      }
    };
    reader.readAsText(file);
    
    // Limpiar el input
    event.target.value = '';
  };

  // Copiar configuración al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedSettings);
      alert('Configuración copiada al portapapeles');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  // Descargar configuración como archivo
  const downloadSettings = () => {
    const blob = new Blob([exportedSettings], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carousel-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Manejar cierre con confirmación si hay cambios
  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar sin guardar?'
      );
      if (!shouldClose) return;
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            if (hasUnsavedChanges) {
              handleSave();
            }
            break;
          case 'r':
            event.preventDefault();
            handleReset();
            break;
        }
      }

      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasUnsavedChanges, handleClose, handleReset, handleSave]);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={cn(
          'max-w-6xl max-h-[90vh] overflow-y-auto',
          'bg-gradient-to-br from-white to-purple-50',
          className
        )}>
          <DialogHeader className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${VIP_COLORS.lavandaAurora}20` }}
                >
                  <Settings className="w-6 h-6" style={{ color: VIP_COLORS.rosaAurora }} />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">
                    Configuración del Carrusel
                  </DialogTitle>
                  <DialogDescription>
                    Personaliza la experiencia de visualización según tus preferencias
                  </DialogDescription>
                </div>
              </div>
              
              {/* Indicadores de estado */}
              <div className="flex items-center space-x-2">
                {hasUnsavedChanges && (
                  <Badge variant="outline" className="text-orange-600 border-orange-300">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Sin guardar
                  </Badge>
                )}
                
                {saveStatus === 'saved' && (
                  <Badge variant="outline" className="text-green-600 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Guardado
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Barra de acciones */}
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
              <Button
                onClick={handleSave}
                disabled={!hasUnsavedChanges || saveStatus === 'saving'}
                size="sm"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveStatus === 'saving' ? 'Guardando...' : 'Guardar'}
              </Button>
              
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
              
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              
              <div className="relative">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="import-settings"
                />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <label htmlFor="import-settings" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar
                  </label>
                </Button>
              </div>
            </div>
            
            {/* Error de importación */}
            {importError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                  ❌ {importError}
                </p>
              </div>
            )}
            
            {/* Atajos de teclado */}
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 mt-0.5 text-blue-500" />
                <div className="text-sm text-blue-700">
                  <strong>Atajos:</strong> Ctrl+S (Guardar), Ctrl+R (Restaurar), Esc (Cerrar)
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Componente de configuración */}
          <CarouselSettings
            preferences={preferences}
            onUpdatePreference={updatePreference}
            onUpdateMultiple={updateMultiple}
            onSave={handleSave}
            onReset={handleReset}
            hasUnsavedChanges={hasUnsavedChanges}
            className="mt-6"
          />
        </DialogContent>
      </Dialog>

      {/* Modal de exportación */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Exportar Configuración</DialogTitle>
            <DialogDescription>
              Copia la configuración o descárgala como archivo JSON
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Configuración en formato JSON:
              </label>
              <textarea
                value={exportedSettings}
                readOnly
                className="w-full h-64 p-3 border rounded-lg font-mono text-sm bg-gray-50"
                style={{ resize: 'vertical' }}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={copyToClipboard} variant="outline">
                📋 Copiar al portapapeles
              </Button>
              <Button onClick={downloadSettings} variant="outline">
                💾 Descargar archivo
              </Button>
              <Button 
                onClick={() => setShowExportDialog(false)}
                className="ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
