// 📱 Página del escáner ReadQR - Aurora VIP Design
'use client';

import React from 'react';
import { ReadQR } from '@/components/sections/QRCode';
import type { QRScanResult } from '@/components/sections/QRCode/ReadQR.types';

export default function ReadQRPage() {
  const handleResult = (result: QRScanResult) => {
    console.log('🎯 QR Result:', result);
  };

  const handleError = (error: string) => {
    console.error('❌ QR Error:', error);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fef7f7 0%, #ffffff 100%)',
      padding: '0'
    }}>
      <ReadQR
        autoStart={true}
        onResult={handleResult}
        onError={handleError}
        showHelp={true}
      />
    </div>
  );
}