// ================================================================
// 📁 utils/invitation.utils.ts
// ================================================================

import { FormData, ValidationResult } from '../types/invitation.types';
import { EVENT_INFO, VALIDATION_MESSAGES, PHONE_CONFIG } from '../constants/invitation.constants';
import "../../../../utils/logInterceptor";

/**
 * Formatea un número de teléfono mexicano con espacios
 * @param value - Número de teléfono sin formato
 * @param previousValue - Valor anterior para detectar si está borrando
 * @returns Número formateado (XXX XXX XXXX)
 */
export const formatMexicanPhone = (value: string, previousValue?: string): string => {
  // Remover todo lo que no sean números
  const numbers = value.replace(/\D/g, "");
  
  // Si el valor actual es más corto que el anterior, el usuario está borrando
  const isDeleting = previousValue && value.length < previousValue.length;
  
  // Limitar a 10 dígitos máximo
  const limited = numbers.slice(0, PHONE_CONFIG.DIGITS_REQUIRED);
  
  // Si está borrando y el cursor está en un espacio, permitir que se borre
  if (isDeleting) {
    // Simplemente formatear los números que quedan
    if (limited.length >= 6) {
      return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
    } else if (limited.length >= 3) {
      return `${limited.slice(0, 3)} ${limited.slice(3)}`;
    }
    return limited;
  }
  
  // Formatear normalmente cuando está escribiendo
  if (limited.length >= 6) {
    return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`;
  } else if (limited.length >= 3) {
    return `${limited.slice(0, 3)} ${limited.slice(3)}`;
  }
  return limited;
};

/**
 * Genera el mensaje de WhatsApp personalizado
 * @param formData - Datos del formulario
 * @param guestId - ID del guest registrado (opcional)
 * @returns Mensaje formateado para WhatsApp
 */
export const generateWhatsAppMessage = (formData: FormData, guestId?: string | null): string => {
  console.log('📝 [MESSAGE] Generando mensaje de WhatsApp...');
  console.log('🆔 [MESSAGE] Guest ID recibido:', guestId);
  console.log('📋 [MESSAGE] Datos recibidos:', {
    guestName: formData.guestName,
    personalMessage: formData.personalMessage,
    personalMessageLength: formData.personalMessage?.length,
    numberOfGuests: formData.numberOfGuests,
    guestRelation: formData.guestRelation,
    hasGuestId: !!guestId
  });

  const guestText = parseInt(formData.numberOfGuests) === 1 ? 'persona' : 'personas';
  
  // Agregar timestamp para evitar cache de WhatsApp
  const timestamp = new Date().toLocaleTimeString('es-MX', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Construir URL personalizada
  const personalizedUrl = buildPersonalizedUrl(EVENT_INFO.invitationUrl, guestId);

  const message = `👑 ¡Hola ${formData.guestName}! 👑

${formData.personalMessage}

Tienes una invitación especial de:
✨ ${EVENT_INFO.quinceaneraName} ✨

📅 Fecha: ${EVENT_INFO.date}
🕖 Hora: ${EVENT_INFO.time}
📍 Lugar: ${EVENT_INFO.venue}
👥 Número de invitados: ${formData.numberOfGuests} ${guestText}

Ver tu invitación mágica aquí:
👉 ${personalizedUrl}

💜 ¡Espero que celebres con nosotros este día tan especial!

Con cariño,
${EVENT_INFO.quinceaneraName} 🎉

📤 Enviado: ${timestamp}`;

  console.log('📝 [MESSAGE] Mensaje generado (primeros 200 chars):', message.substring(0, 200) + '...');
  console.log('🔗 [MESSAGE] URL en mensaje:', personalizedUrl);
  console.log('📊 [MESSAGE] Estadísticas del mensaje:', {
    messageLength: message.length,
    includesPersonalMessage: message.includes(formData.personalMessage),
    includesGuestName: message.includes(formData.guestName),
    urlUsed: personalizedUrl === EVENT_INFO.invitationUrl ? 'BASE' : 'PERSONALIZADA',
    personalizedUrl: personalizedUrl,
    personalMessageStart: message.indexOf(formData.personalMessage),
    personalMessageEnd: message.indexOf(formData.personalMessage) + formData.personalMessage.length,
    includesTimestamp: message.includes(timestamp),
    originalPersonalMessage: formData.personalMessage
  });

  // Verificación adicional de integridad del mensaje
  if (!message.includes(formData.personalMessage)) {
    console.error('🚨 [MESSAGE] ¡CRÍTICO! El mensaje personal no está incluido en el mensaje final');
    console.error('🔍 [MESSAGE] Mensaje personal original:', formData.personalMessage);
    console.error('🔍 [MESSAGE] Mensaje final:', message);
  } else {
    console.log('✅ [MESSAGE] Verificación exitosa: Mensaje personal incluido correctamente');
  }

  return message;
};

/**
 * Valida todos los campos del formulario con validaciones estrictas
 * @param formData - Datos del formulario a validar
 * @returns Resultado de la validación con código de error específico
 */
export const validateForm = (formData: FormData): ValidationResult & { errorCode?: string } => {
  console.log('🔍 [VALIDATION] Iniciando validación estricta del formulario...');
  
  // 1. Verificar nombre
  if (!formData.guestName || !formData.guestName.trim()) {
    console.error('❌ [VALIDATION] Nombre vacío');
    return { 
      isValid: false, 
      message: 'El nombre del invitado es obligatorio',
      errorCode: 'MISSING_NAME'
    };
  }
  
  if (formData.guestName.trim().length < 2) {
    console.error('❌ [VALIDATION] Nombre muy corto');
    return { 
      isValid: false, 
      message: 'El nombre debe tener al menos 2 caracteres',
      errorCode: 'INVALID_NAME_LENGTH'
    };
  }
  
  // 2. Verificar teléfono (OBLIGATORIO)
  if (!formData.whatsappNumber || !formData.whatsappNumber.trim()) {
    console.error('❌ [VALIDATION] Teléfono vacío');
    return { 
      isValid: false, 
      message: 'El número de teléfono es obligatorio',
      errorCode: 'MISSING_PHONE'
    };
  }
  
  // Validar formato de teléfono (exactamente 10 dígitos)
  const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
  if (cleanNumber.length !== PHONE_CONFIG.DIGITS_REQUIRED) {
    console.error('❌ [VALIDATION] Teléfono inválido', { 
      original: formData.whatsappNumber,
      clean: cleanNumber,
      length: cleanNumber.length 
    });
    return { 
      isValid: false, 
      message: `El número debe tener exactamente ${PHONE_CONFIG.DIGITS_REQUIRED} dígitos`,
      errorCode: 'INVALID_PHONE_FORMAT'
    };
  }
  
  // 3. Verificar número de invitados
  if (!formData.numberOfGuests || !formData.numberOfGuests.trim()) {
    console.error('❌ [VALIDATION] Número de invitados vacío');
    return { 
      isValid: false, 
      message: 'El número de invitados es obligatorio',
      errorCode: 'MISSING_GUEST_COUNT'
    };
  }
  
  const guestCount = parseInt(formData.numberOfGuests);
  if (isNaN(guestCount) || guestCount < 1 || guestCount > 10) {
    console.error('❌ [VALIDATION] Número de invitados inválido');
    return { 
      isValid: false, 
      message: 'El número de invitados debe ser entre 1 y 10',
      errorCode: 'INVALID_GUEST_COUNT'
    };
  }
  
  // 4. Verificar mensaje personalizado
  if (!formData.personalMessage || !formData.personalMessage.trim()) {
    console.error('❌ [VALIDATION] Mensaje personal vacío');
    return { 
      isValid: false, 
      message: 'El mensaje personalizado es obligatorio',
      errorCode: 'MISSING_MESSAGE'
    };
  }
  
  if (formData.personalMessage.trim().length < 10) {
    console.error('❌ [VALIDATION] Mensaje personal muy corto');
    return { 
      isValid: false, 
      message: 'El mensaje debe tener al menos 10 caracteres',
      errorCode: 'INVALID_MESSAGE_LENGTH'
    };
  }
  
  console.log('✅ [VALIDATION] Validación exitosa');
  return { isValid: true };
};

/**
 * Valida específicamente el número de teléfono
 * @param phoneNumber - Número a validar
 * @returns Resultado de la validación
 */
export const validatePhoneNumber = (phoneNumber: string): ValidationResult => {
  const cleanNumber = phoneNumber.replace(/\D/g, "");
  
  if (!phoneNumber.trim()) {
    return { isValid: false, message: "Número de teléfono es requerido" };
  }
  
  if (cleanNumber.length !== PHONE_CONFIG.DIGITS_REQUIRED) {
    return { 
      isValid: false, 
      message: VALIDATION_MESSAGES.INVALID_PHONE_FORMAT 
    };
  }
  
  return { isValid: true };
};

/**
 * Envía la invitación por WhatsApp
 * @param formData - Datos del formulario
 */
export const sendWhatsAppInvitation = (formData: FormData): void => {
  const validation = validateForm(formData);
  if (!validation.isValid) {
    console.error('❌ Validación fallida:', validation.message);
    return;
  }
  
  const message = generateWhatsAppMessage(formData, null); // Sin guest ID para envío simple
  const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
  const mexicanNumber = `52${cleanNumber}`;
  const whatsappURL = `https://wa.me/${mexicanNumber}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappURL, "_blank");
};

/**
 * Genera nombre de archivo para la descarga
 * @param guestName - Nombre del invitado
 * @returns Nombre de archivo formateado
 */
export const generateFileName = (guestName: string): string => {
  const cleanName = guestName
    .replace(/\s+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '');
  
  return `invitacion_${cleanName}.png`;
};

/**
 * Verifica si todos los campos requeridos están completos
 * @param formData - Datos del formulario
 * @returns true si todos los campos requeridos están completos
 */
export const areRequiredFieldsComplete = (formData: FormData): boolean => {
  return !!(
    formData.guestName &&
    formData.personalMessage &&
    formData.numberOfGuests &&
    formData.whatsappNumber
  );
};

/**
 * Limpia y formatea texto para uso seguro
 * @param text - Texto a limpiar
 * @returns Texto limpio y seguro
 */
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

/**
 * Convierte número de invitados a texto legible
 * @param numberOfGuests - Número como string
 * @returns Texto descriptivo (persona/personas)
 */
export const formatGuestText = (numberOfGuests: string): string => {
  const num = parseInt(numberOfGuests);
  return num === 1 ? 'persona' : 'personas';
};

/**
 * Valida que el nombre del invitado sea válido
 * @param name - Nombre a validar
 * @returns Resultado de la validación
 */
export const validateGuestName = (name: string): ValidationResult => {
  const trimmedName = name.trim();
  
  if (!trimmedName) {
    return { isValid: false, message: "El nombre del invitado es requerido" };
  }
  
  if (trimmedName.length < 2) {
    return { isValid: false, message: "El nombre debe tener al menos 2 caracteres" };
  }
  
  if (trimmedName.length > 50) {
    return { isValid: false, message: "El nombre no puede exceder 50 caracteres" };
  }
  
  return { isValid: true };
};

/**
 * Valida que el mensaje personal sea válido
 * @param message - Mensaje a validar
 * @returns Resultado de la validación
 */
export const validatePersonalMessage = (message: string): ValidationResult => {
  const trimmedMessage = message.trim();
  
  if (!trimmedMessage) {
    return { isValid: false, message: "El mensaje personal es requerido" };
  }
  
  if (trimmedMessage.length < 10) {
    return { isValid: false, message: "El mensaje debe tener al menos 10 caracteres" };
  }
  
  if (trimmedMessage.length > 500) {
    return { isValid: false, message: "El mensaje no puede exceder 500 caracteres" };
  }
  
  return { isValid: true };
};

/**
 * Crea o actualiza un invitado en la base de datos al enviar invitación
 * @param formData - Datos del formulario de invitación
 * @returns Promise<string | null> - ID del guest creado o null si falló
 */
export const createOrUpdateGuestFromInvitation = async (formData: FormData): Promise<string | null> => {
  console.log('🗄️ [BD] Iniciando registro de invitado en base de datos...');
  
  try {
    // Mapear guestRelation a los valores válidos del modelo
    const relationMap: Record<string, string> = {
      'familia': 'familia',
      'amigos': 'amigos', 
      'escuela': 'escuela',
      'trabajo': 'trabajo',
      'otros': 'otros',
      'amigo': 'amigos', // Mapeo adicional
      'familiar': 'familia'
    };

    const cleanPhone = formData.whatsappNumber.replace(/\D/g, '');
    const mappedRelation = relationMap[formData.guestRelation.toLowerCase()] || 'otros';

    // Preparar datos del invitado según esquema de GuestsManagement
    const guestData = {
      name: formData.guestName.trim(),
      phone: cleanPhone, // Solo números
      relation: mappedRelation,
      personalInvitation: {
        sent: true,
        sentAt: new Date(),
        message: formData.personalMessage.trim(),
        numberOfGuests: parseInt(formData.numberOfGuests) || 1
      }
    };

    console.log('� [BD] Datos preparados para BD:', {
      name: guestData.name,
      phone: guestData.phone,
      phoneLength: guestData.phone.length,
      relation: guestData.relation,
      originalRelation: formData.guestRelation,
      numberOfGuests: guestData.personalInvitation.numberOfGuests,
      messageLength: guestData.personalInvitation.message.length
    });

    console.log('📤 [BD] Enviando petición POST a /api/guests...');

    // Intentar crear o actualizar el invitado
    const response = await fetch('/api/guests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(guestData),
    });

    console.log('📥 [BD] Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Parsear respuesta siempre (tanto exitosa como error)
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error('💥 [BD] Error parseando respuesta JSON:', parseError);
      throw new Error('Error de comunicación con el servidor');
    }
    
    console.log('📋 [BD] Resultado parseado:', {
      success: result.success,
      hasData: !!result.data,
      error: result.error,
      errorCode: result.errorCode,
      dataName: result.data?.name
    });

    if (!response.ok) {
      console.error('❌ [BD] Response no OK:', {
        status: response.status,
        statusText: response.statusText,
        error: result.error,
        errorCode: result.errorCode
      });
      
      // Crear un error estructurado que incluya la información de la API
      const apiError = new Error(result.error || 'Error desconocido');
      (apiError as any).response = {
        status: response.status,
        statusText: response.statusText,
        json: () => Promise.resolve(result)
      };
      (apiError as any).apiError = result;
      throw apiError;
    }

    if (result.success) {
      console.log('✅ [BD] Invitado registrado automáticamente:', result.data.name);
      console.log('🆔 [BD] ID del guest creado:', result.data._id);
      return result.data._id;
    } else {
      console.error('❌ [BD] Error al registrar invitado sin response error:', result.error);
      
      // Si la respuesta es OK pero success es false, también lanzar error
      const apiError = new Error(result.error || 'Error en el proceso de registro');
      (apiError as any).apiError = result;
      throw apiError;
    }
  } catch (error) {
    console.error('💥 [BD] Error de conexión al registrar invitado:', error);
    console.error('🔍 [BD] Detalles del error de conexión:', {
      name: (error as Error)?.name,
      message: (error as Error)?.message,
      stack: (error as Error)?.stack
    });

    // Si ya es un error de API estructurado, re-lanzarlo
    if ((error as any).apiError || (error as any).response) {
      throw error;
    }

    // Si es un error de conexión/red, crear error estructurado
    const connectionError = new Error('Error de conexión con el servidor');
    (connectionError as any).connectionError = true;
    (connectionError as any).originalError = error;
    throw connectionError;
  }
};

