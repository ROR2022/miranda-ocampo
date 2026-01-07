import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Photo from '@/models/Photo'

// GET /api/photos/check-new - Verificar si hay fotos nuevas desde una fecha específica
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const since = searchParams.get('since') // ISO string de la fecha desde la cual verificar
    
    console.log('🔍 Check New Photos API - since:', since)
    
    if (!since) {
      return NextResponse.json(
        { success: false, error: 'Parámetro "since" es requerido' },
        { status: 400 }
      )
    }
    
    try {
      const sinceDate = new Date(since)
      
      // Verificar si la fecha es válida
      if (isNaN(sinceDate.getTime())) {
        return NextResponse.json(
          { success: false, error: 'Fecha "since" inválida' },
          { status: 400 }
        )
      }
      
      // Contar fotos más recientes que la fecha proporcionada
      const newPhotosCount = await Photo.countDocuments({
        uploadedAt: { $gt: sinceDate },
        isPublic: true,
        status: 'ready'
      })
      
      // Obtener información de las fotos más recientes (máximo 5 para preview)
      const recentPhotos = newPhotosCount > 0 ? await Photo.find({
        uploadedAt: { $gt: sinceDate },
        isPublic: true,
        status: 'ready'
      })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select('filename originalName uploadedAt uploader eventMoment')
      .populate('uploader', 'name')
      .lean() : []
      
      console.log('✅ New photos check completed:', { 
        since: sinceDate, 
        newCount: newPhotosCount,
        hasNew: newPhotosCount > 0 
      })
      
      return NextResponse.json({
        success: true,
        hasNew: newPhotosCount > 0,
        count: newPhotosCount,
        since: sinceDate.toISOString(),
        recentPhotos: recentPhotos.map(photo => ({
          id: photo._id,
          filename: photo.filename,
          originalName: photo.originalName,
          uploadedAt: photo.uploadedAt,
          uploaderName: photo.uploader?.name || 'Invitado',
          eventMoment: photo.eventMoment
        }))
      })
      
    } catch (dateError) {
      console.error('❌ Date parsing error:', dateError)
      return NextResponse.json(
        { success: false, error: 'Error procesando fecha' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('❌ Error checking new photos:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error verificando fotos nuevas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}