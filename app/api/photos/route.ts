import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Photo from '@/models/Photo'

interface PhotoData {
  // Identificación
  filename: string;
  originalName: string;
  
  // URLs y Storage
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  uploadSource: 'cloudinary' | 'local';
  
  // Metadata del archivo
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  
  // Información del usuario
  uploader: {
    name?: string;
    ip: string;
    userAgent: string;
  };
  
  // Contexto de la boda
  eventMoment?: string;
  comment?: string;
  
  // Control y moderación
  uploadedAt?: Date;
  isPublic?: boolean;
  status?: 'uploading' | 'ready' | 'processing' | 'error';
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  
  // Metadata adicional
  tags?: string[];
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20') // ✅ Mantenemos 20 como óptimo
    
    // 🎯 Filtros específicos para galería de quinceañera
    const eventMoment = searchParams.get('eventMoment')
    const uploaderName = searchParams.get('uploaderName')
    const uploadSource = searchParams.get('uploadSource')
    const sortBy = searchParams.get('sortBy') || 'uploadedAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const isPublic = searchParams.get('isPublic')
    const status = searchParams.get('status')

    // 🔍 Construir query optimizada
    const query: Record<string, unknown> = {}
    
    // Filtros específicos de la galería
    if (eventMoment && eventMoment !== 'all') {
      query.eventMoment = eventMoment
    }
    
    if (uploaderName && uploaderName !== 'all') {
      query['uploader.name'] = uploaderName
    }
    
    if (uploadSource && uploadSource !== 'all') {
      query.uploadSource = uploadSource === 'local' ? 'original' : uploadSource
    }

    if (isPublic) {
      query.isPublic = isPublic === 'true'
    }

    if (status) {
      query.status = status
    }

    // 📊 Cálculos de paginación
    const skip = (page - 1) * limit
    
    // 🚀 Definir orden (siempre fotos más recientes primero por defecto)
    const sortConfig: Record<string, 1 | -1> = {}
    sortConfig[sortBy] = sortOrder === 'asc' ? 1 : -1

    console.log('📸 Photos API Query:', { 
      query, 
      page, 
      limit, 
      sortBy, 
      sortOrder,
      skip 
    })

    // 🎯 Consulta optimizada con campos selectivos
    const [photos, total] = await Promise.all([
      Photo.find(query)
        .sort(sortConfig) // ✅ Orden dinámico, por defecto uploadedAt desc
        .skip(skip)
        .limit(limit)
        .select('filename originalName uploadedAt eventMoment comment cloudinaryUrl localPath uploadSource fileSize mimeType dimensions viewCount status isPublic uploader') // ✅ Solo campos necesarios
        .populate('uploader', 'name') // ✅ Optimizar populate
        .lean(), // ✅ Performance boost
      Photo.countDocuments(query)
    ])

    // 📊 Información de paginación mejorada
    const pages = Math.ceil(total / limit)
    const hasNext = page < pages
    const hasPrev = page > 1

    console.log('✅ Photos fetched:', { 
      count: photos.length, 
      total, 
      page, 
      pages, 
      hasNext, 
      hasPrev 
    })

    return NextResponse.json({
      success: true,
      photos,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext, // ✅ Información útil para Load More
        hasPrev, // ✅ Información útil para navegación
        totalPages: pages // ✅ Alias por compatibilidad
      }
    })
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const photoData: PhotoData = await request.json()

    console.log('📸 Received photo data for MongoDB:', photoData);

    // Validación básica
    if (!photoData.filename) {
      return NextResponse.json(
        { error: 'filename es requerido' },
        { status: 400 }
      )
    }

    if (!photoData.originalName) {
      return NextResponse.json(
        { error: 'originalName es requerido' },
        { status: 400 }
      )
    }

    if (!photoData.uploadSource) {
      return NextResponse.json(
        { error: 'uploadSource es requerido' },
        { status: 400 }
      )
    }

    // Validar que tenga al menos una URL
    if (!photoData.cloudinaryUrl && !photoData.localPath) {
      return NextResponse.json(
        { error: 'Se requiere cloudinaryUrl o localPath' },
        { status: 400 }
      )
    }

    const photo = new Photo({
      ...photoData,
      uploadedAt: photoData.uploadedAt || new Date(),
      isPublic: photoData.isPublic !== false, // Por defecto true
      status: photoData.status || 'ready',
      moderationStatus: photoData.moderationStatus || 'approved'
    })

    await photo.save()

    console.log('✅ Photo saved to MongoDB:', photo._id);

    return NextResponse.json(photo, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating photo:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}