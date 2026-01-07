// ================================================================
// 📁 components/ErrorModal.tsx
// ================================================================

import React from 'react';

export interface ErrorInfo {
  title: string;
  message: string;
  details?: string;
  actionText?: string;
  errorCode?: string;
  type: 'validation' | 'duplicate' | 'connection' | 'whatsapp';
}

interface ErrorModalProps {
  isOpen: boolean;
  error: ErrorInfo | null;
  onClose: () => void;
  onAction?: () => void;
}

/**
 * Modal para mostrar errores específicos con explicaciones detalladas
 */
export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  error,
  onClose,
  onAction,
}) => {
  if (!isOpen || !error) return null;

  // Determinar colores e íconos según el tipo de error
  const getErrorStyles = (type: string) => {
    switch (type) {
      case 'validation':
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconColor: 'text-yellow-600',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⚠️'
        };
      case 'duplicate':
        return {
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          buttonColor: 'bg-blue-600 hover:bg-blue-700',
          icon: '👥'
        };
      case 'connection':
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-600',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          icon: '🚫'
        };
      case 'whatsapp':
        return {
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          icon: '📱'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          iconColor: 'text-gray-600',
          buttonColor: 'bg-gray-600 hover:bg-gray-700',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getErrorStyles(error.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-2 ${styles.borderColor}`}>
        {/* Header */}
        <div className={`${styles.bgColor} px-6 py-4 rounded-t-lg border-b ${styles.borderColor}`}>
          <div className="flex items-center space-x-3">
            <div className={`text-2xl ${styles.iconColor}`}>
              {styles.icon}
            </div>
            <h2 className={`text-lg font-bold ${styles.iconColor}`}>
              {error.title}
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-3 leading-relaxed">
            {error.message}
          </p>

          {error.details && (
            <div className={`${styles.bgColor} p-3 rounded-lg border ${styles.borderColor} mb-4`}>
              <p className="text-sm text-gray-600">
                <strong>Detalles:</strong> {error.details}
              </p>
            </div>
          )}

          {error.errorCode && (
            <p className="text-xs text-gray-400 mb-4">
              Código de error: {error.errorCode}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
          {error.actionText && onAction && (
            <button
              onClick={onAction}
              className={`px-4 py-2 text-white rounded-lg font-medium transition-all ${styles.buttonColor}`}
            >
              {error.actionText}
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};