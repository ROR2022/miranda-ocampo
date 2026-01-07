import { useState, useCallback, useRef } from 'react';
import { UploadState, UploaderFormData, UploadFile } from '../types/upload.types';
import { validateFileList, generateFileId } from '../utils/imageValidation';
import { compressImage, needsCompression } from '../utils/imageCompression';
// import { ERROR_MESSAGES } from '@/components/sections/FotoUploader/constants/upload.constants';

// 🔌 Activar interceptor de logs para envío automático al servidor
import '@/utils/logInterceptor';

// Interfaz para los datos de Cloudinary
interface CloudinaryData {
  public_id: string;
  secure_url: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
  bytes?: number;
}

// Interfaz para los resultados de upload
interface UploadResult {
  filename?: string;
  filePath?: string;
  cloudinaryData?: CloudinaryData;
  [key: string]: unknown;
}

// Interfaz para el registro en MongoDB
interface PhotoRegistration {
  filename: string;
  originalName: string;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  uploadSource: 'cloudinary' | 'local';
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  uploader: {
    name?: string;
    ip: string;
    userAgent: string;
  };
  eventMoment?: string;
  comment?: string;
}

/**
 * Hook híbrido para manejo de subida de archivos
 * Combina Cloudinary y sistema original con fallback automático
 */
