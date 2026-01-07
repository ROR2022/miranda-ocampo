// Definiciones TypeScript para la funcionalidad de descarga QR

export interface QREventData {
  name: string;
  title: string;
  date: string;
  venue?: string;
  qrCodeUrl: string;
  photoUrl: string;
  websiteUrl: string;
  message: string;
}

export type DownloadFormat = 'pdf' | 'png' | 'jpg';

export interface DownloadConfig {
  dimensions: { width: number; height: number };
  quality: number;
  backgroundColor?: string;
  dpi?: number;
  format?: string;
}

export interface QRDownloadState {
  isGenerating: boolean;
  downloadProgress: number;
  error: string | null;
  previewUrl: string | null;
  currentFormat: DownloadFormat | null;
}

export interface FormatConfig {
  pdf: DownloadConfig;
  png: DownloadConfig;
  jpg: DownloadConfig;
}

export interface QRDownloadHook {
  // Estados
  isGenerating: boolean;
  downloadProgress: number;
  error: string | null;
  previewUrl: string | null;
  currentFormat: DownloadFormat | null;
  
  // Acciones principales
  downloadAsPDF: () => Promise<void>;
  downloadAsPNG: () => Promise<void>;
  downloadAsJPG: () => Promise<void>;
  
  // Preview y utilidades
  generatePreview: (format: DownloadFormat) => Promise<string>;
  getFileName: (format: DownloadFormat) => string;
  validateQRData: () => boolean;
  clearError: () => void;
  resetState: () => void;
  
  // Ref para componente
  attachDownloadRef: (element: HTMLDivElement | null) => void;
}

// Estilos para el componente de descarga
export interface QRDesignStyles {
  header: React.CSSProperties;
  main: React.CSSProperties;
  footer: React.CSSProperties;
  qrFrame: React.CSSProperties;
  nameTitle: React.CSSProperties;
  subtitle: React.CSSProperties;
  description: React.CSSProperties;
  photoFrame: React.CSSProperties;
  decorativeElement: React.CSSProperties;
}

// Props para componentes
export interface QRDownloadCardProps {
  eventData: QREventData;
  format: DownloadFormat;
  className?: string;
  style?: React.CSSProperties;
}

export interface QRDownloadButtonProps {
  eventData: QREventData;
  className?: string;
  onDownloadStart?: (format: DownloadFormat) => void;
  onDownloadComplete?: (format: DownloadFormat, success: boolean) => void;
}

export interface QRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: DownloadFormat;
  previewUrl: string | null;
  onConfirmDownload: () => void;
  isGenerating: boolean;
}
