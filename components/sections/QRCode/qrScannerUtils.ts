// 🛠️ Utilidades para el scanner QR - Aurora VIP Design

import QrScanner from 'qr-scanner';
import { ERROR_MESSAGES } from './ReadQR.types';

// 📱 Verificar disponibilidad de cámara
export async function checkCameraAvailability(): Promise<boolean> {
  try {
    const hasCamera = await QrScanner.hasCamera();
    return hasCamera;
  } catch (error) {
    console.warn('Error verificando cámara:', error);
    return false;
  }
}

// 🖼️ Escanear archivo de imagen
export async function scanImageFile(file: File): Promise<string> {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      throw new Error(ERROR_MESSAGES.FILE_INVALID_TYPE);
    }

    // Validar tamaño de archivo (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    // Escanear imagen
    const result = await QrScanner.scanImage(file, undefined, undefined, undefined, undefined, true);

    if (!result) {
      throw new Error(ERROR_MESSAGES.QR_NOT_FOUND);
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(ERROR_MESSAGES.PROCESSING_ERROR);
  }
}

// ⚠️ Manejar errores del scanner
export function handleScannerError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('permission') || message.includes('denied')) {
      return ERROR_MESSAGES.CAMERA_PERMISSION_DENIED;
    }
    
    if (message.includes('not found') || message.includes('no camera')) {
      return ERROR_MESSAGES.CAMERA_NOT_FOUND;
    }
    
    if (message.includes('in use') || message.includes('busy')) {
      return ERROR_MESSAGES.CAMERA_IN_USE;
    }
    
    if (message.includes('qr') || message.includes('code')) {
      return ERROR_MESSAGES.QR_NOT_FOUND;
    }
    
    return error.message;
  }
  
  return ERROR_MESSAGES.SCANNER_ERROR;
}

// 📋 Validar contenido QR
export function validateQRContent(content: string): boolean {
  return Boolean(content && content.trim().length > 0);
}

// 🔧 Verificar soporte del scanner
export async function isScannerSupported(): Promise<boolean> {
  try {
    const hasCamera = await QrScanner.hasCamera();
    return hasCamera;
  } catch {
    return false;
  }
}

// 📱 Obtener información del dispositivo
export async function getDeviceInfo(): Promise<{
  hasCamera: boolean;
  isSupported: boolean;
  userAgent: string;
  isMobile: boolean;
}> {
  try {
    const hasCamera = await checkCameraAvailability();
    const isSupported = await isScannerSupported();
    const userAgent = navigator.userAgent;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    
    return {
      hasCamera,
      isSupported,
      userAgent,
      isMobile
    };
  } catch (error) {
    console.warn('Error obteniendo información del dispositivo:', error);
    return {
      hasCamera: false,
      isSupported: false,
      userAgent: navigator.userAgent,
      isMobile: false
    };
  }
}

// 🎥 Configurar cámara preferida
export function getPreferredCamera(): string {
  // En móvil, preferir cámara trasera para mejor escaneo
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  return isMobile ? 'environment' : 'user';
}

// 🔄 Reiniciar configuración del scanner
export function resetScannerConfig(): {
  highlightScanRegion: boolean;
  highlightCodeOutline: boolean;
  maxScansPerSecond: number;
  preferredCamera: string;
  returnDetailedScanResult: boolean;
} {
  return {
    highlightScanRegion: true,
    highlightCodeOutline: true,
    maxScansPerSecond: 5,
    preferredCamera: getPreferredCamera(),
    returnDetailedScanResult: true
  };
}

// 🎯 Calcular región de escaneo
export function calculateScanRegion(video: HTMLVideoElement): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const smallerDimension = Math.min(video.videoWidth, video.videoHeight);
  const scanRegionSize = Math.round(0.7 * smallerDimension);
  
  return {
    x: Math.round((video.videoWidth - scanRegionSize) / 2),
    y: Math.round((video.videoHeight - scanRegionSize) / 2),
    width: scanRegionSize,
    height: scanRegionSize,
  };
}

// 🔒 Verificar permisos de cámara
export async function checkCameraPermissions(): Promise<{
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  unavailable: boolean;
}> {
  try {
    if (!navigator.permissions) {
      return { granted: false, denied: false, prompt: true, unavailable: true };
    }

    const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
    
    return {
      granted: permission.state === 'granted',
      denied: permission.state === 'denied',
      prompt: permission.state === 'prompt',
      unavailable: false
    };
  } catch (error) {
    console.warn('Error verificando permisos:', error);
    return { granted: false, denied: false, prompt: true, unavailable: true };
  }
}

// 🧹 Cleanup de recursos
export function cleanupScanner(scanner: QrScanner | null): void {
  try {
    if (scanner) {
      scanner.stop();
      scanner.destroy();
    }
  } catch (error) {
    console.warn('Error en cleanup del scanner:', error);
  }
}
