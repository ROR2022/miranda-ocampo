'use client';

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { QRDownloadCardProps } from '@/types/qrDownload.types';
import { createDesignStyles, createHeaderDecorations, createQRFrameDecorations, createFooterTextStyles } from '@/utils/qrDesignTemplates';
import { formatDisplayDate } from '@/utils/qrDownloadHelpers';
import { useQRGeneration } from '@/hooks/useQRGeneration';

// Componente optimizado para descarga - renderizado off-screen
const QRDownloadCard = forwardRef<HTMLDivElement, QRDownloadCardProps>(
  ({ eventData, format, className = '', style = {} }, ref) => {
    const { qrDataURL, generateQR } = useQRGeneration(eventData);
    const styles = createDesignStyles(format);
    const headerDecorations = createHeaderDecorations();
    const qrFrameDecorations = createQRFrameDecorations();
    const footerTextStyles = createFooterTextStyles();

    // Generar QR automáticamente al montar
    React.useEffect(() => {
      if (!qrDataURL) {
        generateQR({
          size: 300,
          margin: 1,
          errorCorrectionLevel: 'M'
        });
      }
    }, [qrDataURL, generateQR]);

    return (
      <div
        ref={ref}
        data-download-card
        className={`qr-download-card ${className}`}
        style={{
          width: '800px',
          height: '1000px',
          fontFamily: 'Arial, sans-serif',
          position: 'fixed',
          top: '-2000px', // Oculto fuera del viewport pero capturable
          left: '0',
          zIndex: -1000,
          opacity: 1, // Visible para html2canvas
          pointerEvents: 'none',
          background: '#FFFFFF',
          boxSizing: 'border-box',
          ...style
        }}
      >
        {/* Header Section */}
        <div style={styles.header}>
          {/* Decoraciones del header */}
          {headerDecorations.map((decoration) => (
            <div
              key={decoration.id}
              style={decoration.style}
            >
              {decoration.content}
            </div>
          ))}

          {/* Título principal */}
          <div style={{ textAlign: 'center', zIndex: 10 }}>
            <h3 style={styles.subtitle}>
              {eventData.title}
            </h3>
            <h1 style={styles.nameTitle}>
              {eventData.name}
            </h1>
          </div>
        </div>

        {/* Main QR Section */}
        <div style={styles.main}>
          {/* Marco del QR con decoraciones */}
          <div style={styles.qrFrame}>
            {/* Decoraciones de las esquinas */}
            {qrFrameDecorations.map((decoration) => (
              <div
                key={decoration.id}
                style={decoration.style}
              />
            ))}

            {/* QR Code */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              {qrDataURL ? (
                <Image
                  src={qrDataURL}
                  alt="Código QR"
                  height={300}
                  fill
                />
              ) : (
                <div
                  style={{
                    width: '300px',
                    height: '300px',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#666'
                  }}
                >
                  Generando QR...
                </div>
              )}
            </div>

            {/* Descripción del QR */}
            <p style={styles.description}>
              Escanea para acceder a mi galería
            </p>
          </div>
        </div>

        {/* Footer Section */}
        <div style={styles.footer}>
          {/* Foto del evento */}
          <div style={{ marginBottom: '20px' }}>
            <div
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '4px solid #E91E63',
                overflow: 'hidden',
                margin: '0 auto',
                boxShadow: '0 8px 20px rgba(233, 30, 99, 0.3)',
                background: '#f0f0f0'
              }}
            >
              {eventData.photoUrl && (
                <Image
                  src={eventData.photoUrl}
                  alt={eventData.name}
                  height={150}
                  fill
                />
              )}
            </div>
          </div>

          {/* Información del evento */}
          <div style={{ textAlign: 'center' }}>
            {/* Fecha */}
            <div style={footerTextStyles.dateText}>
              {formatDisplayDate(eventData.date)}
            </div>

            {/* Venue (si existe) */}
            {eventData.venue && (
              <div style={footerTextStyles.venueText}>
                {eventData.venue}
              </div>
            )}

            {/* URL del sitio web */}
            <div style={footerTextStyles.websiteText}>
              {eventData.websiteUrl.replace(/https?:\/\//, '')}
            </div>

            {/* Mensaje personalizado */}
            <div style={footerTextStyles.messageText}>
              &quot;{eventData.message}&quot;
            </div>
          </div>

          {/* Decoración final */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '15px',
              fontSize: '20px'
            }}
          >
            <span>💖</span>
            <span>✨</span>
            <span>🎊</span>
            <span>✨</span>
            <span>💖</span>
          </div>
        </div>
      </div>
    );
  }
);

QRDownloadCard.displayName = 'QRDownloadCard';

export default QRDownloadCard;