/**
 * Envía la invitación por WhatsApp y registra automáticamente en la BD
 * @param formData - Datos del formulario
 * @returns Promise<boolean> - true si el envío fue exitoso
 */
export const sendWhatsAppInvitationWithRegistration = async (formData: FormData): Promise<boolean> => {
  console.log('🔄 [MAIN] Iniciando sendWhatsAppInvitationWithRegistration...');
  console.log('📋 [MAIN] FormData recibido completo:', {
    guestName: formData.guestName,
    personalMessage: formData.personalMessage,
    personalMessagePreview: formData.personalMessage ? formData.personalMessage.substring(0, 50) + '...' : 'VACÍO',
    numberOfGuests: formData.numberOfGuests,
    whatsappNumber: formData.whatsappNumber,
    guestRelation: formData.guestRelation,
    allFieldsPresent: !!(formData.guestName && formData.personalMessage && formData.numberOfGuests && formData.whatsappNumber)
  });
  
  const validation = validateForm(formData);
  if (!validation.isValid) {
    console.error('❌ [MAIN] Validación fallida:', validation.message);
    console.error('📋 [MAIN] Datos de validación:', {
      guestName: formData.guestName || 'VACÍO',
      personalMessage: formData.personalMessage || 'VACÍO',
      numberOfGuests: formData.numberOfGuests || 'VACÍO',
      whatsappNumber: formData.whatsappNumber || 'VACÍO',
      phoneClean: formData.whatsappNumber?.replace(/\D/g, "") || 'VACÍO',
      phoneLength: formData.whatsappNumber?.replace(/\D/g, "").length || 0
    });
    return false;
  }
  
  console.log('✅ [MAIN] Validación exitosa, procediendo...');
  
  try {
    // 1. Registrar invitado en la base de datos (obligatorio ahora)
    console.log('📤 [MAIN] Intentando registrar invitado en BD...');
    const guestId = await createOrUpdateGuestFromInvitation(formData);
    
    if (guestId) {
      console.log('✅ [MAIN] Invitado registrado en BD exitosamente con ID:', guestId);
    } else {
      console.warn('⚠️ [MAIN] Registro en BD fue exitoso pero no se obtuvo ID');
    }
    
    // Si llegamos aquí, el registro fue exitoso, continuar con WhatsApp
    console.log('📱 [MAIN] Procediendo con envío de WhatsApp...');
    
    // 2. Generar mensaje y enviar por WhatsApp con guest ID
    console.log('📱 [WHATSAPP] Generando mensaje con ID personalizado...');
    const message = generateWhatsAppMessage(formData, guestId);
    console.log('📝 [MAIN] Mensaje generado con guest ID:', guestId ? 'SÍ' : 'NO');
    const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
    const mexicanNumber = `521${cleanNumber}`; // Corregido: usar 521 para WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${mexicanNumber}?text=${encodedMessage}`;
    
    console.log('📋 [WHATSAPP] Detalles del mensaje:', {
      cleanNumber: cleanNumber,
      mexicanNumber: mexicanNumber,
      messageLength: message.length,
      encodedLength: encodedMessage.length,
      urlLength: whatsappURL.length,
      urlTruncated: whatsappURL.length > 8000 ? 'URL MUY LARGA' : 'OK'
    });
    
    console.log('� [WHATSAPP] Mensaje sin codificar (primeros 300 chars):', message.substring(0, 300) + '...');
    console.log('🔗 [WHATSAPP] Mensaje codificado (primeros 300 chars):', encodedMessage.substring(0, 300) + '...');
    console.log('🌐 [WHATSAPP] URL generada (primeros 200 chars):', whatsappURL.substring(0, 200) + '...');
    
    // 3. Verificar si el navegador permite popup
    console.log('🔓 [Utils] Verificando si se pueden abrir popups...');
    
    // 4. Abrir WhatsApp
    console.log('🚀 [WHATSAPP] Abriendo WhatsApp...');
    
    let newWindow: Window | null = null;
    
    // Verificar si la URL es muy larga para WhatsApp
    if (whatsappURL.length > 8192) { // Límite típico de URL en navegadores
      console.warn('⚠️ [WHATSAPP] URL muy larga, podría ser truncada:', whatsappURL.length + ' caracteres');
      
      // Crear versión más corta del mensaje (priorizando el mensaje personal)
      const shortPersonalizedUrl = buildPersonalizedUrl(EVENT_INFO.invitationUrl, guestId);
      const shortMessage = `👑 ${formData.guestName} 👑

${formData.personalMessage}

🎉 Quinceañera de ${EVENT_INFO.quinceaneraName}
📅 ${EVENT_INFO.date} - ${EVENT_INFO.time}
📍 ${EVENT_INFO.venue}
👥 ${formData.numberOfGuests} ${parseInt(formData.numberOfGuests) === 1 ? 'persona' : 'personas'}

👉 Ver invitación: ${shortPersonalizedUrl}

Con cariño 💜`;

      const shortEncodedMessage = encodeURIComponent(shortMessage);
      const shortWhatsappURL = `https://wa.me/${mexicanNumber}?text=${shortEncodedMessage}`;
      
      console.log('📝 [WHATSAPP] Usando mensaje corto (PRIORIZA MENSAJE PERSONAL):', {
        shortMessageLength: shortMessage.length,
        shortEncodedLength: shortEncodedMessage.length,
        shortUrlLength: shortWhatsappURL.length,
        includesPersonalMessage: shortMessage.includes(formData.personalMessage),
        shortPersonalizedUrl: shortPersonalizedUrl
      });
      
      console.log('✨ [WHATSAPP] Mensaje corto generado:', shortMessage);
      
      newWindow = window.open(shortWhatsappURL, "_blank");
    } else {
      newWindow = window.open(whatsappURL, "_blank");
    }
    
    // 5. Verificar si el popup fue bloqueado
    if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
      console.error('🚫 [WHATSAPP] Popup bloqueado por el navegador');
      console.warn('⚠️ [WHATSAPP] Intentando alternativa - cambiar ubicación actual');
      
      // Alternativa: usar location.href como fallback
      const urlToUse = whatsappURL.length > 8192 ? 
        `https://wa.me/${mexicanNumber}?text=${encodeURIComponent(`👑 Hola ${formData.guestName}! ${formData.personalMessage} Ver invitación: ${EVENT_INFO.invitationUrl}`)}` : 
        whatsappURL;
        
      if (confirm('El popup fue bloqueado. ¿Quieres abrir WhatsApp en esta pestaña?')) {
        window.location.href = urlToUse;
      }
      return false;
    }
    
    console.log('✅ [WHATSAPP] WhatsApp abierto exitosamente');
    
    // 6. Verificar que la ventana sigue abierta después de un momento
    setTimeout(() => {
      if (newWindow && !newWindow.closed) {
        console.log('✅ [WHATSAPP] Confirmado: WhatsApp sigue abierto después de 1 segundo');
      } else {
        console.warn('⚠️ [WHATSAPP] La ventana de WhatsApp se cerró rápidamente');
      }
    }, 1000);
    
    return true;
  } catch (error: any) {
    console.error('❌ [MAIN] Error en el proceso:', error);
    
    // Si es un error de BD, marcarlo para manejo especial en el componente
    if (error.apiError || error.connectionError || error.response) {
      console.error('� [MAIN] Error de BD detectado, será manejado por modal');
      (error as any).isBdError = true;
      throw error;
    }
    
    // Error genérico de WhatsApp o proceso
    console.error('� [MAIN] Error crítico general:', error);
    console.error('🔍 [MAIN] Stack trace:', (error as Error)?.stack);
    
    return false;
  }
};

