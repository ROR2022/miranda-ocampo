'use client';

import React, { useRef, useEffect } from 'react';
import QRDownloadCard from './QRDownloadCard.simple';
import QRDownloadButton from './QRDownloadButton';
import { QREventData, DownloadFormat } from '@/types/qrDownload.types';
import { useQRDownload } from '@/hooks/useQRDownload';

interface QRDownloadContainerProps {
  eventData: QREventData;
  className?: string;
  onDownloadStart?: (format: DownloadFormat) => void;
  onDownloadComplete?: (format: DownloadFormat, success: boolean) => void;
}

const QRDownloadContainer: React.FC<QRDownloadContainerProps> = ({
  eventData,
  className = '',
  onDownloadStart,
  onDownloadComplete
}) => {
  const downloadCardRef = useRef<HTMLDivElement>(null);
  const qrDownload = useQRDownload(eventData);

  // Conectar el ref del componente de descarga con el hook
  useEffect(() => {
    if (downloadCardRef.current) {
      qrDownload.attachDownloadRef(downloadCardRef.current);
    }
  }, [qrDownload]);

  return (
    <div className={`qr-download-container ${className}`}>
      {/* Componente visible - Botón de descarga */}
      <QRDownloadButton
        qrDownload={qrDownload}
        onDownloadStart={onDownloadStart}
        onDownloadComplete={onDownloadComplete}
      />

      {/* Componente oculto - Card para descarga (renderizado off-screen) */}
      <QRDownloadCard
        ref={downloadCardRef}
        eventData={eventData}
        format="pdf" // Formato por defecto, se ajusta dinámicamente
      />
    </div>
  );
};

export default QRDownloadContainer;
