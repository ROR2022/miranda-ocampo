import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

// GET - Obtener estadísticas básicas de invitados con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // ✅ Obtener parámetros de filtros de la URL (igual que en /api/guests)
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const relation = searchParams.get('relation');
    
    console.log('📊 [API /guests/stats] Filters received:', {
      search: search,
      status: status,
      relation: relation,
      timestamp: new Date().toISOString()
    });
    
    // 🔄 Construir filtro base (igual que en /api/guests)
    const baseFilter: Record<string, unknown> = {};
    
    // Filtro por búsqueda (nombre)
    if (search && search.trim()) {
      baseFilter.name = { $regex: search.trim(), $options: 'i' };
    }
    
    // Filtro por estado
    if (status && status !== 'all') {
      baseFilter.status = status;
    }
    
    // Filtro por relación
    if (relation && relation !== 'all') {
      baseFilter.relation = relation;
    }
    
    console.log('🗃️ [API /guests/stats] MongoDB filter constructed:', baseFilter);
    
    // ✅ Obtener estadísticas básicas con filtros aplicados
    const totalGuests = await Guest.countDocuments(baseFilter);
    
    // Estadísticas de confirmación con filtros
    const confirmationStats = await Guest.aggregate([
      { $match: baseFilter }, // ✅ Aplicar filtros base
      {
        $group: {
          _id: null,
          totalConfirmed: {
            $sum: { $cond: [{ $eq: ['$attendance.confirmed', true] }, 1, 0] }
          },
          totalInvited: {
            $sum: { $cond: [{ $eq: ['$status', 'invited'] }, 1, 0] }
          },
          totalPending: {
            // ✅ CORREGIDO: Contar invitados que NO han confirmado asistencia
            $sum: { $cond: [{ $ne: ['$attendance.confirmed', true] }, 1, 0] }
          },
          totalGuestCount: {
            $sum: {
              $cond: [
                { $eq: ['$attendance.confirmed', true] },
                '$attendance.numberOfGuestsConfirmed',
                '$personalInvitation.numberOfGuests'
              ]
            }
          }
        }
      }
    ]);
    
    const stats = confirmationStats[0] || {
      totalConfirmed: 0,
      totalInvited: 0, 
      totalPending: 0,
      totalGuestCount: 0
    };
    
    // Calcular tasa de confirmación
    const confirmationRate = totalGuests > 0 ? Math.round((stats.totalConfirmed / totalGuests) * 100) : 0;
    
    // ✅ Obtener estadísticas por relación con filtros aplicados
    const relationStats = await Guest.aggregate([
      { $match: baseFilter }, // ✅ Aplicar filtros base
      {
        $group: {
          _id: '$relation',
          count: { $sum: 1 },
          confirmed: {
            $sum: {
              $cond: [{ $eq: ['$attendance.confirmed', true] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // ✅ Obtener estadísticas de confirmaciones por día con filtros aplicados
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const dailyConfirmationFilter = {
      ...baseFilter, // ✅ Incluir filtros base
      'attendance.confirmed': true,
      'attendance.confirmedAt': { $gte: sevenDaysAgo }
    };
    
    const dailyConfirmations = await Guest.aggregate([
      { $match: dailyConfirmationFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$attendance.confirmedAt'
            }
          },
          count: { $sum: 1 },
          totalGuests: { $sum: '$attendance.numberOfGuestsConfirmed' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // ✅ Obtener invitados recientes con filtros aplicados
    const recentGuests = await Guest.find(baseFilter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name relation status createdAt attendance.confirmed attendance.confirmedAt')
      .lean();
    
    // ✅ Formatear respuesta con estadísticas filtradas
    const response = {
      // Estadísticas principales (con filtros aplicados)
      overview: {
        totalGuests: totalGuests,
        totalConfirmed: stats.totalConfirmed,
        totalInvited: stats.totalInvited,
        totalPending: stats.totalPending,
        totalGuestCount: stats.totalGuestCount || 0,
        confirmationRate: confirmationRate
      },
      
      // Estadísticas por relación
      byRelation: relationStats.map(item => ({
        relation: item._id,
        total: item.count,
        confirmed: item.confirmed,
        confirmationRate: item.count > 0 ? Math.round((item.confirmed / item.count) * 100) : 0
      })),
      
      // Confirmaciones por día
      dailyConfirmations: dailyConfirmations.map(item => ({
        date: item._id,
        confirmations: item.count,
        totalGuests: item.totalGuests
      })),
      
      // Invitados recientes
      recentGuests: recentGuests.map(guest => ({
        id: guest._id,
        name: guest.name,
        relation: guest.relation,
        status: guest.status,
        createdAt: guest.createdAt,
        confirmed: guest.attendance?.confirmed || false,
        confirmedAt: guest.attendance?.confirmedAt
      })),
      
      // Metadata
      generatedAt: new Date().toISOString(),
      appliedFilters: { search, status, relation } // ✅ Incluir filtros aplicados para debugging
    };
    
    console.log('✅ [API /guests/stats] Stats generated successfully:', {
      totalGuests: response.overview.totalGuests,
      totalConfirmed: response.overview.totalConfirmed,
      appliedFilters: response.appliedFilters
    });
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('❌ Error getting guest statistics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener las estadísticas de invitados' 
      },
      { status: 500 }
    );
  }
}
