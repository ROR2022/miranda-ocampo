import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Photo from '@/models/Photo'

export async function POST() {
  try {
    await connectDB()

    // Datos de prueba simples
    const testPhotoData = {
      filename: 'test-photo.jpg',
      originalName: 'test-photo.jpg',
      cloudinaryId: 'test_cloudinary_id_123',
      cloudinaryUrl: 'https://res.cloudinary.com/test/image/upload/test_cloudinary_id_123.jpg',
      uploadSource: 'cloudinary' as const,
      fileSize: 1024000, // 1MB
      mimeType: 'image/jpeg',
      dimensions: {
        width: 1920,
        height: 1080
      },
      uploader: {
        name: 'Test User',
        ip: '127.0.0.1',
        userAgent: 'Test Browser'
      },
      eventMoment: 'ceremonia' as const,
      comment: 'Foto de prueba para verificar MongoDB',
      tags: ['test', 'mongodb', 'boda']
    }

    console.log('🧪 Creating test photo in MongoDB:', testPhotoData);

    const photo = new Photo(testPhotoData)
    await photo.save()

    console.log('✅ Test photo saved successfully:', photo._id);

    return NextResponse.json({ 
      success: true, 
      message: 'Foto de prueba creada exitosamente',
      photoId: photo._id,
      photo: photo
    }, { status: 201 })

  } catch (error) {
    console.error('❌ Error creating test photo:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()

    // Obtener todas las fotos para verificar
    const photos = await Photo.find().sort({ uploadedAt: -1 }).limit(10)

    return NextResponse.json({
      success: true,
      message: `Encontradas ${photos.length} fotos`,
      photos: photos
    })

  } catch (error) {
    console.error('❌ Error fetching photos:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
