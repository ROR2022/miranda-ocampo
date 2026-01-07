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

// Trigger de descarga con logging mejorado
export const triggerDownload = (blob: Blob, fileName: string): void => {
  const startTime = Date.now();
  
  // Detectar dispositivo
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  
  console.log('🔽 [triggerDownload] Iniciando descarga:', {
    fileName,
    blobSize: blob.size,
    blobType: blob.type,
    isIOS,
    isSafari,
    userAgent: navigator.userAgent
  });

  try {
    const url = URL.createObjectURL(blob);
    console.log('🔗 [triggerDownload] URL del blob creada:', {
      url: url.substring(0, 50) + '...',
      urlLength: url.length
    });

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    
    // Configuraciones específicas para iOS
    if (isIOS) {
      console.log('📱 [triggerDownload] Aplicando configuración para iOS');
      link.target = '_blank'; // Abrir en nueva ventana para iOS
      link.rel = 'noopener noreferrer';
    }
    
    console.log('🔧 [triggerDownload] Elemento <a> configurado:', {
      href: link.href.substring(0, 50) + '...',
      download: link.download,
      target: link.target || 'default'
    });

    document.body.appendChild(link);
    console.log('➕ [triggerDownload] Elemento agregado al DOM');

    // Intentar click con diferentes métodos para iOS
    if (isIOS) {
      console.log('📱 [triggerDownload] Usando método de click específico para iOS');
      
      // Método 1: Click directo
      try {
        link.click();
        console.log('✅ [triggerDownload] Click directo exitoso en iOS');
      } catch (clickError) {
        console.error('❌ [triggerDownload] Error en click directo iOS:', clickError);
        
        // Método 2: Evento sintético
        try {
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          link.dispatchEvent(event);
          console.log('✅ [triggerDownload] Evento sintético exitoso en iOS');
        } catch (eventError) {
          console.error('❌ [triggerDownload] Error en evento sintético iOS:', eventError);
          
          // Método 3: Abrir directamente la URL
          try {
            window.open(url, '_blank');
            console.log('✅ [triggerDownload] window.open exitoso en iOS');
          } catch (openError) {
            console.error('❌ [triggerDownload] Error en window.open iOS:', openError);
          }
        }
      }
    } else {
      // Método estándar para otros dispositivos
      link.click();
      console.log('✅ [triggerDownload] Click estándar exitoso');
    }

    // Cleanup con delay para iOS
    const cleanupDelay = isIOS ? 3000 : 100;
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('🧹 [triggerDownload] Cleanup completado', {
          duration: Date.now() - startTime,
          device: isIOS ? 'iOS' : 'Other'
        });
      } catch (cleanupError) {
        console.error('⚠️ [triggerDownload] Error en cleanup:', cleanupError);
      }
    }, cleanupDelay);

  } catch (error) {
    console.error('💥 [triggerDownload] Error general:', {
      error,
      fileName,
      blobSize: blob.size,
      isIOS,
      duration: Date.now() - startTime
    });
    
    // Fallback para iOS: mostrar instrucciones al usuario
    if (isIOS) {
      console.error('📱 [triggerDownload] FALLBACK iOS - Mostrando instrucciones al usuario');
      alert(`⚠️ PROBLEMA DE DESCARGA EN iOS\n\nEl archivo "${fileName}" no se pudo descargar automáticamente.\n\nINSTRUCCIONES:\n1. Mantén presionado este botón\n2. Selecciona "Guardar en Archivos"\n3. O toma una captura de pantalla de la vista previa\n\nSi el problema persiste, contacta soporte.`);
    }
    
    throw error;
  }
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
