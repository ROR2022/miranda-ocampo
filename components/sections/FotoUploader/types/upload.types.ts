// 📸 Upload Types - Tipos TypeScript para el sistema de upload de fotos

export interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'completed';
  progress: number;
  error?: string;
  cloudinaryId?: string; // ID de Cloudinary para archivos subidos a la nube
}

export interface UploadState {
  files: UploadFile[];
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export interface UploaderFormData {
  uploaderName?: string;
  userName?: string;
  comment?: string;
  eventMoment?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  data?: {
    uploadedFiles: string[];
    totalFiles: number;
    timestamp: number;
  };
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp' | 'png';
}

export interface UploadConfig {
  maxFileSize: number;
  maxFiles: number;
  allowedFormats: string[];
  compressionOptions: CompressionOptions;
}

// Hook return types
export interface UseFileUploadReturn {
  uploadState: UploadState;
  addFiles: (files: FileList) => void;
  removeFile: (fileId: string) => void;
  uploadFiles: (formData?: UploaderFormData) => Promise<void>;
  resetUpload: () => void;
}

export interface UseImagePreviewReturn {
  previews: Record<string, string>;
  generatePreview: (file: File) => string;
  cleanupPreview: (fileId: string) => void;
  cleanupAllPreviews: () => void;
}
