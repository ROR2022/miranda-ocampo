import { QREventData, DownloadFormat } from '@/types/qrDownload.types';

// Validaciones específicas para cada campo del evento
export const validateEventFields = (eventData: QREventData) => {
  const errors: string[] = [];

  // Validar nombre
  if (!eventData.name || eventData.name.trim().length === 0) {
    errors.push('El nombre es requerido');
  } else if (eventData.name.trim().length > 50) {
    errors.push('El nombre no puede exceder 50 caracteres');
  }

  // Validar título
  if (!eventData.title || eventData.title.trim().length === 0) {
    errors.push('El título del evento es requerido');
  }

  // Validar fecha
  if (!eventData.date || eventData.date.trim().length === 0) {
    errors.push('La fecha es requerida');
  }

  // Validar URL del QR
  if (!eventData.qrCodeUrl || !isValidURL(eventData.qrCodeUrl)) {
    errors.push('La URL del código QR no es válida');
  }

  // Validar URL de la foto
  if (!eventData.photoUrl || eventData.photoUrl.trim().length === 0) {
    errors.push('La URL de la foto es requerida');
  }

  // Validar URL del sitio web
  if (!eventData.websiteUrl || eventData.websiteUrl.trim().length === 0) {
    errors.push('La URL del sitio web es requerida');
  }

  // Validar mensaje
  if (!eventData.message || eventData.message.trim().length === 0) {
    errors.push('El mensaje es requerido');
  } else if (eventData.message.trim().length > 200) {
    errors.push('El mensaje no puede exceder 200 caracteres');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validar URL
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Verificar capacidades del navegador
export const checkBrowserCapabilities = () => {
  const capabilities = {
    canvas: !!document.createElement('canvas').getContext,
    download: 'download' in document.createElement('a'),
    blob: typeof Blob !== 'undefined',
    fileAPI: typeof File !== 'undefined' && typeof FileReader !== 'undefined',
    webGL: !!document.createElement('canvas').getContext('webgl')
  };

  const missingCapabilities = Object.entries(capabilities)
    .filter(([, supported]) => !supported)
    .map(([capability]) => capability);

  return {
    allSupported: missingCapabilities.length === 0,
    capabilities,
    missingCapabilities
  };
};

// Test de rendimiento de descarga
export const performanceTest = async () => {
  const startTime = performance.now();
  
  // Crear un canvas pequeño para test
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas no soportado');
  }

  // Dibujar algo simple
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(0, 0, 100, 100);
  
  // Convertir a blob
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve);
  });

  const endTime = performance.now();
  
  return {
    duration: endTime - startTime,
    canvasSupported: true,
    blobGenerated: !!blob,
    blobSize: blob?.size || 0
  };
};

// Estimar tiempo de descarga por formato
export const estimateDownloadTime = (format: DownloadFormat): number => {
  // Estimaciones en milisegundos basadas en complejidad
  const estimates = {
    png: 2000, // Más tiempo por transparencia
    jpg: 1500, // Tiempo medio
    pdf: 3000  // Más tiempo por generación PDF
  };

  return estimates[format];
};

// Verificar memoria disponible (approximation)
export const checkMemoryUsage = () => {
  if ('memory' in performance) {
    const memInfo = (performance as any).memory;
    return {
      used: memInfo.usedJSHeapSize,
      total: memInfo.totalJSHeapSize,
      limit: memInfo.jsHeapSizeLimit,
      available: memInfo.jsHeapSizeLimit - memInfo.usedJSHeapSize,
      usagePercentage: (memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit) * 100
    };
  }
  
  return null;
};

// Validar tamaño óptimo de imagen
export const validateImageDimensions = (width: number, height: number) => {
  const maxWidth = 2000;
  const maxHeight = 2500;
  const minWidth = 400;
  const minHeight = 500;

  const issues: string[] = [];

  if (width > maxWidth) {
    issues.push(`Ancho excede el máximo recomendado (${maxWidth}px)`);
  }
  if (height > maxHeight) {
    issues.push(`Alto excede el máximo recomendado (${maxHeight}px)`);
  }
  if (width < minWidth) {
    issues.push(`Ancho menor al mínimo recomendado (${minWidth}px)`);
  }
  if (height < minHeight) {
    issues.push(`Alto menor al mínimo recomendado (${minHeight}px)`);
  }

  const aspectRatio = width / height;
  if (aspectRatio < 0.6 || aspectRatio > 1.2) {
    issues.push('Proporción de aspecto no recomendada para impresión');
  }

  return {
    isValid: issues.length === 0,
    issues,
    aspectRatio,
    recommended: {
      width: Math.min(Math.max(width, minWidth), maxWidth),
      height: Math.min(Math.max(height, minHeight), maxHeight)
    }
  };
};

// Detectar dispositivo móvil
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
};

// Verificar conexión de red
export const checkNetworkStatus = () => {
  const connection = (navigator as any).connection || 
                   (navigator as any).mozConnection || 
                   (navigator as any).webkitConnection;

  if (connection) {
    return {
      online: navigator.onLine,
      type: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    };
  }

  return {
    online: navigator.onLine,
    type: 'unknown',
    downlink: undefined,
    rtt: undefined,
    saveData: false
  };
};

// Logger para debugging detallado
export const debugLogger = {
  log: (category: string, message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`[QR Download] ${category}`);
      console.log(message);
      if (data) {
        console.log('Data:', data);
      }
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  },

  error: (category: string, error: Error, context?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`[QR Download ERROR] ${category}`);
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      if (context) {
        console.log('Context:', context);
      }
      console.log('Timestamp:', new Date().toISOString());
      console.groupEnd();
    }
  },

  performance: (operation: string, startTime: number, endTime: number, details?: any) => {
    if (process.env.NODE_ENV === 'development') {
      const duration = endTime - startTime;
      console.group(`[QR Download PERF] ${operation}`);
      console.log(`Duration: ${duration.toFixed(2)}ms`);
      if (details) {
        console.log('Details:', details);
      }
      console.groupEnd();
    }
  }
};
