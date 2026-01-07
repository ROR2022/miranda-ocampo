// Exportaciones centralizadas para componentes QRCode

export { default as QRCode } from './QRCode';
export { default as QRDownloadCard } from './QRDownloadCard';
export { default as QRDownloadButton } from './QRDownloadButton';
export { default as QRDownloadContainer } from './QRDownloadContainer';
export { default as CreateQR } from './CreateQR';
export { default as ReadQR } from './ReadQR';

// Hooks de ReadQR
export { useQRScanner } from './useQRScanner';

// Re-exportar tipos relevantes
export type {
  QRDownloadCardProps,
  QRDownloadButtonProps
} from '@/types/qrDownload.types';

// Re-exportar tipos de CreateQR
export type {
  QROptions,
  CreateQRState,
  ColorPreset,
  SizeOption,
  ErrorCorrectionOption
} from './CreateQR.types';

// Re-exportar tipos de ReadQR
export type {
  SimpleReadQRState,
  QRScannerConfig,
  QRScanResult,
  QRResult,
  ContentTypeDetection,
  ScanMode,
  CameraPermission
} from './ReadQR.types';

// Re-exportar constantes de ReadQR
export {
  DEFAULT_SCANNER_CONFIG,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONTENT_TYPE_CONFIG
} from './ReadQR.types';
