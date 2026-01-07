'use client';

import { useState, useCallback } from 'react';
import QRCode from 'qrcode';
import { QREventData } from '@/types/qrDownload.types';

interface QRGenerationOptions {
  size?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  darkColor?: string;
  lightColor?: string;
}

interface QRGenerationState {
  isGenerating: boolean;
  qrDataURL: string | null;
  error: string | null;
}

export const useQRGeneration = (eventData: QREventData) => {
  const [state, setState] = useState<QRGenerationState>({
    isGenerating: false,
    qrDataURL: null,
    error: null
  });

  const generateQR = useCallback(async (options: QRGenerationOptions = {}) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const {
        size = 300,
        margin = 1,
        errorCorrectionLevel = 'M',
        darkColor = '#000000',
        lightColor = '#FFFFFF'
      } = options;

      const qrDataURL = await QRCode.toDataURL(eventData.qrCodeUrl, {
        width: size,
        margin,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel
      });

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        qrDataURL 
      }));

      return qrDataURL;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generando QR';
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, [eventData.qrCodeUrl]);

  const generateCustomQR = useCallback(async (
    url: string, 
    options: QRGenerationOptions = {}
  ) => {
    setState(prev => ({ ...prev, isGenerating: true, error: null }));

    try {
      const {
        size = 300,
        margin = 1,
        errorCorrectionLevel = 'M',
        darkColor = '#000000',
        lightColor = '#FFFFFF'
      } = options;

      const qrDataURL = await QRCode.toDataURL(url, {
        width: size,
        margin,
        color: {
          dark: darkColor,
          light: lightColor
        },
        errorCorrectionLevel
      });

      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        qrDataURL 
      }));

      return qrDataURL;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error generando QR';
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: errorMessage 
      }));
      throw error;
    }
  }, []);

  const clearQR = useCallback(() => {
    setState({
      isGenerating: false,
      qrDataURL: null,
      error: null
    });
  }, []);

  return {
    isGenerating: state.isGenerating,
    qrDataURL: state.qrDataURL,
    qrCodeUrl: eventData.qrCodeUrl,
    error: state.error,
    generateQR,
    generateCustomQR,
    clearQR
  };
};
