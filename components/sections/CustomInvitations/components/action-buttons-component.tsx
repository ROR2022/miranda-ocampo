// ================================================================
// 📁 components/ActionButtons.tsx
// ================================================================

import React, {useState} from 'react';
import { ActionButtonsProps } from '../types/invitation.types';
import { sendWhatsAppInvitationWithRegistration, validateForm, generateWhatsAppMessage } from '../utils/invitation.utils';
import { ErrorModal, ErrorInfo } from './error-modal-component';
import { ErrorMapper } from '../utils/error-mapper';
import "../../../../utils/logInterceptor";

/**
 * Componente para los botones de acción principal
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  formData,
  uiState,
  onTogglePreview,
  onDownload,
}) => {
  // Verificar si todos los campos requeridos están completos
  const isFormComplete = !!(
    formData.guestName &&
    formData.personalMessage &&
    formData.numberOfGuests &&
    formData.whatsappNumber &&
    formData.whatsappNumber.replace(/\D/g, "").length === 10
  );
  const [isSending, setIsSending] = useState(false);
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    error: ErrorInfo | null;
  }>({
    isOpen: false,
    error: null
  });

  // Función para mostrar modal de error
  const showError = (error: ErrorInfo) => {
    setErrorModal({
      isOpen: true,
      error
    });
  };

  // Función auxiliar para enviar solo WhatsApp (sin BD)
  const sendWhatsAppOnly = async (): Promise<void> => {
    console.log('📱 [WhatsApp-Only] Enviando solo WhatsApp, saltando BD...');
    
    try {
      // Generar mensaje directamente (sin guest ID)
      const message = generateWhatsAppMessage(formData, null);
      const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
      const mexicanNumber = `521${cleanNumber}`;
      const whatsappURL = `https://wa.me/${mexicanNumber}?text=${encodeURIComponent(message)}`;
      
      console.log('🚀 [WhatsApp-Only] Abriendo WhatsApp directamente...');
      const newWindow = window.open(whatsappURL, "_blank");
      
      if (!newWindow || newWindow.closed) {
        console.warn('🚫 [WhatsApp-Only] Popup bloqueado');
        if (confirm('¿Abrir WhatsApp en esta pestaña?')) {
          window.location.href = whatsappURL;
        }
      } else {
        console.log('✅ [WhatsApp-Only] WhatsApp abierto exitosamente');
        
        // Mostrar mensaje de éxito parcial
        alert(`📱 Invitación enviada por WhatsApp a ${formData.guestName}
        
⚠️ NOTA: No se registró automáticamente en la base de datos.
📝 Puedes registrar manualmente en "Gestión de Invitados" si es necesario.`);
      }
    } catch (whatsappError) {
      console.error('💥 [WhatsApp-Only] Error al abrir WhatsApp:', whatsappError);
      alert('Error al abrir WhatsApp. Por favor intenta nuevamente.');
    }
  };

  // Función para cerrar modal de error
  const closeError = () => {
    setErrorModal({
      isOpen: false,
      error: null
    });
  };

  // Función para enviar por WhatsApp con registro automático en BD
  const sendWhatsAppInvitation = async (): Promise<void> => {
    console.log('🚀 [WhatsApp] Iniciando envío de invitación...');
    console.log('📋 [WhatsApp] Datos del formulario:', {
      guestName: formData.guestName,
      numberOfGuests: formData.numberOfGuests,
      hasWhatsappNumber: !!formData.whatsappNumber,
      hasPersonalMessage: !!formData.personalMessage,
      whatsappLength: formData.whatsappNumber?.replace(/\D/g, "").length
    });

    // 1. Validación frontend estricta
    console.log('🔍 [WhatsApp] Ejecutando validación frontend...');
    const validationResult = validateForm(formData);
    
    if (!validationResult.isValid) {
      console.error('❌ [WhatsApp] Validación frontend fallida:', validationResult);
      
      // Mostrar modal de error específico
      const errorInfo = ErrorMapper.mapValidationError(
        validationResult.errorCode || 'UNKNOWN_ERROR',
        validationResult.message || 'Error de validación'
      );
      showError(errorInfo);
      return;
    }

    console.log('✅ [WhatsApp] Validación frontend exitosa');
    setIsSending(true);
    console.log('⏳ [WhatsApp] Estado cambiado a enviando...');
    
    try {
      console.log('📤 [WhatsApp] Llamando función de envío con registro...');
      const success = await sendWhatsAppInvitationWithRegistration(formData);
      
      if (success) {
        console.log('✅ [WhatsApp] Proceso completado exitosamente');
        console.log(`📱 [WhatsApp] Invitación enviada a ${formData.guestName}`);
        
        // Mostrar mensaje de éxito (podríamos crear un modal de éxito también)
        alert(`✅ ¡Perfecto! 

📱 Invitación enviada a ${formData.guestName} por WhatsApp
📝 Registrado automáticamente en el sistema de gestión
🎯 Ahora puedes ver este invitado en la sección "Gestión de Invitados"`);
      } else {
        console.error('❌ [WhatsApp] El proceso falló o fue incompleto');
        
        // Mostrar error genérico de proceso
        const errorInfo: ErrorInfo = {
          type: 'whatsapp',
          title: 'Proceso incompleto',
          message: 'La invitación se abrió en WhatsApp, pero hubo un problema al registrar en el sistema.',
          details: 'Puedes registrar manualmente en la sección "Gestión de Invitados" si es necesario.',
          errorCode: 'PROCESS_INCOMPLETE'
        };
        showError(errorInfo);
      }
    } catch (error: any) {
      console.error('💥 [WhatsApp] Error inesperado en el proceso:', error);
      console.error('🔍 [WhatsApp] Detalles del error:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        isBdError: error?.isBdError,
        hasApiError: !!error?.apiError,
        hasConnectionError: !!error?.connectionError
      });

      // *** NUEVO: Manejo específico de errores de BD ***
      if (error.isBdError) {
        console.error('💾 [WhatsApp] Error de BD detectado, mostrando modal específico');
        
        let errorInfo: ErrorInfo;
        
        if (error.apiError) {
          // Error estructurado de la API
          errorInfo = ErrorMapper.mapApiError(error.apiError);
        } else if (error.connectionError) {
          // Error de conexión
          errorInfo = {
            type: 'connection',
            title: 'Error de conexión con la base de datos',
            message: 'No se pudo conectar con el servidor para registrar el invitado.',
            details: 'Verifica tu conexión a internet. Puedes continuar enviando por WhatsApp y registrar manualmente después.',
            actionText: 'Continuar con WhatsApp',
            errorCode: 'BD_CONNECTION_ERROR'
          };
        } else {
          // Error genérico de BD
          errorInfo = {
            type: 'connection',
            title: 'Error en el registro',
            message: 'No se pudo registrar el invitado en la base de datos.',
            details: 'Puedes continuar enviando la invitación por WhatsApp y registrar los datos manualmente después.',
            actionText: 'Continuar con WhatsApp',
            errorCode: 'BD_REGISTRATION_ERROR'
          };
        }
        
        showError(errorInfo);
        return;
      }

      // Verificar si es un error de API (no BD)
      if (error?.response) {
        try {
          const apiErrorData = await error.response.json();
          const errorInfo = ErrorMapper.mapApiError(apiErrorData);
          showError(errorInfo);
        } catch (parseError) {
          // Error al parsear respuesta de API
          const errorInfo: ErrorInfo = {
            type: 'connection',
            title: 'Error de comunicación',
            message: 'No se pudo procesar la respuesta del servidor.',
            details: 'Verifica tu conexión a internet e intenta nuevamente.',
            errorCode: 'PARSE_ERROR'
          };
          showError(errorInfo);
        }
      } else {
        // Error genérico
        const errorInfo: ErrorInfo = {
          type: 'connection',
          title: 'Error inesperado',
          message: 'Ocurrió un error inesperado durante el proceso.',
          details: error?.message || 'Por favor intenta nuevamente o contacta al administrador.',
          errorCode: 'UNEXPECTED_ERROR'
        };
        showError(errorInfo);
      }
    } finally {
      setIsSending(false);
      console.log('🔄 [WhatsApp] Estado cambiado a no enviando');
    }
  };

  return (
    <>
      <div className="mt-8 flex flex-col md:flex-row gap-4">
        {/* Botón Ver/Ocultar Vista Previa */}
        <button
          type="button"
          onClick={onTogglePreview}
          disabled={!isFormComplete}
          className="flex-1 bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
          title={!isFormComplete ? "Completa todos los campos para ver la vista previa" : ""}
        >
          {uiState.showPreview ? "🙈 Ocultar Vista Previa" : "👁️ Ver Vista Previa"}
        </button>

        {/* Botón Enviar por WhatsApp */}
        <button
          type="button"
          onClick={sendWhatsAppInvitation}
          disabled={!isFormComplete || isSending}
          className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
          title={!isFormComplete ? "Completa todos los campos para enviar por WhatsApp" : ""}
        >
          {isSending ? "⏳ Enviando..." : "📱 Enviar por WhatsApp"}
        </button>

        {/* Botón Descargar Imagen */}
        <button
          type="button"
          onClick={onDownload}
          disabled={uiState.isDownloading || !isFormComplete || !uiState.showPreview}
          className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-700 hover:from-fuchsia-600 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 rounded-lg font-bold shadow-lg transition-all disabled:cursor-not-allowed"
          title={
            !isFormComplete 
              ? "Completa todos los campos para descargar" 
              : !uiState.showPreview 
              ? "Primero ve la vista previa para descargar"
              : ""
          }
        >
          {uiState.isDownloading ? "⏳ Descargando..." : "💾 Descargar Imagen"}
        </button>
      </div>

      {/* Modal de Errores */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        error={errorModal.error}
        onClose={closeError}
        onAction={() => {
          const errorCode = errorModal.error?.errorCode;
          
          // Manejar diferentes tipos de acciones según el error
          if (errorCode === 'DUPLICATE_NAME_PHONE') {
            // Redirect a gestión de invitados
            console.log('🔗 Redirecting to guests management...');
            // TODO: Implementar navegación a gestión de invitados
            
          } else if (errorCode === 'BD_CONNECTION_ERROR' || 
                     errorCode === 'BD_REGISTRATION_ERROR') {
            // Continuar solo con WhatsApp
            console.log('📱 Usuario eligió continuar solo con WhatsApp');
            closeError();
            sendWhatsAppOnly();
            
          } else if (errorModal.error?.actionText?.includes('Reintentar')) {
            // Reintentar la acción completa
            console.log('🔄 Usuario eligió reintentar proceso completo');
            closeError();
            sendWhatsAppInvitation();
            
          } else {
            // Acción por defecto: cerrar modal
            closeError();
          }
        }}
      />
    </>
  );
};
