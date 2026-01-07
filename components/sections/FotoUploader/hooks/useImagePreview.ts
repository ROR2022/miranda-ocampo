// 📸 useImagePreview - Hook para manejar previews de imágenes

import { useState, useCallback, useEffect } from 'react';
import { UseImagePreviewReturn } from '../types/upload.types';

/**
 * Hook para generar y manejar previews de imágenes
 */
export const useImagePreview = (): UseImagePreviewReturn => {
  const [previews, setPreviews] = useState<Record<string, string>>({});

  /**
   * Genera un preview URL para un archivo
   */
  const generatePreview = useCallback((file: File): string => {
    const previewUrl = URL.createObjectURL(file);
    const fileId = `${file.name}_${file.lastModified}`;
    
    setPreviews(prev => ({
      ...prev,
      [fileId]: previewUrl
    }));
    
    return previewUrl;
  }, []);

  /**
   * Limpia un preview específico
   */
  const cleanupPreview = useCallback((fileId: string) => {
    setPreviews(prev => {
      const previewUrl = prev[fileId];
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fileId]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  /**
   * Limpia todos los previews
   */
  const cleanupAllPreviews = useCallback(() => {
    Object.values(previews).forEach(url => {
      URL.revokeObjectURL(url);
    });
    setPreviews({});
  }, [previews]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      cleanupAllPreviews();
    };
  }, [cleanupAllPreviews]);

  return {
    previews,
    generatePreview,
    cleanupPreview,
    cleanupAllPreviews
  };
};
