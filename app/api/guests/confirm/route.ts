/**
 * 🎯 API de Confirmación Automática de Asistencia
 * 
 * Endpoint que procesa confirmaciones de asistencia usando fuzzy matching
 * para encontrar invitados existentes o crear nuevos registros automáticamente.
 * 
 * POST /api/guests/confirm
 * 
 * Funcionalidades:
 * - Búsqueda inteligente de invitados por nombre (fuzzy matching)
 * - Actualización automática de registros existentes
 * - Creación de nuevos registros para invitados no encontrados
 * - Manejo de casos ambiguos con múltiples coincidencias
 * - Validación estricta de datos de entrada
 * - Logging detallado para debugging y métricas
 * 
 * @author Sistema de Invitaciones VIP
 * @date 26 de agosto, 2025
 * @version 1.0
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Guest from '@/models/Guest';
import { Types } from 'mongoose';
import { 
  findBestGuestMatch, 
  findMultipleMatches,
  FUZZY_CONFIG 
} from '@/utils/fuzzyMatchingUtils';

// 📋 Interfaces para el endpoint
interface ConfirmationRequest {
  name: string;
  numberOfGuests: number;
  willAttend: boolean;
  comments?: string;
  phone?: string;
}

interface MatchInfo {
  similarity: number;
  wasExactMatch: boolean;
  matchType: 'exact' | 'fuzzy' | 'partial';
  searchName: string;
  foundName: string;
  multipleMatches?: boolean;
  matchesCount?: number;
  // Nuevos campos para búsqueda multi-campo
  matchMethod?: 'phone' | 'name' | 'name_with_phone_conflict';
  phoneMatch?: boolean;
  hasConflict?: boolean;
  searchPhone?: string;
}

interface ConfirmationResponse {
  success: boolean;
  action: 'updated' | 'created' | 'error';
  guest: {
    id: string;
    name: string;
    relation?: string;
    status: string;
    attendance: {
      confirmed: boolean;
      confirmedAt?: Date;
      numberOfGuestsConfirmed?: number;
      comments?: string;
    };
    autoCreated?: boolean;
    notes?: string;
  };
  matchInfo?: MatchInfo;
  message: string;
  timestamp: string;
}

// Interface para documentos de MongoDB con _id tipado
interface GuestDocument {
  _id: Types.ObjectId;
  name: string;
  relation: string;
  phoneNumber?: string;
  status: string;
  attendance?: {
    confirmed?: boolean;
    confirmedAt?: Date;
    numberOfGuestsConfirmed?: number;
    message?: string;
    comments?: string;
  };
  autoCreated?: boolean;
  searchedName?: string;
  notes: string;
}

/**
 * 🔍 Valida los datos de entrada de la confirmación
 */