/**
 * Construye URL personalizada con guest ID como query param
 * @param baseUrl - URL base del evento
 * @param guestId - ID del guest registrado (opcional)
 * @returns URL personalizada o URL base si no hay guestId
 */
export const buildPersonalizedUrl = (baseUrl: string, guestId?: string | null): string => {
  console.log('🔗 [URL] Iniciando construcción de URL personalizada...', {
    baseUrl,
    hasGuestId: !!guestId,
    guestId: guestId ? guestId.substring(0, 8) + '...' : 'NONE'
  });

  if (!guestId || !guestId.trim()) {
    console.log('🔗 [URL] Sin guest ID, usando URL base');
    return baseUrl;
  }
  
  // Validar que el guestId parece ser un ObjectId de MongoDB (24 caracteres hexadecimales)
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  if (!objectIdPattern.test(guestId.trim())) {
    console.warn('⚠️ [URL] Guest ID no parece válido (no es ObjectId), usando URL base:', {
      guestId,
      length: guestId.length,
      pattern: 'Expected 24 hex chars'
    });
    return baseUrl;
  }
  
  // Construir URL con query param
  const cleanGuestId = guestId.trim();
  const separator = baseUrl.includes('?') ? '&' : '?';
  const personalizedUrl = `${baseUrl}${separator}guest=${cleanGuestId}`;
  
  console.log('✅ [URL] URL personalizada construida exitosamente:', {
    baseUrl,
    guestId: cleanGuestId,
    personalizedUrl,
    urlLength: personalizedUrl.length,
    queryParam: `guest=${cleanGuestId}`
  });
  
  return personalizedUrl;
};