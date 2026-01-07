import React from 'react';
import { Phone, Calendar, Users, Edit, Trash2, Eye, CheckCircle, Clock, Send } from 'lucide-react';
import { Guest, STATUS_COLORS } from '../types/guests.types';

interface GuestCardProps {
  guest: Guest;
  onEdit?: (guest: Guest) => void;
  onDelete?: (guest: Guest) => void;
  onView?: (guest: Guest) => void;
}

const GuestCard: React.FC<GuestCardProps> = ({
  guest,
  onEdit,
  onDelete,
  onView
}) => {
  const statusConfig = STATUS_COLORS[guest.status] || STATUS_COLORS.pending;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = () => {
    switch (guest.status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'invited':
        return <Send className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (guest.status) {
      case 'confirmed':
        return 'Confirmado';
      case 'invited':
        return 'Invitado';
      case 'pending':
        return 'Pendiente';
      case 'declined':
        return 'Declinado';
      default:
        return 'Pendiente';
    }
  };

  const getRelationText = () => {
    const relations: Record<string, string> = {
      familia: 'Familia',
      amigos: 'Amigos',
      escuela: 'Escuela',
      trabajo: 'Trabajo',
      otros: 'Otros'
    };
    return relations[guest.relation] || guest.relation;
  };

  const guestCount = guest.attendance?.numberOfGuestsConfirmed || 
                    guest.personalInvitation?.numberOfGuests || 1;

  return (
    <div 
      className="rounded-2xl p-6 border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 group relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(253, 252, 252, 0.95) 0%, rgba(248, 246, 240, 0.95) 100%)',
        borderColor: 'rgba(230, 217, 255, 0.4)'
      }}
    >
      {/* Shimmer effect decorativo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-aurora-lavanda to-transparent animate-vip-shimmer-aurora opacity-40"></div>
      
      {/* Header con nombre y estado */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 
            className="text-lg text-purple-800 font-bold leading-tight mb-2"
            //style={{ color: 'var(--color-aurora-lavanda)' }}
          >
            {guest.name}
          </h3>
          
          {/* Badge de estado */}
          <div 
            className="inline-flex text-sky-500 items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
            style={{
              background: statusConfig.bg,
              borderColor: statusConfig.border,
              //color: statusConfig.text
            }}
          >
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </div>

        {/* Contador de invitados */}
        {guestCount > 1 && (
          <div 
            className="flex text-emerald-600 items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium"
            style={{
              background: 'rgba(230, 217, 255, 0.3)',
              //color: 'var(--color-aurora-lavanda)'
            }}
          >
            <Users className="w-4 h-4" />
            <span>+{guestCount - 1}</span>
          </div>
        )}
      </div>

      {/* Información del invitado */}
      <div className="space-y-3 mb-6">
        {/* Relación */}
        <div className="flex items-center gap-3">
          <div 
            className="p-1 rounded-md"
            style={{ backgroundColor: 'rgba(255, 179, 217, 0.2)' }}
          >
            <span className="text-xs font-medium text-rose-500">
              {getRelationText()}
            </span>
          </div>
        </div>

        {/* Teléfono */}
        {guest.phone && (
          <div className="flex items-center gap-3 text-sm">
            <Phone className="w-4 h-4 opacity-60 text-slate-600"  />
            <span className="text-purple-800">
              {guest.phone}
            </span>
          </div>
        )}

        {/* Fecha de confirmación */}
        {guest.attendance?.confirmed && guest.attendance.confirmedAt && (
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 opacity-60 text-slate-600" />
            <span className="text-purple-800">
              Confirmó: {formatDate(guest.attendance.confirmedAt)}
            </span>
          </div>
        )}

        {/* Fecha de invitación */}
        {guest.personalInvitation?.sent && guest.personalInvitation.sentAt && (
          <div className="flex items-center gap-3 text-sm">
            <Send className="w-4 h-4 opacity-60 text-slate-600" />
            <span className="text-purple-800">
              Invitado: {formatDate(guest.personalInvitation.sentAt)}
            </span>
          </div>
        )}

        {/* Mensaje de confirmación */}
        {guest.attendance?.message && (
          <div className="mt-3 p-3 rounded-xl" style={{ background: 'rgba(230, 217, 255, 0.2)' }}>
            <p className="text-sm italic text-slate-600" >
              &ldquo;{guest.attendance.message}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center gap-2">
        {onView && (
          <button
            onClick={() => onView(guest)}
            className="flex-1 text-purple-500 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 group/btn"
            style={{
              background: 'rgba(230, 217, 255, 0.1)',
              borderColor: 'var(--color-aurora-lavanda)',
              //color: 'var(--color-aurora-lavanda)'
            }}
          >
            <Eye className="w-4 h-4 group-hover/btn:animate-bounce" />
            <span className="text-sm font-medium">Ver</span>
          </button>
        )}

        {onEdit && (
          <button
            onClick={() => onEdit(guest)}
            className="flex-1 text-emerald-500 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 group/btn"
            style={{
              background: 'rgba(255, 242, 204, 0.1)',
              borderColor: 'var(--color-aurora-oro)',
              //color: 'var(--color-aurora-oro)'
            }}
          >
            <Edit className="w-4 h-4 group-hover/btn:animate-bounce" />
            <span className="text-sm font-medium">Editar</span>
          </button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(guest)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 group/btn"
            style={{
              background: 'rgba(255, 230, 230, 0.1)',
              borderColor: '#ef4444',
              color: '#dc2626'
            }}
          >
            <Trash2 className="w-4 h-4 group-hover/btn:animate-bounce" />
          </button>
        )}
      </div>

      {/* Efecto hover en el fondo */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  );
};

export default GuestCard;