function validateConfirmationData(data: unknown): {
  isValid: boolean;
  errors: string[];
  validatedData?: ConfirmationRequest;
} {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Datos de entrada inválidos'] };
  }

  const request = data as Record<string, unknown>;

  // Validar nombre
  if (!request.name || typeof request.name !== 'string') {
    errors.push('El nombre es requerido y debe ser un string');
  } else if (request.name.trim().length < FUZZY_CONFIG.MIN_NAME_LENGTH) {
    errors.push(`El nombre debe tener al menos ${FUZZY_CONFIG.MIN_NAME_LENGTH} caracteres`);
  } else if (request.name.trim().length > FUZZY_CONFIG.MAX_NAME_LENGTH) {
    errors.push(`El nombre no puede tener más de ${FUZZY_CONFIG.MAX_NAME_LENGTH} caracteres`);
  }

  // Validar número de invitados
  if (request.numberOfGuests === undefined || request.numberOfGuests === null) {
    errors.push('El número de invitados es requerido');
  } else if (typeof request.numberOfGuests !== 'number' || !Number.isInteger(request.numberOfGuests)) {
    errors.push('El número de invitados debe ser un número entero');
  } else if (request.numberOfGuests < 0 || request.numberOfGuests > 50) {
    errors.push('El número de invitados debe estar entre 0 y 50');
  }

  // Validar confirmación de asistencia
  if (typeof request.willAttend !== 'boolean') {
    errors.push('La confirmación de asistencia debe ser verdadero o falso');
  }

  // Validar comentarios (opcional)
  if (request.comments !== undefined && request.comments !== null) {
    if (typeof request.comments !== 'string') {
      errors.push('Los comentarios deben ser un string');
    } else if (request.comments.length > 500) {
      errors.push('Los comentarios no pueden tener más de 500 caracteres');
    }
  }

  // Validar teléfono (opcional)
  if (request.phone !== undefined && request.phone !== null) {
    if (typeof request.phone !== 'string') {
      errors.push('El teléfono debe ser un string');
    } else if (request.phone.trim().length > 0 && request.phone.trim().length < 10) {
      errors.push('El teléfono debe tener al menos 10 dígitos');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const validatedData: ConfirmationRequest = {
    name: (request.name as string).trim(),
    numberOfGuests: request.numberOfGuests as number,
    willAttend: request.willAttend as boolean,
    comments: request.comments ? (request.comments as string).trim() : undefined,
    phone: request.phone ? (request.phone as string).trim() : undefined
  };

  return { isValid: true, errors: [], validatedData };
}

/**
 * 🔄 Actualiza un invitado existente con los datos de confirmación
 */
async function updateExistingGuest(
  guestId: string, 
  confirmationData: ConfirmationRequest
): Promise<GuestDocument> {
  const updateData = {
    'attendance.confirmed': confirmationData.willAttend,
    'attendance.confirmedAt': new Date(),
    'attendance.numberOfGuestsConfirmed': confirmationData.numberOfGuests,
    'attendance.comments': confirmationData.comments || 'Confirmación automática vía web',
    status: confirmationData.willAttend ? 'confirmed' : 'declined',
    updatedAt: new Date()
  };

  // Agregar teléfono si se proporciona y no existe
  const existingGuest = await Guest.findById(guestId);
  if (confirmationData.phone && !existingGuest?.phone) {
    Object.assign(updateData, { phone: confirmationData.phone });
  }

  const updatedGuest = await Guest.findByIdAndUpdate(
    guestId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!updatedGuest) {
    throw new Error(`No se pudo actualizar el invitado con ID: ${guestId}`);
  }

  return updatedGuest as GuestDocument;
}

/**
 * 🆕 Crea un nuevo invitado con los datos de confirmación
 */
async function createNewGuest(
  confirmationData: ConfirmationRequest,
  isAmbiguous: boolean = false,
  matchesCount: number = 0
): Promise<GuestDocument> {
  let notes = 'Registro creado automáticamente por confirmación de asistencia';
  
  if (isAmbiguous) {
    notes += `. Búsqueda ambigua: "${confirmationData.name}" tuvo ${matchesCount} coincidencias similares`;
  } else {
    notes += `. Búsqueda: "${confirmationData.name}" - no se encontraron coincidencias suficientes`;
  }

  const newGuestData = {
    name: confirmationData.name,
    relation: 'otros', // Relación por defecto para invitados auto-creados
    status: confirmationData.willAttend ? 'confirmed' : 'declined',
    phone: confirmationData.phone || undefined,
    attendance: {
      confirmed: confirmationData.willAttend,
      confirmedAt: new Date(),
      numberOfGuestsConfirmed: confirmationData.numberOfGuests,
      comments: confirmationData.comments || 'Confirmación automática vía web'
    },
    autoCreated: true,
    notes,
    searchedName: confirmationData.name,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newGuest = new Guest(newGuestData);
  await newGuest.save();

  return newGuest as GuestDocument;
}

/**
 * 🎯 Endpoint principal para procesar confirmaciones de asistencia
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    console.log('🎯 Nueva confirmación de asistencia recibida');
    
    // 🔗 Conectar a la base de datos
    await connectDB();

    // 📋 Obtener y validar datos de entrada
    const requestBody = await request.json();
    const validation = validateConfirmationData(requestBody);

    if (!validation.isValid || !validation.validatedData) {
      console.error('❌ Datos de confirmación inválidos:', validation.errors);
      return NextResponse.json({
        success: false,
        action: 'error',
        message: 'Datos de confirmación inválidos',
        errors: validation.errors,
        timestamp: new Date().toISOString()
      } as Partial<ConfirmationResponse>, { status: 400 });
    }

    const confirmationData = validation.validatedData;
    console.log('✅ Datos validados:', {
      name: confirmationData.name,
      numberOfGuests: confirmationData.numberOfGuests,
      willAttend: confirmationData.willAttend,
      hasComments: !!confirmationData.comments,
      hasPhone: !!confirmationData.phone
    });

    // 🔍 Obtener todos los invitados para búsqueda
    console.log('🔍 Iniciando búsqueda de invitado...');
    const allGuests = await Guest.find({}).lean();
    console.log(`📊 Total de invitados en base de datos: ${allGuests.length}`);

    // 🎯 Buscar mejor coincidencia usando búsqueda multi-campo
    const bestMatch = findBestGuestMatch(
      confirmationData.name, 
      allGuests,
      confirmationData.phone // Pasar teléfono para búsqueda multi-campo
    );
    
    let response: ConfirmationResponse;
    let guest: GuestDocument;

    if (bestMatch && bestMatch.similarity >= FUZZY_CONFIG.SIMILARITY_THRESHOLD) {
      // ✅ Encontrada coincidencia suficiente - actualizar registro existente
      const matchInfo = bestMatch.matchMethod === 'phone' ? 
        `📱 por teléfono` : 
        bestMatch.hasConflict ? 
          `👤 por nombre (⚠️ teléfonos diferentes)` :
          `👤 por nombre`;
          
      console.log(`✅ Invitado encontrado ${matchInfo}: "${bestMatch.guest.name}" (${bestMatch.similarity.toFixed(1)}% similitud)`);
      
      if (bestMatch.hasConflict) {
        console.log(`⚠️ Conflicto de teléfono detectado - actualización con precaución`);
      }
      
      // Verificar si hay múltiples coincidencias similares
      const multipleMatches = findMultipleMatches(confirmationData.name, allGuests, 3);
      const hasMultipleMatches = multipleMatches.length > 1;
      
      if (hasMultipleMatches) {
        console.log(`⚠️ Múltiples coincidencias detectadas (${multipleMatches.length}), pero usando la mejor`);
      }

      guest = await updateExistingGuest(bestMatch.guest._id!.toString(), confirmationData);

      response = {
        success: true,
        action: 'updated',
        guest: {
          id: bestMatch.guest._id!.toString(),
          name: bestMatch.guest.name,
          relation: bestMatch.guest.relation,
          status: confirmationData.willAttend ? 'confirmed' : 'declined',
          attendance: {
            confirmed: confirmationData.willAttend,
            confirmedAt: new Date(),
            numberOfGuestsConfirmed: confirmationData.numberOfGuests,
            comments: confirmationData.comments
          }
        },
        matchInfo: {
          similarity: bestMatch.similarity,
          wasExactMatch: bestMatch.isExactMatch,
          matchType: bestMatch.matchType,
          searchName: confirmationData.name,
          foundName: bestMatch.guest.name,
          multipleMatches: hasMultipleMatches,
          matchesCount: multipleMatches.length,
          // Nueva información de búsqueda multi-campo
          matchMethod: bestMatch.matchMethod || 'name',
          phoneMatch: bestMatch.phoneMatch || false,
          hasConflict: bestMatch.hasConflict || false,
          searchPhone: confirmationData.phone
        },
        message: `Confirmación actualizada para invitado existente: ${bestMatch.guest.name}`,
        timestamp: new Date().toISOString()
      };

    } else {
      // ❌ No se encontró coincidencia suficiente - crear nuevo registro
      const multipleMatches = findMultipleMatches(confirmationData.name, allGuests, 5);
      const isAmbiguous = multipleMatches.length > 0;
      
      if (isAmbiguous) {
        console.log(`⚠️ Búsqueda ambigua: "${confirmationData.name}" tiene ${multipleMatches.length} coincidencias parciales`);
        multipleMatches.forEach((match, index) => {
          console.log(`   ${index + 1}. "${match.guest.name}" (${match.similarity.toFixed(1)}%)`);
        });
      } else {
        console.log(`❌ No se encontraron coincidencias para: "${confirmationData.name}"`);
      }

      guest = await createNewGuest(confirmationData, isAmbiguous, multipleMatches.length);

      response = {
        success: true,
        action: 'created',
        guest: {
          id: guest._id.toString(),
          name: confirmationData.name,
          relation: 'otros',
          status: confirmationData.willAttend ? 'confirmed' : 'declined',
          attendance: {
            confirmed: confirmationData.willAttend,
            confirmedAt: new Date(),
            numberOfGuestsConfirmed: confirmationData.numberOfGuests,
            comments: confirmationData.comments
          },
          autoCreated: true,
          notes: guest.notes
        },
        matchInfo: isAmbiguous ? {
          similarity: 0,
          wasExactMatch: false,
          matchType: 'partial',
          searchName: confirmationData.name,
          foundName: 'Nuevo registro',
          multipleMatches: true,
          matchesCount: multipleMatches.length
        } : undefined,
        message: isAmbiguous 
          ? `Nuevo invitado creado (búsqueda ambigua con ${multipleMatches.length} coincidencias parciales)`
          : `Nuevo invitado creado: ${confirmationData.name}`,
        timestamp: new Date().toISOString()
      };
    }

    // 📊 Log de métricas
    const processingTime = Date.now() - startTime;
    console.log('📊 Confirmación procesada exitosamente:', {
      action: response.action,
      guestName: response.guest.name,
      processingTime: `${processingTime}ms`,
      similarity: response.matchInfo?.similarity,
      willAttend: confirmationData.willAttend,
      numberOfGuests: confirmationData.numberOfGuests
    });

    return NextResponse.json(response, { status: response.action === 'created' ? 201 : 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('❌ Error procesando confirmación:', error);
    
    const errorResponse: ConfirmationResponse = {
      success: false,
      action: 'error',
      guest: {
        id: '',
        name: '',
        status: 'error',
        attendance: {
          confirmed: false
        }
      },
      message: error instanceof Error ? error.message : 'Error interno del servidor',
      timestamp: new Date().toISOString()
    };

    // Log de error con contexto
    console.error('📊 Error en confirmación:', {
      error: error instanceof Error ? error.message : 'Error desconocido',
      processingTime: `${processingTime}ms`,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * 📋 Endpoint GET para obtener estadísticas del sistema de confirmación
 * (Útil para monitoring y debugging)
 */
export async function GET() {
  try {
    await connectDB();

    const stats = await Guest.aggregate([
      {
        $group: {
          _id: null,
          totalGuests: { $sum: 1 },
          autoCreatedGuests: {
            $sum: { $cond: [{ $eq: ['$autoCreated', true] }, 1, 0] }
          },
          confirmedGuests: {
            $sum: { $cond: [{ $eq: ['$attendance.confirmed', true] }, 1, 0] }
          },
          declinedGuests: {
            $sum: { $cond: [{ $eq: ['$attendance.confirmed', false] }, 1, 0] }
          },
          pendingGuests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          totalConfirmedAttendees: {
            $sum: {
              $cond: [
                { $eq: ['$attendance.confirmed', true] },
                '$attendance.numberOfGuestsConfirmed',
                0
              ]
            }
          }
        }
      }
    ]);

    const systemStats = {
      ...stats[0],
      autoCreationRate: stats[0] ? (stats[0].autoCreatedGuests / stats[0].totalGuests * 100).toFixed(1) + '%' : '0%',
      confirmationRate: stats[0] ? (stats[0].confirmedGuests / stats[0].totalGuests * 100).toFixed(1) + '%' : '0%',
      fuzzyMatchingConfig: FUZZY_CONFIG,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: systemStats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener estadísticas'
    }, { status: 500 });
  }
}
