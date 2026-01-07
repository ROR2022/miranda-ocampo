// 🧪 Página de prueba para el componente ReadQR
'use client';

import React from 'react';
import { ReadQR } from '@/components/sections/QRCode';
import type { QRScanResult } from '@/components/sections/QRCode/ReadQR.types';

export default function ReadQRTestPage() {
  const handleResult = (result: QRScanResult) => {
    console.log('QR Result:', result);
  };

  const handleError = (error: string) => {
    console.error('QR Error:', error);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem',
      background: 'linear-gradient(135deg, #fef7f7 0%, #ffffff 100%)'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem'
        }}>
          🎯 Test ReadQR Component
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: '#6b7280',
          marginBottom: '3rem'
        }}>
          Prueba el componente de escaneo de códigos QR
        </p>
      </div>

      <ReadQR
        autoStart={true}
        onResult={handleResult}
        onError={handleError}
        showHelp={true}
      />
    </div>
  );
}
