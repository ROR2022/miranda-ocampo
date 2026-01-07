'use client';

import React, { useState } from 'react';
import { Download, FileText, Image as ImageIcon, X, Eye, Loader2, AlertCircle } from 'lucide-react';
import { QRDownloadButtonProps, DownloadFormat, QRDownloadHook } from '@/types/qrDownload.types';
import { VIP_COLORS } from '@/utils/qrDownloadHelpers';
import Image from 'next/image';

interface QRDownloadButtonPropsWithHook extends Omit<QRDownloadButtonProps, 'eventData'> {
  qrDownload: QRDownloadHook;
}

const QRDownloadButton: React.FC<QRDownloadButtonPropsWithHook> = ({ 
  qrDownload,
  className = '',
  onDownloadStart,
  onDownloadComplete
}) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<DownloadFormat | null>(null);

  // Manejar inicio de descarga
  const handleDownload = async (format: DownloadFormat) => {
    try {
      onDownloadStart?.(format);
      setSelectedFormat(format);
      setShowOptions(false);

      switch (format) {
        case 'pdf':
          await qrDownload.downloadAsPDF();
          break;
        case 'png':
          await qrDownload.downloadAsPNG();
          break;
        case 'jpg':
          await qrDownload.downloadAsJPG();
          break;
      }

      onDownloadComplete?.(format, true);
    } catch (error) {
      console.error('Error en descarga:', error);
      onDownloadComplete?.(format, false);
    }
  };

  // Manejar preview
  const handlePreview = async (format: DownloadFormat) => {
    try {
      setSelectedFormat(format);
      await qrDownload.generatePreview(format);
      setShowPreview(true);
      setShowOptions(false);
    } catch (error) {
      console.error('Error generando preview:', error);
    }
  };

  // Obtener icono por formato
  const getFormatIcon = (format: DownloadFormat) => {
    switch (format) {
      case 'pdf':
        return <FileText className="w-4 h-4" />;
      case 'png':
      case 'jpg':
        return <ImageIcon className="w-4 h-4" />;
    }
  };

  // Obtener color por formato
  const getFormatColor = (format: DownloadFormat) => {
    switch (format) {
      case 'pdf':
        return VIP_COLORS.rosaAurora;
      case 'png':
        return VIP_COLORS.lavandaAurora;
      case 'jpg':
        return VIP_COLORS.oroAurora;
    }
  };

  // Opciones de formato
  const formatOptions = [
    {
      format: 'pdf' as DownloadFormat,
      label: 'PDF',
      description: 'Ideal para impresión',
      size: '~500KB'
    },
    {
      format: 'png' as DownloadFormat,
      label: 'PNG',
      description: 'Con transparencia',
      size: '~300KB'
    },
    {
      format: 'jpg' as DownloadFormat,
      label: 'JPG',
      description: 'Para redes sociales',
      size: '~200KB'
    }
  ];

  return (
    <>
      {/* Botón principal */}
      <div className={`relative ${className}`}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          disabled={qrDownload.isGenerating}
          className="group relative px-6 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(45deg, ${VIP_COLORS.lavandaAurora} 0%, ${VIP_COLORS.oroAurora} 50%, ${VIP_COLORS.rosaAurora} 100%)`,
            boxShadow: `0 8px 20px rgba(156, 39, 176, 0.4)`
          }}
        >
          {/* Efecto shimmer */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              animation: qrDownload.isGenerating ? 'shimmer 2s infinite' : 'none'
            }}
          />

          <span className="relative z-10 flex items-center gap-2">
            {qrDownload.isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            {qrDownload.isGenerating ? 'Generando...' : 'Descargar QR'}
          </span>

          {/* Indicador de progreso */}
          {qrDownload.isGenerating && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-white bg-opacity-60 transition-all duration-300"
              style={{ width: `${qrDownload.downloadProgress}%` }}
            />
          )}
        </button>

        {/* Opciones de formato */}
        {showOptions && !qrDownload.isGenerating && (
          <div
            className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border overflow-hidden z-50"
            style={{ borderColor: VIP_COLORS.cremaSuave }}
          >
            <div
              className="p-4 text-center border-b"
              style={{
                background: `linear-gradient(45deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.rosaDelicada} 100%)`,
                borderColor: VIP_COLORS.cremaSuave
              }}
            >
              <h4 className="font-semibold" style={{ color: VIP_COLORS.lavandaIntensa }}>
                Selecciona el formato
              </h4>
            </div>

            <div className="p-2">
              {formatOptions.map((option) => (
                <div key={option.format} className="mb-2 last:mb-0">
                  <div className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    {/* Info del formato */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: getFormatColor(option.format) + '20' }}
                    >
                      <div style={{ color: getFormatColor(option.format) }}>
                        {getFormatIcon(option.format)}
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold" style={{ color: VIP_COLORS.lavandaIntensa }}>
                          {option.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {option.size}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {option.description}
                      </p>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePreview(option.format)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Vista previa"
                      >
                        <Eye className="w-4 h-4" style={{ color: VIP_COLORS.lavandaAurora }} />
                      </button>
                      <button
                        onClick={() => handleDownload(option.format)}
                        className="px-3 py-2 rounded-lg text-white font-medium hover:scale-105 transition-transform"
                        style={{ backgroundColor: getFormatColor(option.format) }}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Botón cerrar */}
            <button
              onClick={() => setShowOptions(false)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" style={{ color: VIP_COLORS.lavandaIntensa }} />
            </button>
          </div>
        )}

        {/* Mensaje de error */}
        {qrDownload.error && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              {qrDownload.error}
            </p>
            <button
              onClick={qrDownload.clearError}
              className="text-xs text-red-500 hover:text-red-700 mt-2"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Modal de Preview */}
      {showPreview && qrDownload.previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header del modal */}
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{
                background: `linear-gradient(45deg, ${VIP_COLORS.cremaSuave} 0%, ${VIP_COLORS.rosaDelicada} 100%)`,
                borderColor: VIP_COLORS.cremaSuave
              }}
            >
              <h3 className="font-semibold" style={{ color: VIP_COLORS.lavandaIntensa }}>
                Vista Previa - {selectedFormat?.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="p-1 rounded-full hover:bg-white hover:bg-opacity-50"
              >
                <X className="w-5 h-5" style={{ color: VIP_COLORS.lavandaIntensa }} />
              </button>
            </div>

            {/* Preview de la imagen */}
            <div className="p-4">
              <div className="aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4">
                <Image
                  src={qrDownload.previewUrl}
                  fill
                  width={300}
                  height={400}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Botones de acción del preview */}
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ borderColor: VIP_COLORS.cremaSuave }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    if (selectedFormat) handleDownload(selectedFormat);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:scale-105 transition-transform"
                  style={{ backgroundColor: getFormatColor(selectedFormat!) }}
                >
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animación shimmer */}
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </>
  );
};

export default QRDownloadButton;
