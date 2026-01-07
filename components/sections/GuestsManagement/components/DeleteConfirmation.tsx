import React, { useState } from 'react';
import { X, Trash2, AlertTriangle, User, Users, Calendar } from 'lucide-react';
import { Guest } from '../types/guests.types';

interface DeleteConfirmationProps {
  isOpen: boolean;
  guest: Guest | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<boolean>;
  loading?: boolean;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  guest,
  onClose,
  onConfirm,
  loading = false
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (!guest || confirmationText.toLowerCase() !== 'eliminar') {
      return;
    }

    setIsDeleting(true);
    
    try {
      const success = await onConfirm(guest._id);
      
      if (success) {
        handleClose();
      }
    } catch (error) {
      console.error('Error al eliminar invitado:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationText('');
      onClose();
    }
  };

  const isConfirmationValid = confirmationText.toLowerCase() === 'eliminar';
  const hasImportantData = guest?.attendance?.confirmed || guest?.personalInvitation?.sent;

  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl border-2 animate-vip-pulse-aurora"
          style={{
            background: 'linear-gradient(135deg, rgba(253, 252, 252, 0.98) 0%, rgba(248, 246, 240, 0.98) 100%)',
            borderColor: '#ef4444'
          }}
        >
          {/* Shimmer effect decorativo (rojo para advertencia) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-vip-shimmer-aurora"></div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl shadow-md bg-red-500"
              >
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600">
                  Eliminar Invitado
                </h2>
                <p className="text-sm opacity-70 text-red-500">
                  Acción irreversible
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isDeleting}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50 bg-red-100 text-red-600 hover:bg-red-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Información del invitado */}
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
              <User className="w-5 h-5" />
              {guest.name}
            </h3>
            
            <div className="space-y-2 text-sm text-red-700">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Relación: <strong>{guest.relation}</strong></span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Estado: <strong>{guest.status}</strong></span>
              </div>

              {guest.phone && (
                <div className="text-xs opacity-75">
                  Teléfono: {guest.phone}
                </div>
              )}
            </div>
          </div>

          {/* Advertencias sobre datos importantes */}
          {hasImportantData && (
            <div className="mb-6 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-800">¡Atención!</h4>
              </div>
              
              <div className="text-sm text-yellow-700 space-y-1">
                {guest.attendance?.confirmed && (
                  <p>• Este invitado ya confirmó su asistencia</p>
                )}
                {guest.personalInvitation?.sent && (
                  <p>• Se le envió una invitación personalizada</p>
                )}
                <p className="font-medium mt-2">Esta información se perderá permanentemente.</p>
              </div>
            </div>
          )}

          {/* Mensaje de advertencia */}
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div className="flex items-start gap-3">
              <Trash2 className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Esta acción no se puede deshacer.</p>
                <p>
                  Se eliminarán todos los datos del invitado incluyendo:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                  <li>Información de contacto</li>
                  <li>Estado de confirmación</li>
                  <li>Historial de invitaciones</li>
                  <li>Registros de comunicación</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Campo de confirmación */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-red-700">
              Para confirmar, escribe &ldquo;eliminar&rdquo; en minúsculas:
            </label>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="eliminar"
              disabled={isDeleting}
              className="w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50 bg-white"
              style={{
                borderColor: isConfirmationValid ? '#ef4444' : '#d1d5db',
                boxShadow: isConfirmationValid ? '0 0 0 3px rgba(239, 68, 68, 0.1)' : 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#ef4444';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isConfirmationValid ? '#ef4444' : '#d1d5db';
              }}
            />
            
            {confirmationText && !isConfirmationValid && (
              <p className="mt-1 text-sm text-red-600">
                Debe escribir exactamente &ldquo;eliminar&rdquo;
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
            >
              <span className="font-medium">Cancelar</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || loading || !isConfirmationValid}
              className="flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2 bg-red-500 border-red-500 text-white hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="font-medium">Eliminar Definitivamente</span>
                </>
              )}
            </button>
          </div>

          {/* Nota final */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Esta acción es permanente e irreversible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
