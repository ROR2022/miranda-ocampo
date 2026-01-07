'use client';

import React, { useRef, useCallback, useEffect } from 'react';
import { useQRScanner } from './useQRScanner';
import { CONTENT_TYPE_CONFIG, QRScanResult } from './ReadQR.types';
import styles from './ReadQR.module.css';

interface ReadQRProps {
  className?: string;
  autoStart?: boolean;
  onResult?: (result: QRScanResult) => void;
  onError?: (error: string) => void;
  showHelp?: boolean;
}

export default function ReadQR({ 
  className = '',
  autoStart = true,
  onResult,
  onError,
  showHelp = true
}: ReadQRProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🎯 Hook principal del scanner
  const {
    mode,
    isScanning,
    hasPermission,
    error,
    result,
    isLoading,
    hasCamera,
    videoRef,
    initializeCamera,
    resumeScanning,
    processImageFile,
    changeMode,
    executeAction,
    clearResult,
    resetScanner,
    isSupported,
    canScanFiles
  } = useQRScanner({
    autoStart,
    onResult,
    onError
  });

  // 🔍 Debug: Monitorear cambios de estado
  useEffect(() => {
    console.log('🔍 [ReadQR] Estado cambió:', {
      mode,
      isLoading,
      isScanning,
      hasPermission,
      hasCamera,
      error: !!error,
      result: !!result,
      videoElement: !!videoRef.current
    });
  }, [mode, isLoading, isScanning, hasPermission, hasCamera, error, result, videoRef]);

  // 📁 Manejar selección de archivo
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);

  // 🎯 Manejar drag & drop
  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImageFile(file);
    }
  }, [processImageFile]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  // 🎨 Obtener icono por tipo de contenido
  const getContentIcon = (contentType: string) => {
    const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.text;
    return config.icon;
  };

  // 🎨 Obtener label por tipo de contenido
  const getContentLabel = (contentType: string) => {
    const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.text;
    return config.label;
  };

  // 🎨 Obtener acciones por tipo de contenido
  const getContentActions = (contentType: string) => {
    const config = CONTENT_TYPE_CONFIG[contentType as keyof typeof CONTENT_TYPE_CONFIG] || CONTENT_TYPE_CONFIG.text;
    return config.actions;
  };

  return (
    <div className={`${styles.readQRContainer} ${className}`}>
      {/* 🎯 Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Escáner QR</h1>
        <p className={styles.subtitle}>
          Escanea códigos QR con tu cámara o sube una imagen
        </p>
      </div>

      {/* 🔄 Selector de Modo */}
      <div className={styles.modeSelector}>
        <button
          className={`${styles.modeButton} ${mode === 'camera' ? styles.active : ''}`}
          onClick={() => changeMode('camera')}
          disabled={!isSupported || !hasCamera}
        >
          📷 Cámara
        </button>
        <button
          className={`${styles.modeButton} ${mode === 'file' ? styles.active : ''}`}
          onClick={() => changeMode('file')}
          disabled={!canScanFiles}
        >
          📁 Subir Imagen
        </button>
      </div>

      {/* ❌ Mensajes de Error */}
      {error && (
        <div className={styles.errorMessage}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
          <button onClick={resetScanner} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>
            🔄 Reintentar
          </button>
        </div>
      )}

      {/* 📷 Sección de Cámara */}
      {mode === 'camera' && (
        <div className={styles.cameraSection}>
          {/* Video siempre disponible */}
          <video
            ref={videoRef}
            className={styles.video}
            autoPlay
            muted
            playsInline
            style={{ 
              display: 'block', // Siempre visible para debugging
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              borderRadius: '10px',
              objectFit: 'cover',
              backgroundColor: 'black'
            }}
          />
          
          {/* Debug info */}
          <div style={{ 
            position: 'absolute', 
            top: 10, 
            left: 10, 
            background: 'rgba(0,0,0,0.7)', 
            color: 'white', 
            padding: '5px',
            fontSize: '12px',
            borderRadius: '5px',
            zIndex: 10
          }}>
            Estado: {isScanning ? '🔄 Escaneando' : '⏸️ Pausado'} | 
            Carga: {isLoading ? '⏳' : '✅'} | 
            Error: {error ? '❌' : '✅'}
          </div>
          
          {isScanning && (
            <div className={styles.scanRegion}>
              <div className={styles.scanLine}></div>
            </div>
          )}
          
          {!isScanning && (
            <div className={styles.cameraPlaceholder}>
              <div className={styles.cameraIcon}>📷</div>
              <div className={styles.cameraStatus}>
                {isLoading ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Iniciando cámara...
                  </>
                ) : hasPermission ? (
                  'Cámara lista'
                ) : (
                  'Cámara no disponible'
                )}
              </div>
              <div className={styles.cameraSubtext}>
                {!hasCamera && 'No se detectó ninguna cámara en este dispositivo'}
                {hasCamera && !hasPermission && 'Permite el acceso a la cámara para continuar'}
                {hasCamera && hasPermission && !isScanning && 'Toca para comenzar a escanear'}
              </div>
              {hasCamera && !isScanning && !isLoading && (
                <button
                  onClick={hasPermission ? resumeScanning : initializeCamera}
                  className={styles.uploadButton}
                >
                  {hasPermission ? '▶️ Reanudar' : '🚀 Iniciar Cámara'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 📁 Sección de Subida de Archivos */}
      {mode === 'file' && (
        <div
          className={styles.uploadSection}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>📎</div>
            <div className={styles.uploadText}>
              Arrastra una imagen aquí o haz clic para seleccionar
            </div>
            <div className={styles.uploadSubtext}>
              Formatos soportados: JPG, PNG, GIF, WEBP
            </div>
            <button className={styles.uploadButton}>
              📁 Seleccionar Imagen
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.fileInput}
          />
        </div>
      )}

      {/* 🔄 Indicador de Procesamiento */}
      {isLoading && (
        <div className={styles.processing}>
          <div className={styles.processingSpinner}></div>
          Procesando...
        </div>
      )}

      {/* 📊 Sección de Resultados */}
      <div className={styles.resultSection}>
        {result ? (
          <div className={styles.resultContainer}>
            <div className={styles.resultHeader}>
              <span className={styles.resultIcon}>
                {getContentIcon(result.contentType)}
              </span>
              <span className={styles.resultType}>
                {getContentLabel(result.contentType)}
              </span>
              {result.isValid && <span style={{ color: '#10b981', marginLeft: 'auto' }}>✅</span>}
            </div>
            
            <div className={styles.resultContent}>
              {result.data}
            </div>

            {result.actions && result.actions.length > 0 && (
              <div className={styles.resultActions}>
                {result.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`${styles.actionButton} ${index === 0 ? styles.primary : styles.secondary}`}
                    onClick={() => executeAction(action, result.data)}
                    disabled={isLoading}
                  >
                    {index === 0 && getContentActions(result.contentType)[0]?.icon} 
                    {getContentActions(result.contentType)[index]?.label || action}
                  </button>
                ))}
                
                {/* Acción de copiar siempre disponible */}
                <button
                  className={`${styles.actionButton} ${styles.secondary}`}
                  onClick={() => executeAction('copy', result.data)}
                  disabled={isLoading}
                >
                  📋 Copiar
                </button>
              </div>
            )}

            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={clearResult}
                className={`${styles.actionButton} ${styles.secondary}`}
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
              >
                🗑️ Limpiar
              </button>
              
              {mode === 'camera' && !isScanning && (
                <button
                  onClick={resumeScanning}
                  className={`${styles.actionButton} ${styles.primary}`}
                  style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                >
                  🔄 Escanear Otro
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.noResult}>
            <div className={styles.noResultIcon}>🔍</div>
            <div className={styles.noResultText}>
              {mode === 'camera' 
                ? 'Apunta tu cámara hacia un código QR para escanearlo'
                : 'Sube una imagen que contenga un código QR'
              }
            </div>
          </div>
        )}
      </div>

      {/* 💡 Sección de Ayuda */}
      {showHelp && (
        <div className={styles.helpSection}>
          <div className={styles.helpTitle}>
            💡 Consejos para un mejor escaneo
          </div>
          <ul className={styles.helpList}>
            <li className={styles.helpItem}>
              <span className={styles.helpIcon}>📷</span>
              Mantén la cámara estable y el código QR bien iluminado
            </li>
            <li className={styles.helpItem}>
              <span className={styles.helpIcon}>🎯</span>
              Centra el código QR dentro del área de escaneo
            </li>
            <li className={styles.helpItem}>
              <span className={styles.helpIcon}>📏</span>
              Ajusta la distancia hasta que el código se vea claro
            </li>
            <li className={styles.helpItem}>
              <span className={styles.helpIcon}>🖼️</span>
              Para imágenes, usa archivos de alta calidad sin borrón
            </li>
            <li className={styles.helpItem}>
              <span className={styles.helpIcon}>🔒</span>
              Tu cámara y datos se procesan localmente por seguridad
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}