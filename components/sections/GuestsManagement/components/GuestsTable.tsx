import React from 'react';
import { Phone, Calendar, Users, Edit, Trash2, Eye, CheckCircle, Clock, Send } from 'lucide-react';
import { Guest, STATUS_COLORS } from '../types/guests.types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GuestsTableProps {
  guests: Guest[];
  onEdit?: (guest: Guest) => void;
  onDelete?: (guest: Guest) => void;
  onView?: (guest: Guest) => void;
}

const GuestsTable: React.FC<GuestsTableProps> = ({
  guests,
  onEdit,
  onDelete,
  onView
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'invited':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'declined':
        return <Clock className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
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

  const getRelationText = (relation: string) => {
    const relations: Record<string, string> = {
      familia: 'Familia',
      amigos: 'Amigos',
      escuela: 'Escuela',
      trabajo: 'Trabajo',
      otros: 'Otros'
    };
    return relations[relation] || relation;
  };

  const getGuestCount = (guest: Guest) => {
    return guest.attendance?.numberOfGuestsConfirmed || 
           guest.personalInvitation?.numberOfGuests || 1;
  };

  return (
    <div 
      className="rounded-2xl border-2 shadow-lg overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(253, 252, 252, 0.95) 0%, rgba(248, 246, 240, 0.95) 100%)',
        borderColor: 'rgba(230, 217, 255, 0.4)'
      }}
    >
      {/* Shimmer effect decorativo */}
      <div className="w-full h-1 bg-gradient-to-r from-transparent via-aurora-lavanda to-transparent animate-vip-shimmer-aurora opacity-40"></div>
      
      <Table>
        <TableHeader>
          <TableRow style={{ borderColor: 'rgba(230, 217, 255, 0.3)' }}>
            <TableHead className="text-purple-800 font-bold">Nombre</TableHead>
            <TableHead className="text-purple-800 font-bold">Estado</TableHead>
            <TableHead className="text-purple-800 font-bold">Relación</TableHead>
            <TableHead className="text-purple-800 font-bold">Teléfono</TableHead>
            <TableHead className="text-purple-800 font-bold">Invitados</TableHead>
            <TableHead className="text-purple-800 font-bold">Fecha Inv.</TableHead>
            <TableHead className="text-purple-800 font-bold text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {guests.map((guest) => {
            const statusConfig = STATUS_COLORS[guest.status] || STATUS_COLORS.pending;
            const guestCount = getGuestCount(guest);
            
            return (
              <TableRow 
                key={guest._id}
                className="hover:bg-gradient-to-r hover:from-aurora-lavanda/5 hover:to-aurora-rosa/5 transition-all duration-300"
                style={{ borderColor: 'rgba(230, 217, 255, 0.2)' }}
              >
                {/* Nombre */}
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-purple-800 font-semibold">{guest.name}</p>
                      {guest.attendance?.message && (
                        <p className="text-xs text-slate-500 italic max-w-xs truncate">
                          &quot;{guest.attendance.message}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell>
                  <div 
                    className="inline-flex text-sky-700 items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border"
                    style={{
                      background: statusConfig.bg,
                      borderColor: statusConfig.border,
                      //color: statusConfig.text
                    }}
                  >
                    {getStatusIcon(guest.status)}
                    <span>{getStatusText(guest.status)}</span>
                  </div>
                </TableCell>

                {/* Relación */}
                <TableCell>
                  <span 
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-rose-500"
                    style={{ backgroundColor: 'rgba(255, 179, 217, 0.2)' }}
                  >
                    {getRelationText(guest.relation)}
                  </span>
                </TableCell>

                {/* Teléfono */}
                <TableCell>
                  {guest.phone ? (
                    <div className="flex items-center gap-2 text-purple-800">
                      <Phone className="w-4 h-4 opacity-60" />
                      <span className="text-sm">{guest.phone}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">Sin teléfono</span>
                  )}
                </TableCell>

                {/* Número de invitados */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">{guestCount}</span>
                  </div>
                </TableCell>

                {/* Fecha de invitación */}
                <TableCell>
                  {guest.personalInvitation?.sent && guest.personalInvitation.sentAt ? (
                    <div className="flex items-center gap-2 text-purple-800">
                      <Calendar className="w-4 h-4 opacity-60" />
                      <span className="text-sm">{formatDate(guest.personalInvitation.sentAt)}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 text-sm">No invitado</span>
                  )}
                </TableCell>

                {/* Acciones */}
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    {onView && (
                      <button
                        onClick={() => onView(guest)}
                        className="p-2 text-emerald-700 rounded-lg border-2 transition-all duration-300 hover:scale-110 group"
                        style={{
                          background: 'rgba(230, 217, 255, 0.1)',
                          borderColor: '#ccc',
                          //color: 'var(--color-aurora-lavanda)'
                        }}
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4 group-hover:animate-bounce" />
                      </button>
                    )}

                    {onEdit && (
                      <button
                        onClick={() => onEdit(guest)}
                        className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 group"
                        style={{
                          background: 'rgba(255, 242, 204, 0.1)',
                          borderColor: 'var(--color-aurora-oro)',
                          color: 'var(--color-aurora-oro)'
                        }}
                        title="Editar invitado"
                      >
                        <Edit className="w-4 h-4 group-hover:animate-bounce" />
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => onDelete(guest)}
                        className="p-2 rounded-lg border-2 transition-all duration-300 hover:scale-110 group"
                        style={{
                          background: 'rgba(255, 230, 230, 0.1)',
                          borderColor: '#ef4444',
                          color: '#dc2626'
                        }}
                        title="Eliminar invitado"
                      >
                        <Trash2 className="w-4 h-4 group-hover:animate-bounce" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Estado vacío */}
      {guests.length === 0 && (
        <div className="text-center py-16">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 opacity-50"
            style={{ backgroundColor: 'rgba(230, 217, 255, 0.3)' }}
          >
            <Users className="w-10 h-10" style={{ color: 'var(--color-aurora-lavanda)' }} />
          </div>
          <h3 className="text-xl font-bold text-purple-800 mb-2">
            No hay invitados registrados
          </h3>
          <p className="text-slate-600">
            Comienza agregando tu primer invitado o actualiza la lista
          </p>
        </div>
      )}
    </div>
  );
};

export default GuestsTable;
