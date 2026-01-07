"use client"
import React from 'react';
import { AlertTriangle, ArrowLeft, RefreshCw, UserX, Wifi, Server } from 'lucide-react';
import Link from 'next/link';

// Componente para mostrar diferentes tipos de errores
interface ErrorDisplayProps {
  type: 'not-found' | 'network' | 'server' | 'invalid-id' | 'unknown';
  message?: string;
  guestId?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ type, message, guestId }) => {
  const getErrorConfig = () => {
    switch (type) {
      case 'not-found':
        return {
          icon: <UserX className="w-16 h-16" />,
          title: 'Invitado no encontrado',
          description: 'El invitado que buscas no existe o ha sido eliminado.',
          bgColor: 'bg-amber-100',
          iconColor: 'text-amber-600',
          titleColor: 'text-amber-900',
          buttonColor: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
        };
      case 'network':
        return {
          icon: <Wifi className="w-16 h-16" />,
          title: 'Error de conexión',
          description: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          buttonColor: 'from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
        };
      case 'server':
        return {
          icon: <Server className="w-16 h-16" />,
          title: 'Error del servidor',
          description: 'Hubo un problema en el servidor. Intenta nuevamente en unos momentos.',
          bgColor: 'bg-purple-100',
          iconColor: 'text-purple-600',
          titleColor: 'text-purple-900',
          buttonColor: 'from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
        };
      case 'invalid-id':
        return {
          icon: <AlertTriangle className="w-16 h-16" />,
          title: 'ID inválido',
          description: 'El identificador del invitado no es válido.',
          bgColor: 'bg-orange-100',
          iconColor: 'text-orange-600',
          titleColor: 'text-orange-900',
          buttonColor: 'from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700'
        };
      default:
        return {
          icon: <AlertTriangle className="w-16 h-16" />,
          title: 'Error inesperado',
          description: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
          bgColor: 'bg-gray-100',
          iconColor: 'text-gray-600',
          titleColor: 'text-gray-900',
          buttonColor: 'from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700'
        };
    }
  };

  const config = getErrorConfig();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        
        {/* Botón de navegación */}
        <div className="mb-8">
          <Link 
            href="/invitados"
            className="inline-flex items-center gap-2 text-violet-700 hover:text-violet-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Volver a la lista</span>
          </Link>
        </div>

        {/* Card de error */}
        <div className={`${config.bgColor} backdrop-blur-sm rounded-3xl p-8 shadow-xl border-2 border-white/50 text-center`}>
          
          {/* Icono */}
          <div className="mb-6 flex justify-center">
            <div className={`${config.iconColor} opacity-80`}>
              {config.icon}
            </div>
          </div>

          {/* Título */}
          <h1 className={`text-2xl font-bold ${config.titleColor} mb-4`}>
            {config.title}
          </h1>

          {/* Descripción */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {config.description}
          </p>

          {/* Mensaje técnico (si existe) */}
          {message && (
            <div className="bg-white/70 rounded-xl p-4 mb-6 border border-gray-200">
              <p className="text-sm font-medium text-gray-600 mb-2">Detalles técnicos:</p>
              <p className="text-sm text-gray-800 font-mono break-all">
                {message}
              </p>
            </div>
          )}

          {/* ID del invitado (si existe) */}
          {guestId && (
            <div className="bg-white/50 rounded-xl p-3 mb-6">
              <p className="text-xs text-gray-600">ID del invitado:</p>
              <p className="text-sm font-mono text-gray-800">{guestId}</p>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r ${config.buttonColor} text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex-1`}
            >
              <RefreshCw className="w-5 h-5" />
              Intentar nuevamente
            </button>
            
            <Link
              href="/invitados"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/80 text-gray-700 rounded-xl font-semibold border-2 border-gray-200 hover:bg-white hover:border-gray-300 transition-all duration-300 flex-1"
            >
              <ArrowLeft className="w-5 h-5" />
              Ir a lista
            </Link>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Si el problema persiste, contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
