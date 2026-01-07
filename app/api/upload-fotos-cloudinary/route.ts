// 📸 API Endpoint - Upload de fotos a Cloudinary para invitados VIP
// POST /api/upload-fotos-cloudinary

import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImages } from '@/lib/uploadToCloudinary';
import { validateCloudinaryConfig } from '@/lib/cloudinary';

// Configuración del upload
const UPLOAD_CONFIG = {
  maxFileSize: 4.5 * 1024 * 1024, // 4.5MB - Límite unificado con frontend
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles: 10,
};

// Función para validar archivos
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Validar tipo de archivo
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}. Tipos permitidos: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`
    };
  }

  // Validar tamaño
  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    const maxSizeMB = UPLOAD_CONFIG.maxFileSize / (1024 * 1024);
    return {
      valid: false,
      error: `El archivo ${file.name} excede el tamaño máximo de ${maxSizeMB}MB`
    };
  }

  // Validar que el archivo no esté vacío
  if (file.size === 0) {
    return {
      valid: false,
      error: `El archivo ${file.name} está vacío`
    };
  }

  return { valid: true };
};

// Función para sanitizar metadata del usuario
const sanitizeUserInput = (input: string | null): string => {
  if (!input) return '';
  return input.trim().substring(0, 100); // Limitar longitud y espacios
};

// Función para guardar metadata del upload
const saveUploadMetadata = async (metadata: {
  uploadId: string;
  files: Record<string, unknown>[];
  uploaderName: string;
  eventMoment: string;
  comment: string;
  timestamp: string;
  totalFiles: number;
  totalSize: number;
  cloudinaryFolder: string;
}) => {
  // Por ahora solo log, pero se puede extender para guardar en DB o archivo
  console.log('📊 Upload metadata saved:', {
    uploadId: metadata.uploadId,
    totalFiles: metadata.totalFiles,
    totalSize: `${(metadata.totalSize / (1024 * 1024)).toFixed(2)}MB`,
    uploaderName: metadata.uploaderName,
    eventMoment: metadata.eventMoment,
    timestamp: metadata.timestamp,
  });
  
  // TODO: Implementar persistencia real (JSON file, database, etc.)
  return true;
};

export async function POST(request: NextRequest) {
  console.log('📸 Cloudinary upload request received');

  try {
    // Validar configuración de Cloudinary
    if (!validateCloudinaryConfig()) {
      return NextResponse.json({
        success: false,
        message: 'Configuración de Cloudinary incompleta. Verifica las variables de entorno.',
      }, { status: 500 });
    }

    // Obtener datos del formulario
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    // Validaciones básicas
    if (!files || files.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se proporcionaron archivos para subir' 
      }, { status: 400 });
    }

    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return NextResponse.json({ 
        success: false, 
        message: `Máximo ${UPLOAD_CONFIG.maxFiles} archivos permitidos. Recibidos: ${files.length}` 
      }, { status: 400 });
    }

    // Validar cada archivo individualmente
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json({
          success: false,
          message: validation.error,
        }, { status: 400 });
      }
    }

    // Obtener metadata del usuario
    const uploaderName = sanitizeUserInput(formData.get('uploaderName') as string) || 'Anónimo';
    const eventMoment = sanitizeUserInput(formData.get('eventMoment') as string) || 'general';
    const comment = sanitizeUserInput(formData.get('comment') as string) || '';

    console.log(`📤 Processing ${files.length} files for ${uploaderName}`);

    // Preparar archivos para upload
    const filesToUpload = await Promise.all(
      files.map(async (file, index) => ({
        buffer: Buffer.from(await file.arrayBuffer()),
        fileName: file.name,
        options: {
          context: {
            uploaderName,
            eventMoment,
            comment,
            uploadDate: new Date().toISOString(),
            originalSize: file.size.toString(),
            originalType: file.type,
            fileIndex: index.toString(),
          },
          tags: ['boda', 'invitados', 'maribel-godofredo', eventMoment],
        },
      }))
    );

    // Subir a Cloudinary
    console.log('☁️  Uploading to Cloudinary...');
    const uploadResults = await uploadMultipleImages(filesToUpload);

    // Formatear resultados para el cliente
    const formattedResults = uploadResults.map((result, index) => ({
      originalName: files[index].name,
      size: files[index].size,
      type: files[index].type,
      cloudinaryId: result.metadata.publicId,
      uploadedAt: result.metadata.uploadedAt,
      urls: result.urls,
      metadata: {
        width: result.metadata.width,
        height: result.metadata.height,
        format: result.metadata.format,
        optimizedSize: result.metadata.size,
      },
    }));

    // Generar ID único para este upload
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalSize = files.reduce((sum, file) => sum + file.size, 0);

    // Guardar metadata del upload
    await saveUploadMetadata({
      uploadId,
      files: formattedResults,
      uploaderName,
      eventMoment,
      comment,
      timestamp: new Date().toISOString(),
      totalFiles: files.length,
      totalSize,
      cloudinaryFolder: 'boda-maribel-godofredo',
    });

    console.log(`✅ Upload completed successfully: ${files.length} files`);

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `${files.length} ${files.length === 1 ? 'archivo subido' : 'archivos subidos'} exitosamente`,
      data: {
        uploadId,
        files: formattedResults,
        totalFiles: files.length,
        totalSize,
        uploaderName,
        eventMoment,
        comment,
        uploadedAt: new Date().toISOString(),
      },
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Upload error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error interno del servidor durante el upload';

    return NextResponse.json({
      success: false,
      message: 'Error durante el upload de archivos',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Manejar OPTIONS para CORS (si es necesario)
export async function OPTIONS() {
  return NextResponse.json(
    { success: true },
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
