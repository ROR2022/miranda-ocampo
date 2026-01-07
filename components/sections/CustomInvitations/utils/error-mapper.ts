// ================================================================
// 📁 utils/errorMapper.ts
// ================================================================

import { ErrorInfo } from '../components/error-modal-component';

/**
 * Mapea códigos de error y errores de API a mensajes amigables para el usuario
 */
export class ErrorMapper {
  
  /**
   * Mapea errores de validación frontend
   */
  static mapValidationError(errorCode: string, originalMessage: string): ErrorInfo {
    switch (errorCode) {
      case 'MISSING_NAME':
        return {
          type: 'validation',
          title: 'Nombre requerido',
          message: 'Por favor ingresa el nombre del invitado.',
          details: 'El nombre es necesario para crear la invitación personalizada y registrar al invitado en el sistema.',
          errorCode
        };

      case 'INVALID_NAME_LENGTH':
        return {
          type: 'validation',
          title: 'Nombre muy corto',
          message: 'El nombre del invitado debe tener al menos 2 caracteres.',
          details: 'Por favor verifica que el nombre esté completo y correctamente escrito.',
          errorCode
        };

      case 'MISSING_PHONE':
        return {
          type: 'validation',
          title: 'Teléfono obligatorio',
          message: 'El número de WhatsApp es obligatorio para enviar la invitación.',
          details: 'Necesitamos un número válido para poder enviar la invitación personalizada por WhatsApp.',
          errorCode
        };

      case 'INVALID_PHONE_FORMAT':
        return {
          type: 'validation',
          title: 'Número de teléfono inválido',
          message: 'El número debe tener exactamente 10 dígitos (sin código de país).',
          details: 'Formato correcto: 777 123 4567. No incluyas el +52 ni códigos adicionales.',
          errorCode
        };

      case 'MISSING_GUEST_COUNT':
        return {
          type: 'validation',
          title: 'Número de invitados requerido',
          message: 'Por favor especifica cuántas personas van a asistir.',
          details: 'Esta información es importante para la organización del evento.',
          errorCode
        };

      case 'INVALID_GUEST_COUNT':
        return {
          type: 'validation',
          title: 'Número de invitados inválido',
          message: 'El número de invitados debe ser entre 1 y 10 personas.',
          details: 'Si necesitas invitar a más de 10 personas, considera enviar invitaciones separadas.',
          errorCode
        };

      case 'MISSING_MESSAGE':
        return {
          type: 'validation',
          title: 'Mensaje personalizado requerido',
          message: 'Por favor escribe un mensaje personalizado para el invitado.',
          details: 'El mensaje personalizado hace que la invitación sea más especial y personal.',
          errorCode
        };

      case 'INVALID_MESSAGE_LENGTH':
        return {
          type: 'validation',
          title: 'Mensaje muy corto',
          message: 'El mensaje personalizado debe tener al menos 10 caracteres.',
          details: 'Escribe un mensaje más detallado para hacer la invitación más especial.',
          errorCode
        };

      default:
        return {
          type: 'validation',
          title: 'Error de validación',
          message: originalMessage,
          errorCode
        };
    }
  }

  /**
   * Mapea errores de API backend
   */
  static mapApiError(response: any): ErrorInfo {
    const errorCode = response?.errorCode;
    const errorMessage = response?.error || 'Error desconocido';
    
    switch (errorCode) {
      case 'DUPLICATE_NAME_PHONE':
        const existingGuest = response?.details?.existingGuest;
        return {
          type: 'duplicate',
          title: 'Invitado ya registrado',
          message: 'Ya existe un invitado con ese nombre y número de teléfono.',
          details: existingGuest 
            ? `Registrado el ${new Date(existingGuest.createdAt).toLocaleDateString('es-MX')} como "${existingGuest.name}".`
            : 'Este invitado ya fue registrado anteriormente en el sistema.',
          actionText: 'Ver invitados registrados',
          errorCode
        };

      case 'MISSING_NAME':
      case 'MISSING_PHONE':
      case 'INVALID_PHONE_FORMAT':
      case 'MISSING_RELATION':
        return {
          type: 'validation',
          title: 'Datos incompletos',
          message: errorMessage,
          details: 'Por favor verifica que todos los campos estén correctamente llenados antes de enviar.',
          errorCode
        };

      case 'CONNECTION_ERROR':
        return {
          type: 'connection',
          title: 'Error de conexión',
          message: 'No se pudo conectar con el servidor.',
          details: 'Verifica tu conexión a internet e intenta nuevamente. Si el problema persiste, contacta al administrador.',
          actionText: 'Reintentar',
          errorCode
        };

      default:
        // Error genérico del servidor
        if (response?.status >= 500) {
          return {
            type: 'connection',
            title: 'Error del servidor',
            message: 'Ocurrió un error interno en el servidor.',
            details: 'Por favor intenta nuevamente en unos momentos. Si el problema persiste, contacta al administrador.',
            actionText: 'Reintentar',
            errorCode: 'SERVER_ERROR'
          };
        }
        
        return {
          type: 'validation',
          title: 'Error',
          message: errorMessage,
          errorCode: errorCode || 'UNKNOWN_ERROR'
        };
    }
  }

  /**
   * Mapea errores de WhatsApp
   */
  static mapWhatsAppError(errorType: string, details?: any): ErrorInfo {
    switch (errorType) {
      case 'POPUP_BLOCKED':
        return {
          type: 'whatsapp',
          title: 'Popup bloqueado',
          message: 'El navegador bloqueó la ventana de WhatsApp.',
          details: 'Para enviar la invitación, necesitas permitir popups en tu navegador o abrir WhatsApp manualmente.',
          actionText: 'Abrir en esta pestaña',
          errorCode: 'POPUP_BLOCKED'
        };

      case 'URL_TOO_LONG':
        return {
          type: 'whatsapp',
          title: 'Mensaje muy largo',
          message: 'El mensaje es demasiado largo para WhatsApp.',
          details: 'Se enviará una versión resumida que incluye tu mensaje personalizado y los datos esenciales del evento.',
          actionText: 'Continuar con versión resumida',
          errorCode: 'URL_TOO_LONG'
        };

      case 'WHATSAPP_ERROR':
        return {
          type: 'whatsapp',
          title: 'Error de WhatsApp',
          message: 'No se pudo abrir WhatsApp correctamente.',
          details: 'Verifica que tengas WhatsApp instalado o que WhatsApp Web esté funcionando en tu navegador.',
          actionText: 'Reintentar',
          errorCode: 'WHATSAPP_ERROR'
        };

      default:
        return {
          type: 'whatsapp',
          title: 'Error de WhatsApp',
          message: 'Ocurrió un problema al abrir WhatsApp.',
          details: details?.message || 'Intenta nuevamente o verifica tu configuración de WhatsApp.',
          errorCode: errorType || 'UNKNOWN_WHATSAPP_ERROR'
        };
    }
  }
}