import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';

// GET - Listar invitados con filtros opcionales
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const relation = searchParams.get('relation');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20'); // ✅ OPTIMIZADO: Límite por defecto aumentado para Load More
    
    // � DEBUG: Log parámetros recibidos para Load More
    console.log('🔍 [Load More] API /guests GET - Filters received:', {
      search: search,
      status: status,
      relation: relation,
      page: page,
      limit: limit,
      timestamp: new Date().toISOString()
    });
    
    // Construir query de MongoDB con tipo específico
    const filterQuery: Record<string, unknown> = {};
    
    // Filtro por búsqueda (nombre)
    if (search && search.trim()) {
      filterQuery.name = { $regex: search.trim(), $options: 'i' };
    }
    
    // Filtro por estado
    if (status && status !== 'all') {
      filterQuery.status = status;
    }
    
    // Filtro por relación
    if (relation && relation !== 'all') {
      filterQuery.relation = relation;
    }
    
    // 🐛 DEBUG: Log query de MongoDB construida
    console.log('🗃️ MongoDB query constructed:', filterQuery);
    
    // Calcular paginación
    const skip = (page - 1) * limit;
    
    // Ejecutar consulta con paginación
    const [guests, total] = await Promise.all([
      Guest.find(filterQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // Para mejor performance
      Guest.countDocuments(filterQuery)
    ]);
    
    // Calcular metadata de paginación
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    // ✅ DEBUG: Log resultados para Load More
    console.log('✅ [Load More] Query executed successfully:', {
      totalFound: total,
      returnedCount: guests.length,
      currentPage: page,
      totalPages: totalPages,
      hasNext: hasNext,
      hasPrev: hasPrev,
      filterQuery: filterQuery,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        guests,
        pagination: {
          current: page,
          total: totalPages,
          hasNext,
          hasPrev,
          totalItems: total
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting guests:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener la lista de invitados' 
      },
      { status: 500 }
    );
  }
}

// POST - Crear nuevo invitado
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, phone, relation, personalInvitation, attendance } = body;
    
    // Validaciones básicas mejoradas
    if (!name || !name.trim()) {
      console.error('❌ API Error: Nombre vacío');
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre es obligatorio',
          errorCode: 'MISSING_NAME'
        },
        { status: 400 }
      );
    }
    
    // ⚠️ NUEVA VALIDACIÓN: Teléfono es OBLIGATORIO para invitaciones personalizadas
    if (!phone || !phone.trim()) {
      console.error('❌ API Error: Teléfono vacío');
      return NextResponse.json(
        { 
          success: false, 
          error: 'El número de teléfono es obligatorio para invitaciones personalizadas',
          errorCode: 'MISSING_PHONE' 
        },
        { status: 400 }
      );
    }
    
    // Normalizar teléfono (solo números)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validar formato de teléfono (exactamente 10 dígitos)
    if (cleanPhone.length !== 10) {
      console.error('❌ API Error: Teléfono inválido', { phone, cleanPhone, length: cleanPhone.length });
      return NextResponse.json(
        { 
          success: false, 
          error: 'El número de teléfono debe tener exactamente 10 dígitos',
          errorCode: 'INVALID_PHONE_FORMAT'
        },
        { status: 400 }
      );
    }
    
    if (!relation) {
      console.error('❌ API Error: Relación vacía');
      return NextResponse.json(
        { 
          success: false, 
          error: 'La relación es obligatoria',
          errorCode: 'MISSING_RELATION' 
        },
        { status: 400 }
      );
    }
    
    console.log('📋 API: Validando duplicados con nueva lógica...', {
      name: name.trim(),
      cleanPhone: cleanPhone,
      originalPhone: phone
    });
    
    // 🔍 NUEVA LÓGICA: Verificar duplicado por NOMBRE + TELÉFONO (normalizado)
    const existingGuest = await Guest.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
      phone: cleanPhone  // Buscar por teléfono normalizado
    });
    
    if (existingGuest) {
      console.warn('⚠️ API: Duplicado encontrado', {
        existingName: existingGuest.name,
        existingPhone: existingGuest.phone,
        newName: name.trim(),
        newPhone: cleanPhone
      });
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un invitado con ese nombre y número de teléfono',
          errorCode: 'DUPLICATE_NAME_PHONE',
          details: {
            existingGuest: {
              name: existingGuest.name,
              phone: existingGuest.phone,
              createdAt: existingGuest.createdAt
            }
          }
        },
        { status: 400 }
      );
    }
    
    console.log('✅ API: No se encontraron duplicados, creando invitado...');
    
    // Crear nuevo invitado con teléfono normalizado
    const guestData: {
      name: string;
      relation: string;
      phone: string;  // Ahora siempre presente y normalizado
      personalInvitation?: unknown;
      attendance?: unknown;
    } = {
      name: name.trim(),
      relation,
      phone: cleanPhone  // Guardar teléfono normalizado (solo números)
    };
    
    console.log('💾 API: Preparando datos del invitado', {
      name: guestData.name,
      phone: guestData.phone,
      relation: guestData.relation,
      hasPersonalInvitation: !!personalInvitation,
      hasAttendance: !!attendance
    });
    
    // Agregar datos de invitación personalizada si se proporcionan
    if (personalInvitation) {
      guestData.personalInvitation = personalInvitation;
    }
    
    // Agregar datos de confirmación si se proporcionan
    if (attendance) {
      guestData.attendance = attendance;
    }
    
    const newGuest = new Guest(guestData);
    await newGuest.save();
    
    console.log('✅ Guest created successfully:', newGuest.name);
    
    return NextResponse.json({
      success: true,
      data: newGuest,
      message: 'Invitado creado exitosamente'
    }, { status: 201 });
    
  } catch (error: unknown) {
    console.error('❌ Error creating guest:', error);
    
    // Manejar errores de validación de Mongoose
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ValidationError') {
      const mongooseError = error as unknown as { errors: Record<string, { message: string }> };
      const validationErrors = Object.values(mongooseError.errors).map((err) => err.message);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Errores de validación',
          details: validationErrors
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
