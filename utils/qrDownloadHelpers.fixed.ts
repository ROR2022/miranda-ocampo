import { FormatConfig, DownloadFormat, QREventData } from '@/types/qrDownload.types';

// Paleta Aurora VIP - Consistente con el tema
export const VIP_COLORS = {
  rosaAurora: '#E91E63',
  lavandaAurora: '#9C27B0',
  oroAurora: '#FF9800',
  blancoSeda: '#FFFFFF',
  cremaSuave: '#F5F5F5',
  rosaIntensa: '#C2185B',
  lavandaIntensa: '#7B1FA2',
  oroIntensio: '#F57C00',
  rosaDelicada: '#F8BBD9'
};

// Configuraciones específicas por formato
export const FORMAT_CONFIGS: FormatConfig = {
  pdf: {
    dimensions: { width: 210, height: 297 }, // A4 en mm
    dpi: 300,
    quality: 0.95,
    backgroundColor: '#FFFFFF',
    format: 'a4'
  },
  png: {
    dimensions: { width: 800, height: 1000 },
    quality: 1.0,
    backgroundColor: 'transparent'
  },
  jpg: {
    dimensions: { width: 800, height: 1000 },
    quality: 0.9,
    backgroundColor: '#FFFFFF'
  }
};

// Generación de nombres de archivo
export const generateFileName = (format: DownloadFormat, eventData: QREventData): string => {
  const timestamp = new Date().toISOString().slice(0, 10);
  const name = eventData.name.replace(/\s+/g, '_').toLowerCase();
  return `${name}_qr_${timestamp}.${format}`;
};

// Validación de datos del evento
export const validateEventData = (eventData: QREventData): boolean => {
  const required = ['name', 'title', 'date', 'qrCodeUrl', 'websiteUrl'];
  return required.every(field => eventData[field as keyof QREventData] && 
    String(eventData[field as keyof QREventData]).trim().length > 0);
};

// Convertir dataURL a Blob
export const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

// Trigger de descarga
export const triggerDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Formateo de fecha para display
export const formatDisplayDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// Utilidades para calidad de imagen
export const calculateOptimalDimensions = (
  format: DownloadFormat, 
  containerWidth: number = 800
): { width: number; height: number; scale: number } => {
  const config = FORMAT_CONFIGS[format];
  const aspectRatio = config.dimensions.height / config.dimensions.width;
  
  let width = containerWidth;
  let height = containerWidth * aspectRatio;
  let scale = 1;
  
  // Para PDF, ajustar a DPI óptimo para mejor calidad
  if (format === 'pdf' && config.dpi) {
    scale = config.dpi / 96; // 96 DPI es el estándar del navegador
    width *= scale;
    height *= scale;
  }
  
  return { width, height, scale };
};

// Logging de eventos de descarga
export const logDownloadEvent = (
  format: DownloadFormat, 
  success: boolean, 
  duration: number, 
  error?: string
): void => {
  const logData = {
    format,
    success,
    duration: `${duration}ms`,
    error: error || null,
    timestamp: new Date().toISOString()
  };
  
  console.log(`[QR Download] ${format.toUpperCase()}:`, logData);
};

// Manejo de errores
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Error desconocido';
};
