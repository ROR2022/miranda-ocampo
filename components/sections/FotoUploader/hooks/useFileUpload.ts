// 📸 useFileUpload - Hook para manejar el estado y lógica de upload

import { useState, useCallback } from 'react';
import { UseFileUploadReturn, UploadState, UploaderFormData, UploadFile } from '../types/upload.types';
import { validateFileList, generateFileId } from '../utils/imageValidation';
import { ERROR_MESSAGES } from '@/components/sections/FotoUploader/constants/upload.constants';

/**
 * Hook principal para manejar el upload de archivos
 */
export const useFileUpload = (): UseFileUploadReturn => {
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  /**
   * Agrega archivos a la lista de upload
   */
  const addFiles = useCallback((fileList: FileList) => {
    // Validar archivos
    const validation = validateFileList(fileList);
    if (!validation.valid) {
      setUploadState(prev => ({
        ...prev,
        error: validation.error || ERROR_MESSAGES.UNKNOWN_ERROR
      }));
      return;
    }

    // Convertir FileList a array de UploadFile
    const newFiles: UploadFile[] = Array.from(fileList).map(file => ({
      id: generateFileId(file),
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      progress: 0
    }));

    setUploadState(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
      error: null
    }));
  }, []);

  /**
   * Remueve un archivo de la lista
   */
  const removeFile = useCallback((fileId: string) => {
    setUploadState(prev => {
      // Encontrar el archivo y limpiar su preview
      const fileToRemove = prev.files.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }

      return {
        ...prev,
        files: prev.files.filter(f => f.id !== fileId)
      };
    });
  }, []);

  /**
   * Implementa la lógica real de upload de archivos
   */
  const uploadFiles = useCallback(async (formData?: UploaderFormData) => {
    const filesToUpload = uploadState.files.filter(f => f.status === 'pending');
    
    if (filesToUpload.length === 0) {
      setUploadState(prev => ({
        ...prev,
        error: 'No hay archivos para subir'
      }));
      return;
    }

    setUploadState(prev => ({
      ...prev,
      uploading: true,
      progress: 0,
      error: null
    }));

    try {
      let completedFiles = 0;
      const totalFiles = filesToUpload.length;

      for (const uploadFile of filesToUpload) {
        // Actualizar estado del archivo a "uploading"
        setUploadState(prev => ({
          ...prev,
          files: prev.files.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'uploading' as const }
              : f
          )
        }));

        try {
          // Comprimir imagen si es necesario
          let fileToUpload = uploadFile.file;
          const { compressImage } = await import('../utils/imageCompression');
          
          if (uploadFile.file.size > 5 * 1024 * 1024) { // 5MB
            try {
              fileToUpload = await compressImage(uploadFile.file);
            } catch (compressionError) {
              console.warn('Error comprimiendo imagen, usando original:', compressionError);
            }
          }

          // Subir archivo al servidor
          const { uploadToServer } = await import('../utils/uploadHelpers');
          await uploadToServer(fileToUpload, {
            originalName: uploadFile.file.name,
            userName: formData?.userName,
            eventMoment: formData?.eventMoment,
            onProgress: (progress: number) => {
              setUploadState(prev => ({
                ...prev,
                files: prev.files.map(f => 
                  f.id === uploadFile.id 
                    ? { ...f, progress }
                    : f
                )
              }));
            }
          });

          // Marcar como completado
          setUploadState(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'completed' as const, progress: 100 }
                : f
            )
          }));

          completedFiles++;
          
          // Actualizar progreso general
          const overallProgress = (completedFiles / totalFiles) * 100;
          setUploadState(prev => ({ ...prev, progress: overallProgress }));

        } catch (fileError) {
          console.error('Error uploading file:', uploadFile.file.name, fileError);
          
          // Marcar como error
          setUploadState(prev => ({
            ...prev,
            files: prev.files.map(f => 
              f.id === uploadFile.id 
                ? { 
                    ...f, 
                    status: 'error' as const, 
                    error: fileError instanceof Error ? fileError.message : 'Error desconocido' 
                  }
                : f
            )
          }));
        }
      }

      // Verificar si todos los archivos se subieron exitosamente
      const currentFiles = uploadState.files;
      const allCompleted = currentFiles.every(f => f.status === 'completed' || f.status === 'success');
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        success: allCompleted,
        error: allCompleted ? null : 'Algunos archivos no se pudieron subir'
      }));

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : ERROR_MESSAGES.UPLOAD_FAILED
      }));
    }
  }, [uploadState.files]);

  /**
   * Resetea el estado del upload
   */
  const resetUpload = useCallback(() => {
    // Limpiar previews
    uploadState.files.forEach(file => {
      URL.revokeObjectURL(file.preview);
    });

    setUploadState({
      files: [],
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
  }, [uploadState.files]);

  return {
    uploadState,
    addFiles,
    removeFile,
    uploadFiles,
    resetUpload
  };
};
