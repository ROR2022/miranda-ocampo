// 🔧 Utilidades para el escáner de códigos QR

import QrScanner from 'qr-scanner';
import { CameraPermission, ERROR_MESSAGES } from '@/components/sections/QRCode/ReadQR.types';

/**
 * Verifica si el dispositivo tiene cámara disponible
 */
export const checkCameraAvailability = async (): Promise<boolean> => {
  try {
    const cameras = await QrScanner.listCameras(true);
    return cameras.length > 0;
  } catch (error) {
    console.error('Error verificando disponibilidad de cámara:', error);
    return false;
  }
};

/**
 * Verifica los permisos de cámara
 */
export const checkCameraPermissions = async (): Promise<CameraPermission> => {
  try {
    // Verificar si la API de permisos está disponible
    if (!navigator.permissions) {
      return {
        granted: false,
        denied: false,
        prompt: true,
        unavailable: false
      };
    }

    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
    
    return {
      granted: permission.state === 'granted',
      denied: permission.state === 'denied',
      prompt: permission.state === 'prompt',
      unavailable: false
    };
  } catch (error) {
    console.error('Error verificando permisos de cámara:', error);
    return {
      granted: false,
      denied: false,
      prompt: true,
      unavailable: true
    };
  }
};

/**
 * Solicita permisos de cámara
 */
export const requestCameraPermissions = async (): Promise<boolean> => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        facingMode: 'environment' // Preferir cámara trasera
      } 
    });
    
    // Cerrar el stream inmediatamente, solo necesitábamos verificar permisos
    stream.getTracks().forEach(track => track.stop());
    
    return true;
  } catch (error) {
    console.error('Error solicitando permisos de cámara:', error);
    return false;
  }
};

/**
 * Obtiene la cámara preferida (trasera si es móvil, frontal si es desktop)
 */
export const getPreferredCamera = async (): Promise<string | undefined> => {
  try {
    const cameras = await QrScanner.listCameras(true);
    
    if (cameras.length === 0) {
      return undefined;
    }
    
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // En móviles, preferir cámara trasera
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') ||
        camera.label.toLowerCase().includes('environment')
      );
      return backCamera?.id || cameras[0].id;
    } else {
      // En desktop, usar la primera disponible
      return cameras[0].id;
    }
  } catch (error) {
    console.error('Error obteniendo cámara preferida:', error);
    return undefined;
  }
};

/**
 * Procesa una imagen para extraer código QR
 */
export const scanImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const imageUrl = event.target?.result as string;
        
        // Crear elemento de imagen temporal
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await QrScanner.scanImage(img);
            resolve(result);
          } catch (error) {
            reject(new Error(ERROR_MESSAGES.QR_NOT_FOUND));
          }
        };
        
        img.onerror = () => {
          reject(new Error(ERROR_MESSAGES.PROCESSING_ERROR));
        };
        
        img.src = imageUrl;
      } catch (error) {
        reject(new Error(ERROR_MESSAGES.PROCESSING_ERROR));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(ERROR_MESSAGES.PROCESSING_ERROR));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Valida si el contenido escaneado es válido
 */
export const validateQRContent = (content: string): boolean => {
  return Boolean(content && content.trim().length > 0);
};

/**
 * Maneja errores del escáner y los convierte en mensajes amigables
 */
export const handleScannerError = (error: any): string => {
  console.error('Error del escáner:', error);
  
  if (error.name === 'NotAllowedError') {
    return ERROR_MESSAGES.CAMERA_PERMISSION_DENIED;
  }
  
  if (error.name === 'NotFoundError') {
    return ERROR_MESSAGES.CAMERA_NOT_FOUND;
  }
  
  if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
    return ERROR_MESSAGES.CAMERA_IN_USE;
  }
  
  if (error.message && error.message.includes('QR')) {
    return ERROR_MESSAGES.QR_NOT_FOUND;
  }
  
  return ERROR_MESSAGES.SCANNER_ERROR;
};

/**
 * Optimiza la configuración del escáner según el dispositivo
 */
export const getOptimalScannerConfig = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  return {
    highlightScanRegion: true,
    highlightCodeOutline: true,
    preferredCamera: 'environment' as const,
    maxScansPerSecond: isMobile ? 3 : 5, // Menos frecuencia en móviles para conservar batería
    calculateScanRegion: (video: HTMLVideoElement) => {
      // Área de escaneo centrada
      const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
      const scanRegionSize = Math.round(0.6 * smallerDimension);
      
      return {
        x: Math.round((video.videoWidth - scanRegionSize) / 2),
        y: Math.round((video.videoHeight - scanRegionSize) / 2),
        width: scanRegionSize,
        height: scanRegionSize,
      };
    }
  };
};

/**
 * Cleanup de recursos del escáner
 */
export const cleanupScanner = (scanner: QrScanner | null): void => {
  if (scanner) {
    try {
      scanner.stop();
      scanner.destroy();
    } catch (error) {
      console.error('Error limpiando escáner:', error);
    }
  }
};

/**
 * Verifica si el navegador soporta el escáner QR
 */
export const isScannerSupported = async (): Promise<boolean> => {
  try {
    return await QrScanner.hasCamera();
  } catch (error) {
    console.error('Error verificando soporte del escáner:', error);
    return false;
  }
};

/**
 * Obtiene información del dispositivo para debugging
 */
export const getDeviceInfo = async () => {
  const hasCamera = await QrScanner.hasCamera().catch(() => false);
  
  return {
    userAgent: navigator.userAgent,
    hasCamera,
    isSecureContext: window.isSecureContext,
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    protocol: window.location.protocol
  };
};
