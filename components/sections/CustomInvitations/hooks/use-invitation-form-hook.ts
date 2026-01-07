// ================================================================
// 📁 hooks/useInvitationForm.ts
// ================================================================

import { useState, useCallback } from 'react';
import { 
  FormData, 
  FormField, 
  AuthState, 
  UIState, 
  UseInvitationFormReturn 
} from '../types/invitation.types';
import { ADMIN_PASSWORD } from '../constants/invitation.constants';

// Estados iniciales
const initialFormData: FormData = {
  guestName: "",
  guestRelation: "",
  personalMessage: "",
  numberOfGuests: "",
  whatsappNumber: "",
};

const initialAuthState: AuthState = {
  isAuthenticated: false,
  showAuthPopover: false,
  password: "",
  showPassword: false,
  authError: "",
};

const initialUIState: UIState = {
  showPreview: false,
  isDownloading: false,
  downloadError: "",
};

/**
 * Hook personalizado para manejar el estado del formulario de invitaciones
 * @returns Objeto con estados y funciones para manejar el formulario
 */
export const useInvitationForm = (): UseInvitationFormReturn => {
  // Estados principales
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [uiState, setUIState] = useState<UIState>(initialUIState);

  /**
   * Actualiza un campo específico del formulario
   * @param field - Campo a actualizar
   * @param value - Nuevo valor
   */
  const updateFormData = useCallback((field: FormField, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Actualiza parcialmente el estado de autenticación
   * @param updates - Actualizaciones parciales del estado
   */
  const updateAuthState = useCallback((updates: Partial<AuthState>): void => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Actualiza parcialmente el estado de la UI
   * @param updates - Actualizaciones parciales del estado
   */
  const updateUIState = useCallback((updates: Partial<UIState>): void => {
    setUIState((prev) => ({ ...prev, ...updates }));
  }, []);

  /**
   * Maneja el proceso de autenticación
   * @param e - Evento del formulario o botón
   */
  const handleAuthentication = useCallback((
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ): void => {
    e.preventDefault();
    
    if (authState.password === ADMIN_PASSWORD) {
      updateAuthState({
        isAuthenticated: true,
        authError: "",
        password: "",
        showAuthPopover: false,
      });
    } else {
      updateAuthState({
        authError: "Contraseña incorrecta",
        password: "",
      });
    }
  }, [authState.password, updateAuthState]);

  /**
   * Resetea el formulario a su estado inicial
   */
  const resetForm = useCallback((): void => {
    setFormData(initialFormData);
    setUIState(initialUIState);
  }, []);

  /**
   * Resetea solo los errores
   */
  const clearErrors = useCallback((): void => {
    updateAuthState({ authError: "" });
    updateUIState({ downloadError: "" });
  }, [updateAuthState, updateUIState]);

  /**
   * Cierra la sesión del administrador
   */
  const logout = useCallback((): void => {
    setAuthState(initialAuthState);
    setUIState(initialUIState);
  }, []);

  /**
   * Alterna la visibilidad de la vista previa
   */
  const togglePreview = useCallback((): void => {
    setUIState(prev => ({ ...prev, showPreview: !prev.showPreview }));
  }, []);

  /**
   * Establece el estado de descarga
   * @param isDownloading - Si está descargando
   * @param error - Error opcional
   */
  const setDownloadState = useCallback((isDownloading: boolean, error?: string): void => {
    updateUIState({ 
      isDownloading, 
      downloadError: error || "" 
    });
  }, [updateUIState]);

  /**
   * Verifica si el formulario es válido
   * @returns true si todos los campos requeridos están completos
   */
  const isFormValid = useCallback((): boolean => {
    return !!(
      formData.guestName &&
      formData.personalMessage &&
      formData.numberOfGuests &&
      formData.whatsappNumber
    );
  }, [formData]);

  /**
   * Verifica si el teléfono es válido
   * @returns true si el teléfono tiene 10 dígitos
   */
  const isPhoneValid = useCallback((): boolean => {
    const cleanNumber = formData.whatsappNumber.replace(/\D/g, "");
    return cleanNumber.length === 10;
  }, [formData.whatsappNumber]);

  /**
   * Obtiene el número de caracteres restantes para un campo
   * @param field - Campo a verificar
   * @param maxLength - Longitud máxima
   * @returns Caracteres restantes
   */
  const getRemainingChars = useCallback((field: FormField, maxLength: number): number => {
    return maxLength - formData[field].length;
  }, [formData]);

  return {
    // Estados
    formData,
    authState,
    uiState,
    
    // Funciones de actualización
    updateFormData,
    updateAuthState,
    updateUIState,
    
    // Funciones específicas
    handleAuthentication,
    resetForm,
    clearErrors,
    logout,
    togglePreview,
    setDownloadState,
    
    // Funciones de validación
    isFormValid,
    isPhoneValid,
    getRemainingChars,
  };
};