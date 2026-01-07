// 🎯 Tipos para el componente ReadQR

export type ScanMode = 'camera' | 'file';

export interface SimpleReadQRState {
  mode: ScanMode;
  isScanning: boolean;
  hasPermission: boolean;
  hasCamera: boolean;
  result: QRScanResult | null;
  error: string | null;
  isLoading: boolean;
}

export interface QRScannerConfig {
  highlightScanRegion: boolean;
  highlightCodeOutline: boolean;
  preferredCamera: 'environment' | 'user';
  maxScansPerSecond: number;
  returnDetailedScanResult: boolean;
  calculateScanRegion?: (video: HTMLVideoElement) => {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface QRScanResult {
  data: string;
  timestamp: Date;
  contentType: 'url' | 'email' | 'phone' | 'text' | 'unknown';
  isValid: boolean;
  actions: string[];
  error: string | null;
}

export interface QRResult {
  content: string;
  type: 'url' | 'email' | 'phone' | 'text' | 'unknown';
  isValid: boolean;
  timestamp: Date;
}

export interface ContentTypeDetection {
  type: 'url' | 'email' | 'phone' | 'text' | 'unknown';
  isValid: boolean;
  actions: string[];
  formatted?: string;
}

export interface CameraPermission {
  granted: boolean;
  denied: boolean;
  prompt: boolean;
  unavailable: boolean;
}

// Constantes predefinidas
export const DEFAULT_SCANNER_CONFIG: QRScannerConfig = {
  highlightScanRegion: true,
  highlightCodeOutline: true,
  preferredCamera: 'environment',
  maxScansPerSecond: 5,
  returnDetailedScanResult: true
};

export const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ERROR_MESSAGES = {
  CAMERA_NOT_FOUND: 'No se encontró ninguna cámara disponible',
  CAMERA_PERMISSION_DENIED: 'Permisos de cámara denegados',
  CAMERA_IN_USE: 'La cámara está siendo utilizada por otra aplicación',
  FILE_TOO_LARGE: 'El archivo es demasiado grande (máximo 10MB)',
  FILE_INVALID_TYPE: 'Tipo de archivo no soportado. Use JPG, PNG, GIF o WebP',
  QR_NOT_FOUND: 'No se encontró ningún código QR en la imagen',
  QR_UNREADABLE: 'El código QR no se puede leer correctamente',
  PROCESSING_ERROR: 'Error procesando la imagen',
  SCANNER_ERROR: 'Error inicializando el escáner'
};

export const SUCCESS_MESSAGES = {
  QR_SCANNED: 'Código QR escaneado exitosamente',
  CONTENT_COPIED: 'Contenido copiado al portapapeles',
  URL_OPENED: 'URL abierta en nueva ventana',
  EMAIL_OPENED: 'Cliente de email abierto',
  PHONE_OPENED: 'Aplicación de teléfono abierta'
};

// Configuración de tipos de contenido
export const CONTENT_TYPE_CONFIG = {
  url: {
    icon: '🌐',
    label: 'Enlace Web',
    actions: [
      { action: 'open', label: 'Abrir', icon: '🔗' },
      { action: 'copy', label: 'Copiar', icon: '📋' }
    ]
  },
  email: {
    icon: '📧',
    label: 'Correo Electrónico',
    actions: [
      { action: 'mailto', label: 'Enviar Email', icon: '✉️' },
      { action: 'copy', label: 'Copiar', icon: '📋' }
    ]
  },
  phone: {
    icon: '📞',
    label: 'Número de Teléfono',
    actions: [
      { action: 'call', label: 'Llamar', icon: '📞' },
      { action: 'copy', label: 'Copiar', icon: '📋' }
    ]
  },
  text: {
    icon: '📝',
    label: 'Texto',
    actions: [
      { action: 'copy', label: 'Copiar', icon: '📋' }
    ]
  },
  unknown: {
    icon: '❓',
    label: 'Contenido Desconocido',
    actions: [
      { action: 'copy', label: 'Copiar', icon: '📋' }
    ]
  }
} as const;
