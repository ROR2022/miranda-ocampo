import React, { useState, useEffect } from 'react';
import { X, Edit, User, Phone, Users } from 'lucide-react';
import { Guest, GuestFormData, RELATION_OPTIONS } from '../types/guests.types';

interface EditGuestFormProps {
  isOpen: boolean;
  guest: Guest | null;
  onClose: () => void;
  onSubmit: (id: string, data: Partial<GuestFormData>) => Promise<boolean>;
  loading?: boolean;
}

const EditGuestForm: React.FC<EditGuestFormProps> = ({
  isOpen,
  guest,
  onClose,
  onSubmit,
  loading = false
}) => {
  const [formData, setFormData] = useState<GuestFormData>({
    name: '',
    phone: '',
    relation: 'familia'
  });
  const [errors, setErrors] = useState<Partial<GuestFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Cargar datos del invitado al abrir modal
  useEffect(() => {
    if (isOpen && guest) {
      const initialData = {
        name: guest.name,
        phone: guest.phone || '',
        relation: guest.relation
      };
      setFormData(initialData);
      setErrors({});
      setHasChanges(false);
    }
  }, [isOpen, guest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setHasChanges(true);
    
    // Limpiar error del campo al escribir
    if (errors[name as keyof GuestFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GuestFormData> = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar teléfono (opcional, pero si se proporciona debe ser válido)
    if (formData.phone.trim() && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Formato de teléfono inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!guest || !validateForm()) {
      return;
    }

    if (!hasChanges) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await onSubmit(guest._id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        relation: formData.relation
      });

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Error al actualizar invitado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', phone: '', relation: 'familia' });
      setErrors({});
      setHasChanges(false);
      onClose();
    }
  };

  if (!isOpen || !guest) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      ></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-md rounded-2xl p-8 shadow-2xl border-2 animate-vip-pulse-aurora"
          style={{
            background: 'linear-gradient(135deg, rgba(253, 252, 252, 0.98) 0%, rgba(248, 246, 240, 0.98) 100%)',
            borderColor: 'var(--color-aurora-oro)'
          }}
        >
          {/* Shimmer effect decorativo */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aurora-oro to-transparent animate-vip-shimmer-aurora"></div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div 
                className="p-3 rounded-xl shadow-md"
                style={{ backgroundColor: 'var(--color-aurora-oro)' }}
              >
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 
                  className="text-2xl font-bold"
                  style={{ color: 'var(--color-aurora-oro)' }}
                >
                  Editar Invitado
                </h2>
                <p className="text-sm opacity-70" style={{ color: 'var(--color-aurora-oro)' }}>
                  {guest.name}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110 disabled:opacity-50"
              style={{ 
                background: 'rgba(255, 179, 217, 0.2)',
                color: 'var(--color-aurora-rosa)'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Información actual */}
          <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(255, 242, 204, 0.2)' }}>
            <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--color-aurora-oro)' }}>
              Información actual:
            </h3>
            <div className="text-sm space-y-1" style={{ color: 'var(--color-aurora-oro)' }}>
              <p><strong>Estado:</strong> {guest.status}</p>
              {guest.attendance?.confirmed && (
                <p><strong>Confirmado:</strong> {new Date(guest.attendance.confirmedAt!).toLocaleDateString()}</p>
              )}
              {guest.personalInvitation?.sent && (
                <p><strong>Invitado:</strong> {new Date(guest.personalInvitation.sentAt!).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nombre */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-aurora-oro)' }}
              >
                Nombre completo *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 opacity-60" style={{ color: 'var(--color-aurora-oro)' }} />
                </div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre del invitado"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(253, 252, 252, 0.8)',
                    borderColor: errors.name ? '#ef4444' : 'rgba(255, 242, 204, 0.4)',
                    color: 'var(--color-aurora-oro)'
                  }}
                  onFocus={(e) => {
                    if (!errors.name) {
                      e.target.style.borderColor = 'var(--color-aurora-oro)';
                      e.target.style.boxShadow = '0 0 20px rgba(255, 242, 204, 0.4)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : 'rgba(255, 242, 204, 0.4)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">❌ {errors.name}</p>
              )}
            </div>

            {/* Campo Teléfono */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-aurora-oro)' }}
              >
                Teléfono (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 opacity-60" style={{ color: 'var(--color-aurora-oro)' }} />
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Número de teléfono"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(253, 252, 252, 0.8)',
                    borderColor: errors.phone ? '#ef4444' : 'rgba(255, 242, 204, 0.4)',
                    color: 'var(--color-aurora-oro)'
                  }}
                  onFocus={(e) => {
                    if (!errors.phone) {
                      e.target.style.borderColor = 'var(--color-aurora-oro)';
                      e.target.style.boxShadow = '0 0 20px rgba(255, 242, 204, 0.4)';
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.phone ? '#ef4444' : 'rgba(255, 242, 204, 0.4)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">❌ {errors.phone}</p>
              )}
            </div>

            {/* Campo Relación */}
            <div>
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: 'var(--color-aurora-oro)' }}
              >
                Relación *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="h-5 w-5 opacity-60" style={{ color: 'var(--color-aurora-oro)' }} />
                </div>
                <select
                  name="relation"
                  value={formData.relation}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border-2 transition-all duration-300 focus:outline-none disabled:opacity-50"
                  style={{
                    background: 'rgba(253, 252, 252, 0.8)',
                    borderColor: 'rgba(255, 242, 204, 0.4)',
                    color: 'var(--color-aurora-oro)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-aurora-oro)';
                    e.target.style.boxShadow = '0 0 20px rgba(255, 242, 204, 0.4)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 242, 204, 0.4)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  {RELATION_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Indicador de cambios */}
            {hasChanges && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255, 242, 204, 0.3)' }}>
                <p className="text-sm" style={{ color: 'var(--color-aurora-oro)' }}>
                  ⚠️ Tienes cambios sin guardar
                </p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none"
                style={{
                  background: 'rgba(255, 242, 204, 0.1)',
                  borderColor: 'var(--color-aurora-oro)',
                  color: 'var(--color-aurora-oro)'
                }}
              >
                <span className="font-medium">Cancelar</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting || loading || !hasChanges}
                className="flex-1 px-4 py-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
                style={{
                  background: hasChanges 
                    ? 'linear-gradient(135deg, var(--color-aurora-oro), #f59e0b)' 
                    : 'rgba(255, 242, 204, 0.3)',
                  borderColor: 'var(--color-aurora-oro)',
                  color: hasChanges ? 'white' : 'var(--color-aurora-oro)'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    <span className="font-medium">
                      {hasChanges ? 'Guardar Cambios' : 'Sin Cambios'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGuestForm;
