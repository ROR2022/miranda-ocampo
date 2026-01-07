// 📸 API Endpoint SIMPLE - Upload de fotos (sin compresión)
// POST /api/upload-fotos-simple

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Configuración del upload
const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles: 10,
  uploadDir: path.join(process.cwd(), 'public', 'uploads', 'boda-maribel-godofredo')
};

// Función para sanitizar nombres de archivo
const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .toLowerCase();
};

// Función para generar nombre único
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const extension = path.extname(originalName);
  const nameWithoutExt = path.basename(originalName, extension);
  const sanitizedName = sanitizeFileName(nameWithoutExt);
  
  return `${timestamp}_${random}_${sanitizedName}${extension}`;
};

// Función para crear directorios necesarios
const ensureDirectories = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Creating directories for date:', today);
    
    const directories = [
      path.join(UPLOAD_CONFIG.uploadDir, 'fotos', today, 'original'),
      path.join(UPLOAD_CONFIG.uploadDir, 'metadata'),
      path.join(UPLOAD_CONFIG.uploadDir, 'logs')
    ];

    for (const dir of directories) {
      if (!existsSync(dir)) {
        console.log('📁 Creating directory:', dir);
        await mkdir(dir, { recursive: true });
        console.log('✅ Directory created:', dir);
      } else {
        console.log('📂 Directory already exists:', dir);
      }
    }

    console.log('✅ All directories ready');
    return today;
  } catch (error) {
    console.error('❌ Error creating directories:', error);
    throw new Error(`Directory creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Función para guardar metadata
const saveMetadata = async (uploadData: {
  id: string;
  timestamp: string;
  date: string;
  uploaderName: string;
  eventMoment: string;
  comment: string;
  totalFiles: number;
  totalSize: number;
  files: Array<{
    originalName: string;
    fileName: string;
    size: number;
    type: string;
    paths: {
      original: string;
      compressed: string;
      thumbnail: string;
    };
  }>;
  userAgent: string;
}) => {
  const metadataPath = path.join(UPLOAD_CONFIG.uploadDir, 'metadata', 'uploads.json');
  const logPath = path.join(UPLOAD_CONFIG.uploadDir, 'logs', 'upload-history.log');

  try {
    // Leer metadata existente
    let existingData = [];
    if (existsSync(metadataPath)) {
      const data = await import('fs').then(fs => 
        fs.promises.readFile(metadataPath, 'utf-8')
      );
      existingData = JSON.parse(data);
    }

    // Agregar nueva entrada
    existingData.push(uploadData);

    // Guardar metadata actualizada
    await writeFile(metadataPath, JSON.stringify(existingData, null, 2));

    // Log de upload
    const logEntry = `${new Date().toISOString()} - Upload: ${uploadData.files.length} files by ${uploadData.uploaderName || 'Anonymous'}\n`;
    await writeFile(logPath, logEntry, { flag: 'a' });

  } catch (error) {
    console.error('Error saving metadata:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    console.log('📸 Starting SIMPLE file upload process...');
    
    // Obtener FormData
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const uploaderName = formData.get('uploaderName') as string;
    const userName = formData.get('userName') as string;
    const eventMoment = formData.get('eventMoment') as string;
    const comment = formData.get('comment') as string;

    console.log('📄 Form data received:', {
      filesCount: files.length,
      uploaderName,
      userName,
      eventMoment,
      comment
    });

    // Validar que hay archivos
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No se recibieron archivos' },
        { status: 400 }
      );
    }

    // Validar número de archivos
    if (files.length > UPLOAD_CONFIG.maxFiles) {
      return NextResponse.json(
        { success: false, message: `Máximo ${UPLOAD_CONFIG.maxFiles} archivos permitidos` },
        { status: 400 }
      );
    }

    // Crear directorios necesarios
    const today = await ensureDirectories();
    console.log(`📁 Directories created for date: ${today}`);

    // Procesar cada archivo (SIMPLE - solo guardar originales)
    const processedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`🔄 Processing file ${i + 1}/${files.length}: ${file.name} (${file.size} bytes)`);

      try {
        // Validar tipo de archivo
        if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
          throw new Error(`Tipo de archivo no permitido: ${file.type}`);
        }

        // Validar tamaño
        if (file.size > UPLOAD_CONFIG.maxFileSize) {
          throw new Error(`Archivo demasiado grande: ${file.name}`);
        }

        // Convertir a buffer
        console.log('🔄 Converting file to buffer...');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        console.log('✅ Buffer created, size:', buffer.length);

        // Generar nombre único
        const uniqueFileName = generateUniqueFileName(file.name);
        console.log('📝 Generated unique filename:', uniqueFileName);
        
        // Guardar archivo original
        const originalPath = path.join(UPLOAD_CONFIG.uploadDir, 'fotos', today, 'original', uniqueFileName);
        console.log('💾 Saving original file to:', originalPath);
        await writeFile(originalPath, buffer);
        console.log('✅ Original file saved');

        const fileData = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          originalName: file.name,
          fileName: uniqueFileName,
          size: file.size,
          type: file.type,
          paths: {
            original: `/uploads/boda-maribel-godofredo/fotos/${today}/original/${uniqueFileName}`,
            compressed: `/uploads/boda-maribel-godofredo/fotos/${today}/original/${uniqueFileName}`, // Same as original for now
            thumbnail: `/uploads/boda-maribel-godofredo/fotos/${today}/original/${uniqueFileName}` // Same as original for now
          },
          uploadedAt: new Date().toISOString(),
          uploaderName: uploaderName || userName || 'Anónimo',
          eventMoment: eventMoment || 'No especificado',
          comment: comment || ''
        };

        processedFiles.push(fileData);
        console.log(`✅ File processed successfully: ${file.name}`);
        
      } catch (fileError) {
        console.error(`❌ Error processing file ${file.name}:`, fileError);
        return NextResponse.json(
          { 
            success: false, 
            message: `Error procesando ${file.name}: ${fileError instanceof Error ? fileError.message : 'Error desconocido'}`,
            error: 'FILE_PROCESSING_ERROR'
          },
          { status: 400 }
        );
      }
    }

    // Guardar metadata
    const uploadMetadata = {
      id: `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      date: today,
      uploaderName: uploaderName || userName || 'Anónimo',
      eventMoment: eventMoment || 'No especificado',
      comment: comment || '',
      totalFiles: processedFiles.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0),
      files: processedFiles,
      userAgent: request.headers.get('user-agent') || 'Unknown'
    };

    await saveMetadata(uploadMetadata);

    console.log(`🎉 SIMPLE Upload completed successfully: ${processedFiles.length} files`);

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `${processedFiles.length} foto${processedFiles.length > 1 ? 's' : ''} subida${processedFiles.length > 1 ? 's' : ''} exitosamente (modo simple)`,
      data: {
        uploadId: uploadMetadata.id,
        totalFiles: processedFiles.length,
        files: processedFiles,
        timestamp: uploadMetadata.timestamp
      }
    });

  } catch (error) {
    console.error('❌ SIMPLE Upload error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor durante la subida',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
