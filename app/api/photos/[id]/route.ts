import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Photo from '@/models/Photo'
import mongoose from 'mongoose'

// GET /api/photos/[id] - Obtener foto específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = params
    
    console.log('📸 Photo API - GET by ID:', id)
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de foto inválido' },
        { status: 400 }
      )
    }
    
    // Buscar foto y incrementar visualizaciones
    const photo = await Photo.findById(id)
    
    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Foto no encontrada' },
        { status: 404 }
      )
    }
    
    // Incrementar contador de visualizaciones
    await photo.incrementView()
    
    console.log('✅ Photo retrieved and view incremented:', photo._id)
    
    return NextResponse.json({
      success: true,
      photo: {
        _id: photo._id,
        filename: photo.filename,
        originalName: photo.originalName,
        displayUrl: photo.uploadSource === 'cloudinary' && photo.cloudinaryUrl
          ? photo.cloudinaryUrl.replace('/upload/', '/upload/f_auto,q_auto,w_1200/')
          : photo.localPath,
        uploadSource: photo.uploadSource,
        dimensions: photo.dimensions,
        eventMoment: photo.eventMoment,
        comment: photo.comment,
        uploader: photo.uploader,
        uploadedAt: photo.uploadedAt,
        viewCount: photo.viewCount,
        tags: photo.tags
      }
    })
    
  } catch (error) {
    console.error('❌ Error fetching photo by ID:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener foto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// PUT /api/photos/[id] - Actualizar metadatos de foto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = params
    const updates: Record<string, unknown> = await request.json()
    
    console.log('📸 Photo API - PUT by ID:', id, updates)
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de foto inválido' },
        { status: 400 }
      )
    }
    
    // Campos permitidos para actualizar
    const allowedFields = [
      'comment',
      'eventMoment',
      'tags',
      'isPublic',
      'moderationStatus'
    ]
    
    // Filtrar solo campos permitidos
    const filteredUpdate = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj: Record<string, unknown>, key) => {
        obj[key] = updates[key]
        return obj
      }, {})
    
    if (Object.keys(filteredUpdate).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay campos válidos para actualizar' },
        { status: 400 }
      )
    }
    
    // Actualizar foto
    const updatedPhoto = await Photo.findByIdAndUpdate(
      id,
      filteredUpdate,
      { new: true, runValidators: true }
    )
    
    if (!updatedPhoto) {
      return NextResponse.json(
        { success: false, error: 'Foto no encontrada' },
        { status: 404 }
      )
    }
    
    console.log('✅ Photo updated successfully:', updatedPhoto._id)
    
    return NextResponse.json({
      success: true,
      message: 'Foto actualizada exitosamente',
      photo: {
        _id: updatedPhoto._id,
        filename: updatedPhoto.filename,
        comment: updatedPhoto.comment,
        eventMoment: updatedPhoto.eventMoment,
        tags: updatedPhoto.tags,
        isPublic: updatedPhoto.isPublic,
        moderationStatus: updatedPhoto.moderationStatus
      }
    })
    
  } catch (error) {
    console.error('❌ Error updating photo:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al actualizar foto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// DELETE /api/photos/[id] - Eliminar foto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const { id } = params
    
    console.log('📸 Photo API - DELETE by ID:', id)
    
    // Validar ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de foto inválido' },
        { status: 400 }
      )
    }
    
    // Buscar foto antes de eliminar para obtener información
    const photo = await Photo.findById(id)
    
    if (!photo) {
      return NextResponse.json(
        { success: false, error: 'Foto no encontrada' },
        { status: 404 }
      )
    }
    
    // Eliminar de la base de datos
    await Photo.findByIdAndDelete(id)
    
    console.log('✅ Photo deleted successfully:', photo._id)
    console.log('⚠️ Note: Physical file cleanup should be handled separately')
    
    return NextResponse.json({
      success: true,
      message: 'Foto eliminada exitosamente',
      deletedPhoto: {
        _id: photo._id,
        filename: photo.filename,
        uploadSource: photo.uploadSource,
        cloudinaryId: photo.cloudinaryId,
        localPath: photo.localPath
      }
    })
    
  } catch (error) {
    console.error('❌ Error deleting photo:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al eliminar foto',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