export const useHybridUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    files: [],
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });

  const [systemType, setSystemType] = useState<'cloudinary' | 'original' | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Obtiene la IP del cliente
   */
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (error) {
      console.warn('Could not get client IP:', error);
      return '0.0.0.0';
    }
  };

  /**
   * Obtiene las dimensiones de una imagen
   */
  const getImageDimensions = (file: File): Promise<{width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  };

  /**
   * Registra una foto en MongoDB
   */
  const registerPhotoInDB = useCallback(async (
    file: File,
    uploadResult: UploadResult,
    uploadSource: 'cloudinary' | 'local',
    formData?: UploaderFormData
  ): Promise<void> => {
    try {
      console.log('💾 Registering photo in MongoDB...', {
        filename: file.name,
        uploadSource,
        uploadResult
      });

      // Obtener IP del cliente
      const clientIP = await getClientIP();
      
      // Obtener dimensiones de la imagen
      const dimensions = await getImageDimensions(file);

      // Preparar datos para el registro
      const photoData: PhotoRegistration = {
        filename: uploadResult.filename || file.name,
        originalName: file.name,
        uploadSource,
        fileSize: file.size,
        mimeType: file.type,
        dimensions,
        uploader: {
          name: formData?.uploaderName || formData?.userName,
          ip: clientIP,
          userAgent: navigator.userAgent
        },
        eventMoment: formData?.eventMoment,
        comment: formData?.comment
      };

      // Agregar datos específicos según el tipo de upload
      if (uploadSource === 'cloudinary' && uploadResult.cloudinaryData) {
        photoData.cloudinaryId = uploadResult.cloudinaryData.public_id;
        photoData.cloudinaryUrl = uploadResult.cloudinaryData.secure_url;
      } else if (uploadSource === 'local' && uploadResult.filePath) {
        photoData.localPath = uploadResult.filePath;
      }

      // Registrar en MongoDB
      const response = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photoData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to register photo in MongoDB:', {
          status: response.status,
          error: errorText
        });
        // No lanzamos error para no fallar el upload, solo logueamos
        return;
      }

      const result = await response.json();
      console.log('✅ Photo registered successfully in MongoDB:', result);
      
    } catch (error) {
      console.error('❌ Error registering photo in MongoDB:', error);
      // No lanzamos error para no fallar el upload
    }
  }, []);

  /**
   * Sube archivos usando Cloudinary (MODO INDIVIDUAL)
   */
  const uploadWithCloudinary = useCallback(async (
    filesToUpload: UploadFile[],
    formData?: UploaderFormData
  ): Promise<boolean> => {
    try {
      console.log('🌩️ useHybridUpload: Attempting Cloudinary upload...');
      console.log('☁️ useHybridUpload: MODO INDIVIDUAL - Subiendo archivos de uno en uno...');
      
      const successfulUploads: any[] = [];
      const failedUploads: string[] = [];

      // 🔄 NUEVO: Subir archivos de uno en uno
      for (let i = 0; i < filesToUpload.length; i++) {
        const fileObj = filesToUpload[i];
        console.log(`📎 useHybridUpload: Subiendo archivo ${i + 1}/${filesToUpload.length}: ${fileObj.file.name}`);
        
        try {
          // Crear FormData individual para cada archivo
          const singleFormData = new FormData();
          singleFormData.append('files', fileObj.file);

          // Agregar metadatos opcionales
          if (formData?.uploaderName) {
            singleFormData.append('uploaderName', formData.uploaderName);
          }
          if (formData?.userName) {
            singleFormData.append('userName', formData.userName);
          }
          if (formData?.eventMoment) {
            singleFormData.append('eventMoment', formData.eventMoment);
          }
          if (formData?.comment) {
            singleFormData.append('comment', formData.comment);
          }

          console.log(`� useHybridUpload: Enviando archivo ${i + 1} a /api/upload-fotos-cloudinary...`);
          const response = await fetch('/api/upload-fotos-cloudinary', {
            method: 'POST',
            body: singleFormData,
            signal: abortControllerRef.current?.signal,
          });

          console.log(`📡 useHybridUpload: Respuesta archivo ${i + 1}:`, {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ useHybridUpload: Upload falló para archivo ${i + 1}:`, {
              fileName: fileObj.file.name,
              status: response.status,
              error: errorText
            });
            failedUploads.push(`${fileObj.file.name}: ${response.status} ${response.statusText}`);
            continue; // Continúa con el siguiente archivo
          }

          const result = await response.json();
          console.log(`✅ useHybridUpload: Archivo ${i + 1} subido exitosamente:`, {
            fileName: fileObj.file.name,
            cloudinaryId: result.data?.files?.[0]?.cloudinaryId
          });

          // Registrar en MongoDB inmediatamente
          if (result.data && result.data.files && Array.isArray(result.data.files) && result.data.files.length > 0) {
            const uploadResult = result.data.files[0];
            console.log(`💾 useHybridUpload: Registrando archivo ${i + 1} en MongoDB:`, uploadResult.cloudinaryId);
            
            const adaptedResult: UploadResult = {
              filename: uploadResult.originalName,
              cloudinaryData: {
                public_id: uploadResult.cloudinaryId,
                secure_url: uploadResult.urls?.original || '',
                url: uploadResult.urls?.original || '',
                width: uploadResult.metadata?.width,
                height: uploadResult.metadata?.height,
                format: uploadResult.metadata?.format,
                bytes: uploadResult.metadata?.optimizedSize
              }
            };
            
            await registerPhotoInDB(fileObj.file, adaptedResult, 'cloudinary', formData);
            successfulUploads.push(uploadResult);
          }

        } catch (error) {
          console.error(`❌ useHybridUpload: Error en archivo ${i + 1} (${fileObj.file.name}):`, error);
          failedUploads.push(`${fileObj.file.name}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
      }

      // Evaluación final
      console.log('📊 useHybridUpload: Resumen de uploads:', {
        total: filesToUpload.length,
        exitosos: successfulUploads.length,
        fallidos: failedUploads.length,
        fallidosDetalle: failedUploads
      });

      if (successfulUploads.length === 0) {
        console.error('❌ useHybridUpload: Ningún archivo se subió exitosamente');
        throw new Error(`No se pudo subir ningún archivo. Errores: ${failedUploads.join('; ')}`);
      }

      if (failedUploads.length > 0) {
        console.warn('⚠️ useHybridUpload: Algunos archivos fallaron:', failedUploads);
        // Nota: No lanzamos error aquí si al menos algunos se subieron exitosamente
      }

      console.log(`✅ useHybridUpload: Upload completado - ${successfulUploads.length}/${filesToUpload.length} archivos exitosos`);
      return true;

    } catch (error) {
      console.error('❌ useHybridUpload: Cloudinary upload error:', error);
      return false;
    }
  }, [registerPhotoInDB]);

  /**
   * Sube archivos usando el sistema original
   */
  const uploadWithOriginal = useCallback(async (
    filesToUpload: UploadFile[],
    formData?: UploaderFormData
  ): Promise<boolean> => {
    try {
      console.log('📁 useHybridUpload: Using original upload system...');
      console.log('📁 useHybridUpload: Preparando FormData para sistema original...');
      
      const uploadFormData = new FormData();
      
      // IMPORTANTE: API local espera campo 'file' (singular), no 'files'
      // Agregar archivos uno por uno con el nombre correcto
      filesToUpload.forEach((fileObj, index) => {
        console.log(`📎 useHybridUpload: Agregando archivo ${index + 1}: ${fileObj.file.name}`);
        uploadFormData.append('file', fileObj.file);
      });

      // Agregar metadatos opcionales
      if (formData?.uploaderName) {
        uploadFormData.append('uploaderName', formData.uploaderName);
        console.log('👤 useHybridUpload: Agregado uploaderName:', formData.uploaderName);
      }
      if (formData?.userName) {
        uploadFormData.append('userName', formData.userName);
        console.log('👤 useHybridUpload: Agregado userName:', formData.userName);
      }
      if (formData?.eventMoment) {
        uploadFormData.append('eventMoment', formData.eventMoment);
        console.log('📅 useHybridUpload: Agregado eventMoment:', formData.eventMoment);
      }
      if (formData?.comment) {
        uploadFormData.append('comment', formData.comment);
        console.log('💬 useHybridUpload: Agregado comment:', formData.comment);
      }

      // Log del FormData preparado
      console.log('📦 useHybridUpload: FormData preparado con:', {
        archivos: filesToUpload.length,
        campos: Array.from(uploadFormData.keys())
      });

      console.log('🚀 useHybridUpload: Enviando request a /api/upload-fotos...');
      const response = await fetch('/api/upload-fotos', {
        method: 'POST',
        body: uploadFormData,
        signal: abortControllerRef.current?.signal,
      });

      console.log('📡 useHybridUpload: Respuesta del servidor original:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ useHybridUpload: Original upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Original upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ useHybridUpload: Original upload successful:', result);

      // 🆕 Registrar automáticamente en MongoDB
      if (result.uploads && Array.isArray(result.uploads)) {
        console.log('💾 useHybridUpload: Registrando archivos en MongoDB...');
        for (let i = 0; i < result.uploads.length && i < filesToUpload.length; i++) {
          const uploadResult = result.uploads[i];
          const file = filesToUpload[i].file;
          
          console.log(`💾 useHybridUpload: Registrando archivo ${i + 1} en MongoDB:`, uploadResult.fileName);
          // Registrar cada archivo en MongoDB
          await registerPhotoInDB(file, uploadResult, 'local', formData);
        }
        console.log('✅ useHybridUpload: Todos los archivos registrados en MongoDB');
      } else if (result.data && result.data.files && Array.isArray(result.data.files)) {
        // Formato alternativo de respuesta
        console.log('💾 useHybridUpload: Registrando archivos en MongoDB (formato alternativo)...');
        for (let i = 0; i < result.data.files.length && i < filesToUpload.length; i++) {
          const uploadResult = result.data.files[i];
          const file = filesToUpload[i].file;
          
          console.log(`💾 useHybridUpload: Registrando archivo ${i + 1} en MongoDB:`, uploadResult.fileName);
          await registerPhotoInDB(file, uploadResult, 'local', formData);
        }
        console.log('✅ useHybridUpload: Todos los archivos registrados en MongoDB');
      }

      return true;

    } catch (error) {
      console.error('❌ useHybridUpload: Original upload error:', error);
      return false;
    }
  }, [registerPhotoInDB]);

  /**
   * Detecta automáticamente el sistema de subida disponible
   * CONFIGURADO PARA USAR SOLO CLOUDINARY
   */
  const detectUploadSystem = useCallback(async (): Promise<'cloudinary' | 'original'> => {
    console.log('🔍 useHybridUpload: Iniciando detección de sistema de upload...');
    console.log('☁️ useHybridUpload: FORZADO A USAR SOLO CLOUDINARY');
    
    // FORZAMOS EL USO DE CLOUDINARY SIEMPRE
    console.log('✅ useHybridUpload: Cloudinary system FORCED (configured for Cloudinary-only mode)');
    return 'cloudinary';
    
    // TODO: Código de detección original comentado (para revertir si es necesario)
    /*
    try {
      console.log('☁️ useHybridUpload: Verificando disponibilidad de Cloudinary...');
      // Verificar si Cloudinary está configurado
      const cloudinaryResponse = await fetch('/api/upload-fotos-cloudinary', {
        method: 'GET'
      });
      
      console.log('📡 useHybridUpload: Respuesta de Cloudinary:', {
        status: cloudinaryResponse.status,
        statusText: cloudinaryResponse.statusText,
        ok: cloudinaryResponse.ok
      });
      
      // Si el endpoint responde correctamente (200 OK), Cloudinary está disponible
      if (cloudinaryResponse.ok && cloudinaryResponse.status === 200) {
        console.log('✅ useHybridUpload: Cloudinary system detected and available');
        return 'cloudinary';
      } else if (cloudinaryResponse.status === 405) {
        // Método no permitido también significa que el endpoint existe
        console.log('✅ useHybridUpload: Cloudinary system detected (405 Method Not Allowed)');
        return 'cloudinary';
      } else {
        console.log('⚠️ useHybridUpload: Cloudinary response unexpected, status:', cloudinaryResponse.status);
      }
    } catch (error) {
      console.error('❌ useHybridUpload: Error checking Cloudinary availability:', error);
      console.log('📁 useHybridUpload: Cloudinary not available, using original system');
    }

    console.log('📁 useHybridUpload: Fallback to original system');
    return 'original';
    */
  }, []);

  /**
   * Función principal de subida con sistema híbrido
   */
  const uploadFiles = useCallback(async (
    files: FileList | File[],
    formData?: UploaderFormData
  ) => {
    console.log('🚀 useHybridUpload: Iniciando uploadFiles con:', {
      filesCount: files.length,
      formData: formData || 'Sin formData'
    });

    // Reiniciar estado
    setUploadState({
      files: [],
      uploading: true,
      progress: 0,
      error: null,
      success: false
    });
    console.log('🔄 useHybridUpload: Estado reiniciado, uploading=true');

    // Crear AbortController para esta subida
    abortControllerRef.current = new AbortController();
    console.log('🛑 useHybridUpload: AbortController creado');

    try {
      // Validar archivos
      const fileArray = Array.from(files);
      console.log('📋 useHybridUpload: Validando archivos:', fileArray.map(f => ({
        name: f.name,
        size: f.size,
        type: f.type
      })));

      // � COMPRESIÓN AUTOMÁTICA: Procesar archivos grandes
      const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB
      console.log('� useHybridUpload: Iniciando procesamiento inteligente de archivos...');

      const processedFiles: File[] = [];
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const fileSizeMB = (file.size / 1024 / 1024).toFixed(1);
        
        if (file.size > MAX_FILE_SIZE) {
          console.log(`📸 useHybridUpload: Archivo grande detectado: ${file.name} (${fileSizeMB}MB)`);
          
          try {
            console.log(`🔄 useHybridUpload: Comprimiendo ${file.name}...`);
            const compressedFile = await compressImage(file);
            const compressedSizeMB = (compressedFile.size / 1024 / 1024).toFixed(1);
            
            console.log(`✅ useHybridUpload: Compresión exitosa: ${fileSizeMB}MB → ${compressedSizeMB}MB`);
            processedFiles.push(compressedFile);
            
            // TODO: Agregar notificación de optimización al usuario
            
          } catch (compressionError) {
            console.error(`❌ useHybridUpload: Error comprimiendo ${file.name}:`, compressionError);
            const errorMessage = `No se pudo optimizar "${file.name}" (${fileSizeMB}MB). Intenta con una imagen de menor resolución.`;
            throw new Error(errorMessage);
          }
        } else {
          console.log(`✅ useHybridUpload: Archivo dentro del límite: ${file.name} (${fileSizeMB}MB)`);
          processedFiles.push(file);
        }
      }

      // Actualizar array de archivos con versiones procesadas
      fileArray.length = 0;
      fileArray.push(...processedFiles);

      console.log(`🎉 useHybridUpload: Procesamiento completado. ${processedFiles.length} archivos listos para upload`);
      
      // Crear FileList mock para validación
      const fileList = {
        ...fileArray,
        item: (index: number) => fileArray[index] || null
      } as FileList;
      
      console.log('🔍 useHybridUpload: Ejecutando validateFileList...');
      const validation = validateFileList(fileList);
      
      if (!validation.valid) {
        console.error('❌ useHybridUpload: Validación falló:', validation.error);
        throw new Error(validation.error || 'Error de validación');
      }
      console.log('✅ useHybridUpload: Validación exitosa');

      // Preparar archivos para subida
      console.log('📦 useHybridUpload: Preparando archivos para subida...');
      const filesToUpload: UploadFile[] = fileArray.map(file => ({
        file,
        id: generateFileId(file),
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
        progress: 0
      }));
      console.log('📦 useHybridUpload: Archivos preparados:', filesToUpload.length);

      // Actualizar estado con archivos preparados
      setUploadState(prev => ({
        ...prev,
        files: filesToUpload
      }));
      console.log('📊 useHybridUpload: Estado actualizado con archivos preparados');

      // Detectar sistema disponible
      console.log('🔍 useHybridUpload: Detectando sistema disponible...');
      const detectedSystemType = await detectUploadSystem();
      console.log('🎯 useHybridUpload: Sistema detectado:', detectedSystemType);
      setSystemType(detectedSystemType);

      let uploadSuccess = false;

      // MODO CLOUDINARY ONLY - Solo usar Cloudinary, sin fallback
      console.log('☁️ useHybridUpload: MODO CLOUDINARY ONLY - Intentando upload con Cloudinary...');
      uploadSuccess = await uploadWithCloudinary(filesToUpload, formData);
      console.log('☁️ useHybridUpload: Resultado Cloudinary:', uploadSuccess);
      
      // TODO: Código de fallback comentado (para revertir si es necesario)
      /*
      // Intentar subida con Cloudinary primero
      if (detectedSystemType === 'cloudinary') {
        console.log('☁️ useHybridUpload: Intentando upload con Cloudinary...');
        uploadSuccess = await uploadWithCloudinary(filesToUpload, formData);
        console.log('☁️ useHybridUpload: Resultado Cloudinary:', uploadSuccess);
        
        // Si Cloudinary falla, hacer fallback al sistema original
        if (!uploadSuccess) {
          console.log('⚠️ useHybridUpload: Cloudinary falló, iniciando fallback a sistema original...');
          setSystemType('original');
          uploadSuccess = await uploadWithOriginal(filesToUpload, formData);
          console.log('📁 useHybridUpload: Resultado sistema original (fallback):', uploadSuccess);
        }
      } else {
        // Usar sistema original directamente
        console.log('📁 useHybridUpload: Usando sistema original directamente...');
        uploadSuccess = await uploadWithOriginal(filesToUpload, formData);
        console.log('📁 useHybridUpload: Resultado sistema original (directo):', uploadSuccess);
      }
      */

      if (uploadSuccess) {
        console.log('🎉 useHybridUpload: Upload completado exitosamente');
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          success: true,
          progress: 100
        }));
      } else {
        console.error('❌ useHybridUpload: Todos los sistemas de upload fallaron');
        throw new Error('All upload systems failed');
      }

      // Limpiar URLs de preview
      console.log('🧹 useHybridUpload: Limpiando URLs de preview...');
      filesToUpload.forEach(fileObj => {
        URL.revokeObjectURL(fileObj.preview);
      });
      console.log('✅ useHybridUpload: URLs de preview limpiadas');

    } catch (error) {
      console.error('❌ useHybridUpload: Error en uploadFiles:', {
        error: error,
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        success: false
      }));
    }
  }, [uploadWithCloudinary, uploadWithOriginal, detectUploadSystem]);

  /**
   * Cancela la subida en progreso
   */
  const cancelUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setUploadState(prev => ({
      ...prev,
      uploading: false,
      error: 'Subida cancelada por el usuario',
      success: false
    }));
  }, []);

  /**
   * Reinicia el estado del hook
   */
  const resetUpload = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setUploadState({
      files: [],
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });
    
    setSystemType(null);
  }, []);

  /**
   * Funciones para cambio manual de sistema (desarrollo)
   */
  const switchToOriginal = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      setSystemType('original');
    }
  }, []);

  const switchToCloudinary = useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      setSystemType('cloudinary');
    }
  }, []);

  return {
    uploadState,
    systemType,
    uploadFiles,
    cancelUpload,
    resetUpload,
    // Funciones de desarrollo
    switchToOriginal,
    switchToCloudinary
  };
};
