// ================================================================
// 📁 components/InvitationForm.tsx
// ================================================================

import React from 'react';
import { InvitationFormProps } from '../types/invitation.types';
import { 
  SUGGESTED_MESSAGES, 
  RELATION_OPTIONS, 
  PHONE_CONFIG, 
  CSS_CLASSES 
} from '../constants/invitation.constants';
import { formatMexicanPhone } from '../utils/invitation.utils';

/**
 * Componente del formulario principal de invitaciones
 */
export const InvitationForm: React.FC<InvitationFormProps> = ({
  formData,
  onUpdateFormData,
}) => {
  // Verificar si el teléfono es válido
  const isPhoneValid = formData.whatsappNumber.length === 0 || 
    formData.whatsappNumber.replace(/\D/g, "").length === PHONE_CONFIG.DIGITS_REQUIRED;

  // Manejar el cambio del número de teléfono
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const currentValue = formData.whatsappNumber;
    
    // Pasar el valor anterior para detectar si está borrando
    const formattedValue = formatMexicanPhone(newValue, currentValue);
    onUpdateFormData("whatsappNumber", formattedValue);
  };

  // Manejar teclas especiales como backspace
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const cursorPosition = target.selectionStart || 0;
    const currentValue = formData.whatsappNumber;
    
    // Si presiona backspace y el cursor está en un espacio, mover el cursor
    if (e.key === 'Backspace' && cursorPosition > 0) {
      const charAtCursor = currentValue[cursorPosition - 1];
      
      // Si el carácter anterior es un espacio, eliminarlo también
      if (charAtCursor === ' ') {
        e.preventDefault();
        const newValue = currentValue.slice(0, cursorPosition - 2) + currentValue.slice(cursorPosition);
        const formattedValue = formatMexicanPhone(newValue, currentValue);
        onUpdateFormData("whatsappNumber", formattedValue);
        
        // Posicionar el cursor correctamente después del formateo
        setTimeout(() => {
          target.setSelectionRange(cursorPosition - 2, cursorPosition - 2);
        }, 0);
      }
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Columna izquierda - Datos básicos */}
      <div className="space-y-6">
        {/* Nombre del invitado */}
        <div>
          <label 
            htmlFor="guestName"
            className="block text-sm font-medium text-purple-700 mb-2"
          >
            Nombre del invitado *
          </label>
          <input
            id="guestName"
            type="text"
            value={formData.guestName}
            onChange={(e) => onUpdateFormData("guestName", e.target.value)}
            placeholder="Ej: Valeria Martínez"
            className={`w-full text-black px-4 py-3 border rounded-lg ${CSS_CLASSES.BORDER_FOCUS}`}
            required
            maxLength={50}
            autoComplete="name"
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.guestName.length}/50 caracteres
          </div>
        </div>

        {/* Relación con la quinceañera */}
        <div>
          <label 
            htmlFor="guestRelation"
            className="block text-sm font-medium text-purple-700 mb-2"
          >
            Relación con la quinceañera
          </label>
          <select
            id="guestRelation"
            value={formData.guestRelation}
            onChange={(e) => onUpdateFormData("guestRelation", e.target.value)}
            className={`w-full text-black px-4 py-3 border rounded-lg ${CSS_CLASSES.BORDER_FOCUS}`}
          >
            {RELATION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Número de invitados */}
        <div>
          <label 
            htmlFor="numberOfGuests"
            className="block text-sm font-medium text-purple-700 mb-2"
          >
            Número de invitados *
          </label>
          <select
            id="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={(e) => onUpdateFormData("numberOfGuests", e.target.value)}
            className={`w-full text-black px-4 py-3 border rounded-lg ${CSS_CLASSES.BORDER_FOCUS}`}
            required
          >
            <option value="">Selecciona número de invitados</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {i + 1} {i === 0 ? 'persona' : 'personas'}
              </option>
            ))}
          </select>
        </div>

        {/* WhatsApp México */}
        <div>
          <label 
            htmlFor="whatsappNumber"
            className="block text-sm font-medium text-purple-700 mb-2"
          >
            WhatsApp México ({PHONE_CONFIG.DIGITS_REQUIRED} dígitos) *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
              {PHONE_CONFIG.FLAG} {PHONE_CONFIG.COUNTRY_CODE}
            </div>
            <input
              id="whatsappNumber"
              type="tel"
              value={formData.whatsappNumber}
              onChange={handlePhoneChange}
              onKeyDown={handlePhoneKeyDown}
              placeholder={PHONE_CONFIG.PLACEHOLDER}
              maxLength={PHONE_CONFIG.MAX_LENGTH}
              className={`w-full text-black pl-16 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                isPhoneValid 
                  ? CSS_CLASSES.BORDER_FOCUS.replace('border-fuchsia-200', 'border-fuchsia-200')
                  : CSS_CLASSES.BORDER_ERROR
              }`}
              required
              autoComplete="tel"
            />
          </div>
          
          {/* Validación del teléfono */}
          {!isPhoneValid && formData.whatsappNumber.length > 0 && (
            <div className="mt-1 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs text-red-600 flex items-center gap-1">
                <span>⚠️</span>
                Debe tener exactamente {PHONE_CONFIG.DIGITS_REQUIRED} dígitos
              </p>
            </div>
          )}
          
          {/* Contador de dígitos */}
          <div className="mt-1 text-xs text-gray-500">
            {formData.whatsappNumber.replace(/\D/g, "").length}/{PHONE_CONFIG.DIGITS_REQUIRED} dígitos
          </div>
        </div>
      </div>

      {/* Columna derecha - Mensaje personalizado */}
      <div className="space-y-6">
        {/* Mensaje personalizado */}
        <div>
          <label 
            htmlFor="personalMessage"
            className="block text-sm font-medium text-purple-700 mb-2"
          >
            Mensaje especial *
          </label>
          <textarea
            id="personalMessage"
            value={formData.personalMessage}
            onChange={(e) => onUpdateFormData("personalMessage", e.target.value)}
            placeholder="Escribe un mensaje personalizado para el invitado..."
            rows={4}
            className={`w-full text-black px-4 py-3 border rounded-lg resize-none ${CSS_CLASSES.BORDER_FOCUS}`}
            required
            maxLength={500}
          />
          <div className="mt-1 text-xs text-gray-500">
            {formData.personalMessage.length}/500 caracteres
          </div>
        </div>

        {/* Mensajes sugeridos */}
        <div>
          <label className="block text-sm font-medium text-purple-700 mb-2">
            💡 Mensajes sugeridos
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {SUGGESTED_MESSAGES.map((message, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onUpdateFormData("personalMessage", message)}
                className="w-full text-slate-700 text-left p-3 text-sm bg-fuchsia-50 hover:bg-fuchsia-100 border border-fuchsia-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                title="Hacer clic para usar este mensaje"
              >
                <div className="line-clamp-2">
                  {message}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Haz clic en cualquier mensaje para usarlo como base
          </div>
        </div>

        {/* Consejos para el mensaje */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            ✨ Consejos para tu mensaje:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Menciona por qué es especial para ti</li>
            <li>• Incluye algún recuerdo compartido</li>
            <li>• Expresa tu emoción por el evento</li>
            <li>• Mantén un tono cálido y personal</li>
          </ul>
        </div>
      </div>
    </div>
  );
};