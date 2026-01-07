// 📸 API Endpoint - Obtener fotos de la galería colaborativa
// GET /api/fotos-galeria

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'boda-maribel-godofredo');
const METADATA_PATH = path.join(UPLOAD_DIR, 'metadata', 'uploads.json');

export async function GET(request: NextRequest) {
  try {
    console.log('📸 Fetching gallery photos...');

    // Verificar si existe el archivo de metadata
    if (!existsSync(METADATA_PATH)) {
      console.log('📁 No metadata file found, returning empty gallery');
      return NextResponse.json({
        success: true,
        data: {
          photos: [],
          totalPhotos: 0,
          totalUploads: 0,
          lastUpdate: null
        }
      });
    }

    // Leer metadata de uploads
    const metadataContent = await readFile(METADATA_PATH, 'utf-8');
    const uploads = JSON.parse(metadataContent);

    // Extraer todas las fotos de todos los uploads
    const allPhotos = [];
    
    for (const upload of uploads) {
      for (const file of upload.files) {
        const photo = {
          id: file.id,
          originalName: file.originalName,
          fileName: file.fileName,
          uploadedAt: file.uploadedAt,
          uploaderName: upload.uploaderName,
          eventMoment: upload.eventMoment,
          comment: upload.comment,
          size: file.size,
          type: file.type,
          paths: {
            original: file.paths.original,
            compressed: file.paths.compressed,
            thumbnail: file.paths.thumbnail
          },
          // Metadata del upload
          uploadId: upload.id,
          uploadDate: upload.date,
          uploadTimestamp: upload.timestamp
        };
        
        allPhotos.push(photo);
      }
    }

    // Ordenar por fecha de subida (más recientes primero)
    allPhotos.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    // Obtener parámetros de query para paginación
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const eventMoment = url.searchParams.get('eventMoment');
    const uploader = url.searchParams.get('uploader');

    // Filtrar si es necesario
    let filteredPhotos = allPhotos;
    
    if (eventMoment && eventMoment !== 'all') {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.eventMoment.toLowerCase().includes(eventMoment.toLowerCase())
      );
    }
    
    if (uploader && uploader !== 'all') {
      filteredPhotos = filteredPhotos.filter(photo => 
        photo.uploaderName.toLowerCase().includes(uploader.toLowerCase())
      );
    }

    // Paginación
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPhotos = filteredPhotos.slice(startIndex, endIndex);

    // Estadísticas
    const stats = {
      totalPhotos: allPhotos.length,
      filteredPhotos: filteredPhotos.length,
      totalUploads: uploads.length,
      uploaders: [...new Set(allPhotos.map(photo => photo.uploaderName))],
      eventMoments: [...new Set(allPhotos.map(photo => photo.eventMoment))],
      lastUpdate: uploads.length > 0 ? uploads[uploads.length - 1].timestamp : null,
      dateRange: {
        first: allPhotos.length > 0 ? allPhotos[allPhotos.length - 1].uploadedAt : null,
        last: allPhotos.length > 0 ? allPhotos[0].uploadedAt : null
      }
    };

    console.log(`✅ Gallery loaded: ${paginatedPhotos.length} photos (page ${page})`);

    return NextResponse.json({
      success: true,
      data: {
        photos: paginatedPhotos,
        pagination: {
          page,
          limit,
          total: filteredPhotos.length,
          pages: Math.ceil(filteredPhotos.length / limit),
          hasNext: endIndex < filteredPhotos.length,
          hasPrev: page > 1
        },
        stats,
        filters: {
          eventMoment: eventMoment || 'all',
          uploader: uploader || 'all'
        }
      }
    });

  } catch (error) {
    console.error('❌ Error loading gallery:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al cargar la galería',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
