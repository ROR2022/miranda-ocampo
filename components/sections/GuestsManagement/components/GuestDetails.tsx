"use client"
import React, { FC } from 'react'
import { Guest } from '../types/guests.types'
import { 
  User, 
  Phone, 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  Send, 
  XCircle,
  Heart,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Crown
} from 'lucide-react'
import Link from 'next/link'

/**
 * Este componente recibe el dataGuest
 * y muestra los detalles completos del invitado
 * en una vista de perfil dedicada.
 */

interface GuestDetailsProps {
    dataGuest: Guest;
}

const GuestDetails: FC<GuestDetailsProps> = ({ dataGuest }) => {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = () => {
    switch (dataGuest.status) {
      case 'confirmed':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Confirmado',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-800',
          borderColor: 'border-emerald-300',
          iconColor: 'text-emerald-600'
        };
      case 'invited':
        return {
          icon: <Send className="w-6 h-6" />,
          text: 'Invitado',
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-800',
          borderColor: 'border-purple-300',
          iconColor: 'text-purple-600'
        };
      case 'declined':
        return {
          icon: <XCircle className="w-6 h-6" />,
          text: 'Declinado',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300',
          iconColor: 'text-red-600'
        };
      default:
        return {
          icon: <Clock className="w-6 h-6" />,
          text: 'Pendiente',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-300',
          iconColor: 'text-amber-600'
        };
    }
  };

  const getRelationConfig = () => {
    switch (dataGuest.relation) {
      case 'familia':
        return {
          icon: <Heart className="w-5 h-5" />,
          text: 'Familia',
          bgColor: 'bg-rose-100',
          textColor: 'text-rose-800',
          iconColor: 'text-rose-600'
        };
      case 'amigos':
        return {
          icon: <Users className="w-5 h-5" />,
          text: 'Amigos',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600'
        };
      case 'escuela':
        return {
          icon: <Crown className="w-5 h-5" />,
          text: 'Escuela',
          bgColor: 'bg-indigo-100',
          textColor: 'text-indigo-800',
          iconColor: 'text-indigo-600'
        };
      case 'trabajo':
        return {
          icon: <MapPin className="w-5 h-5" />,
          text: 'Trabajo',
          bgColor: 'bg-teal-100',
          textColor: 'text-teal-800',
          iconColor: 'text-teal-600'
        };
      default:
        return {
          icon: <User className="w-5 h-5" />,
          text: 'Otros',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getAttendanceConfig = () => {
    if (!dataGuest.attendance) {
      return {
        icon: <Clock className="w-5 h-5" />,
        text: 'Sin Respuesta',
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-900',
        iconColor: 'text-gray-600',
        bgContainer: 'border-gray-200 bg-gray-50'
      };
    }

    // Si tiene confirmedAt significa que ya respondió
    if (dataGuest.attendance.confirmedAt) {
      if (dataGuest.attendance.confirmed) {
        // Confirmó asistencia
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Asistencia Confirmada',
          bgColor: 'bg-emerald-100',
          textColor: 'text-emerald-900',
          iconColor: 'text-emerald-600',
          bgContainer: 'border-emerald-200 bg-emerald-50'
        };
      } else {
        // Declinó asistencia
        return {
          icon: <XCircle className="w-5 h-5" />,
          text: 'Asistencia Declinada',
          bgColor: 'bg-red-100',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          bgContainer: 'border-red-200 bg-red-50'
        };
      }
    } else {
      // No ha respondido aún
      return {
        icon: <Clock className="w-5 h-5" />,
        text: 'Esperando Confirmación',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-900',
        iconColor: 'text-amber-600',
        bgContainer: 'border-amber-200 bg-amber-50'
      };
    }
  };

  const statusConfig = getStatusConfig();
  const relationConfig = getRelationConfig();
  const attendanceConfig = getAttendanceConfig();
  const guestCount = dataGuest.attendance?.numberOfGuestsConfirmed || 
                    dataGuest.personalInvitation?.numberOfGuests || 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 p-4 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header con navegación */}
        <div className="mb-8">
          <Link 
            href="/invitados"
            className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a la lista</span>
          </Link>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-violet-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              
              {/* Nombre y estado */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
                  {dataGuest.name}
                </h1>
                
                {/* Badge de estado */}
                <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border-2 ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}>
                  <div className={statusConfig.iconColor}>
                    {statusConfig.icon}
                  </div>
                  <span className="font-semibold text-lg">
                    {statusConfig.text}
                  </span>
                </div>
              </div>

              {/* Contador de invitados */}
              {guestCount > 1 && (
                <div className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6" />
                    <div>
                      <p className="text-sm opacity-90">Total de invitados</p>
                      <p className="text-2xl font-bold">{guestCount}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Grid de información */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Información personal */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-violet-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <User className="w-6 h-6 text-violet-600" />
              Información Personal
            </h2>
            
            <div className="space-y-6">
              {/* Relación */}
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${relationConfig.bgColor}`}>
                  <div className={relationConfig.iconColor}>
                    {relationConfig.icon}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Relación</p>
                  <p className={`text-lg font-bold ${relationConfig.textColor}`}>
                    {relationConfig.text}
                  </p>
                </div>
              </div>

              {/* Teléfono */}
              {dataGuest.phone && (
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-100">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    <p className="text-lg font-bold text-blue-800">
                      {dataGuest.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Fecha de registro */}
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-gray-100">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Registrado</p>
                  <p className="text-lg font-bold text-gray-800">
                    {formatDate(dataGuest.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historia de invitación */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-violet-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Send className="w-6 h-6 text-violet-600" />
              Historia de Invitación
            </h2>
            
            <div className="space-y-6">
              {/* Invitación personal */}
              {dataGuest.personalInvitation && (
                <div className="border border-purple-200 rounded-2xl p-6 bg-purple-50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-purple-100">
                      <Send className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-purple-900">
                        {dataGuest.personalInvitation.sent ? 'Invitación Enviada' : 'Invitación Pendiente'}
                      </p>
                      {dataGuest.personalInvitation.sentAt && (
                        <p className="text-sm text-purple-700">
                          {formatDate(dataGuest.personalInvitation.sentAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {dataGuest.personalInvitation.message && (
                    <div className="bg-white/70 rounded-xl p-4 mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2">Mensaje:</p>
                      <p className="text-purple-800 italic">
                        &quot;{dataGuest.personalInvitation.message}&quot;
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-4">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-700">
                      Invitados: {dataGuest.personalInvitation.numberOfGuests}
                    </span>
                  </div>
                </div>
              )}

              {/* Confirmación de asistencia */}
              {dataGuest.attendance && (
                <div className={`border rounded-2xl p-6 ${attendanceConfig.bgContainer}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${attendanceConfig.bgColor}`}>
                      <div className={attendanceConfig.iconColor}>
                        {attendanceConfig.icon}
                      </div>
                    </div>
                    <div>
                      <p className={`font-bold ${attendanceConfig.textColor}`}>
                        {attendanceConfig.text}
                      </p>
                      {dataGuest.attendance.confirmedAt && (
                        <p className={`text-sm ${attendanceConfig.textColor} opacity-75`}>
                          {formatDate(dataGuest.attendance.confirmedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Mensaje de confirmación/declinación */}
                  {(dataGuest.attendance.message || dataGuest.attendance.comments) && (
                    <div className="bg-white/70 rounded-xl p-4 mt-4">
                      <p className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        {dataGuest.attendance.confirmed ? 'Mensaje de confirmación:' : 'Mensaje de declinación:'}
                      </p>
                      <p className={`italic ${attendanceConfig.textColor}`}>
                        &quot;{dataGuest.attendance.message || dataGuest.attendance.comments}&quot;
                      </p>
                    </div>
                  )}
                  
                  {/* Número de invitados confirmados/declinados */}
                  <div className="flex items-center gap-2 mt-4">
                    <Users className={`w-4 h-4 ${attendanceConfig.iconColor}`} />
                    <span className={`text-sm ${attendanceConfig.textColor} opacity-75`}>
                      {dataGuest.attendance.confirmed 
                        ? `Confirmados: ${dataGuest.attendance.numberOfGuestsConfirmed || 0}`
                        : `Declinados: ${dataGuest.attendance.numberOfGuestsConfirmed || 0}`
                      }
                    </span>
                  </div>
                  
                  {/* Fuente de la confirmación */}
                  <div className="mt-3">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      dataGuest.attendance.source === 'personal-invitation'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {dataGuest.attendance.source === 'personal-invitation' 
                        ? 'Vía invitación personal' 
                        : 'Confirmación directa'}
                    </span>
                  </div>
                  
                  {/* Información adicional para registros auto-creados */}
                  {dataGuest.autoCreated && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 flex items-center gap-2">
                        <span className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">🤖</span>
                        Registro creado automáticamente por el sistema
                      </p>
                      {dataGuest.searchedName && dataGuest.searchedName !== dataGuest.name && (
                        <p className="text-xs text-blue-700 mt-1">
                          Nombre buscado originalmente: &quot;{dataGuest.searchedName}&quot;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Notas del sistema (si existen) */}
          {dataGuest.notes && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-violet-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-violet-600" />
                Notas del Sistema
              </h2>
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-sm text-blue-800 leading-relaxed">
                  {dataGuest.notes}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones adicionales */}
        <div 
        //style={{display: 'none'}}
        className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-violet-200">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={`/qrcode/create/${dataGuest._id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <User className="w-5 h-5" />
              Generar QR de: {dataGuest.name}
            </Link>
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuestDetails