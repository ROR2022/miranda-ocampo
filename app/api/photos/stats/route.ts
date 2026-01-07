import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Photo from '@/models/Photo';

// GET /api/photos/stats - Obtener estadísticas de fotos
export async function GET() {
  try {
    await connectDB();
    
    console.log('📊 Photos Stats API - GET request received');
    
    // Estadísticas generales
    const [
      totalPhotos,
      publicPhotos,
      totalViews,
      bySource,
      byEventMoment,
      byStatus,
      recentUploads,
      topViewedPhotos
    ] = await Promise.all([
      // Total de fotos
      Photo.countDocuments(),
      
      // Fotos públicas
      Photo.countDocuments({ isPublic: true, status: 'ready' }),
      
      // Total de visualizaciones
      Photo.aggregate([
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]).then(result => result[0]?.totalViews || 0),
      
      // Por fuente de upload
      Photo.aggregate([
        {
          $group: {
            _id: '$uploadSource',
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' }
          }
        }
      ]),
      
      // Por momento del evento
      Photo.aggregate([
        {
          $group: {
            _id: '$eventMoment',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Por status
      Photo.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Uploads recientes (últimos 7 días)
      Photo.aggregate([
        {
          $match: {
            uploadedAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$uploadedAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Fotos más vistas
      Photo.find({ isPublic: true, status: 'ready' })
        .sort({ viewCount: -1 })
        .limit(5)
        .select('filename originalName viewCount eventMoment uploadedAt')
    ]);
    
    // Calcular tamaño promedio de archivo
    const avgFileSize = await Photo.aggregate([
      { $group: { _id: null, avgSize: { $avg: '$fileSize' } } }
    ]).then(result => result[0]?.avgSize || 0);
    
    // Preparar respuesta
    const stats = {
      general: {
        totalPhotos,
        publicPhotos,
        totalViews,
        avgFileSize: Math.round(avgFileSize),
        avgFileSizeFormatted: formatBytes(avgFileSize)
      },
      
      distribution: {
        bySource: bySource.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            totalSize: item.totalSize,
            totalSizeFormatted: formatBytes(item.totalSize)
          };
          return acc;
        }, {} as Record<string, { count: number; totalSize: number; totalSizeFormatted: string }>),
        
        byEventMoment: byEventMoment.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        
        byStatus: byStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>)
      },
      
      trends: {
        recentUploads: recentUploads.map(item => ({
          date: item._id,
          uploads: item.count
        })),
        
        topViewed: topViewedPhotos.map(photo => ({
          id: photo._id,
          filename: photo.filename,
          originalName: photo.originalName,
          viewCount: photo.viewCount,
          eventMoment: photo.eventMoment,
          uploadedAt: photo.uploadedAt
        }))
      },
      
      metadata: {
        generatedAt: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };
    
    console.log('✅ Stats generated successfully:', {
      totalPhotos: stats.general.totalPhotos,
      publicPhotos: stats.general.publicPhotos,
      totalViews: stats.general.totalViews
    });
    
    return NextResponse.json({
      success: true,
      stats
    });
    
  } catch (error) {
    console.error('❌ Error generating stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar estadísticas',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Función auxiliar para formatear bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
