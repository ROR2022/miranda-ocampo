"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useQRGeneration } from '@/hooks/useQRGeneration';
import { 
  validateURL, 
  normalizeURL, 
  getURLType, 
  getURLSuggestions, 
  validateHexColor, 
  generateQRFileName 
} from '@/utils/qrValidation';
import { 
  downloadQRAsPNG, 
  downloadQRAsJPG, 
  isDownloadSupported, 
  createDownloadMessage, 
  handleDownloadError 
} from '@/utils/qrDownloadUtils';
import {
  CreateQRState,
  QROptions,
  DEFAULT_QR_OPTIONS,
  SIZE_OPTIONS,
  COLOR_PRESETS,
  ERROR_CORRECTION_OPTIONS
} from './CreateQR.types';
import styles from './CreateQR.module.css';

interface CreateQRProps {
  urlLink: string;
  name?: string; // Nombre del invitado (opcional)
}

//https://quince-premium-frida.vercel.app/invitados/68b22163c8fce5afcf5fd7ce
//https://quince-premium-frida.vercel.app/invitados/68b22163c8fce5afcf5fd7ce

// 🎯 Componente CreateQR - Generador de códigos QR personalizados
const CreateQR: React.FC<CreateQRProps> = ({urlLink, name}) => {
  console.log('🚀 [CreateQR] Componente inicializado con props:', {
    urlLink: urlLink,
    urlLinkType: typeof urlLink,
    urlLinkLength: urlLink?.length,
    isEmpty: !urlLink,
    isValidInitialUrl: urlLink ? validateURL(urlLink) : false
  });

  // 📊 Estado principal del componente
  const [state, setState] = useState<CreateQRState>(() => {
    const initialState = {
      url: urlLink,
      name: name,
      isValidUrl: false,
      qrOptions: DEFAULT_QR_OPTIONS,
      isGenerating: false,
      error: null
    };

    console.log('📊 [CreateQR] Estado inicial configurado:', initialState);
    
    // Validar URL inicial si existe
    if (urlLink) {
      const normalizedUrl = normalizeURL(urlLink);
      const isValid = validateURL(normalizedUrl);
      console.log('🔍 [CreateQR] Validación URL inicial:', {
        original: urlLink,
        normalized: normalizedUrl,
        isValid: isValid,
        urlType: getURLType(normalizedUrl)
      });
      
      initialState.url = normalizedUrl;
      initialState.isValidUrl = isValid;
    }

    return initialState;
  });

  // 🔧 Hook de generación QR con eventData dummy
  const dummyEventData = useMemo(() => ({
    qrCodeUrl: state.url || 'https://ejemplo.com',
    name: 'QR Personalizado',
    title: 'Código QR',
    date: new Date().toLocaleDateString(),
    message: 'Generado con CreateQR',
    photoUrl: '/placeholder.jpg', // Imagen placeholder
    websiteUrl: state.url || 'https://ejemplo.com' // URL del sitio web
  }), [state.url]);

  const { generateCustomQR, qrDataURL, isGenerating, error: qrError } = useQRGeneration(dummyEventData);

  // 📱 Estados adicionales para UI
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [activeColorPreset, setActiveColorPreset] = useState<number>(0);
  const [tempDarkColor, setTempDarkColor] = useState<string>(state.qrOptions.darkColor);
  const [tempLightColor, setTempLightColor] = useState<string>(state.qrOptions.lightColor);
  const [darkColorError, setDarkColorError] = useState<boolean>(false);
  const [lightColorError, setLightColorError] = useState<boolean>(false);

  // 🔄 Función para actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<CreateQRState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // 🔍 Validación de URL en tiempo real
  const handleURLChange = useCallback((newUrl: string) => {
    console.log('🔍 [URL Change] Iniciando validación:', {
      originalUrl: newUrl,
      trimmedUrl: newUrl.trim(),
      urlLength: newUrl.length,
      isEmpty: newUrl.trim().length === 0
    });

    // Verificar si está vacía
    if (!newUrl.trim()) {
      console.log('❌ [URL Change] URL vacía detectada');
      updateState({
        url: newUrl,
        isValidUrl: false,
        error: null
      });
      return;
    }

    // Normalizar URL antes de validar
    const normalizedUrl = normalizeURL(newUrl);
    console.log('🔄 [URL Change] URL normalizada:', {
      original: newUrl,
      normalized: normalizedUrl,
      wasChanged: newUrl !== normalizedUrl
    });

    // Realizar validación
    const isValid = validateURL(normalizedUrl);
    console.log('✅ [URL Change] Resultado de validación:', {
      url: normalizedUrl,
      isValid: isValid,
      urlType: getURLType(normalizedUrl)
    });

    // Si es inválida, mostrar detalles de por qué
    if (!isValid) {
      console.log('❌ [URL Change] URL inválida - Análisis detallado:', {
        url: normalizedUrl,
        hasProtocol: /^(https?|mailto|tel|sms|whatsapp|telegram):/i.test(normalizedUrl),
        matchesWebRegex: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_\.~+=-]*)?(#[-a-z\d_]*)?$/i.test(normalizedUrl),
        matchesSpecialProtocol: /^(mailto:|tel:|sms:|whatsapp:|telegram:)/i.test(normalizedUrl),
        isEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedUrl),
        isPhone: /^[\+]?[1-9][\d\s\-\(\)]{7,}$/.test(normalizedUrl),
        containsDot: normalizedUrl.includes('.'),
        length: normalizedUrl.length
      });
    }

    updateState({
      url: normalizedUrl,
      isValidUrl: isValid,
      error: null
    });
  }, [updateState]);

  // ✅ Validación manual de URL
  const handleValidateURL = useCallback(() => {
    console.log('🎯 [Manual Validation] Iniciando validación manual:', {
      currentUrl: state.url,
      trimmedUrl: state.url.trim(),
      isEmpty: !state.url.trim()
    });

    if (!state.url.trim()) {
      console.log('❌ [Manual Validation] Error: URL vacía');
      updateState({ error: 'Por favor ingresa una URL' });
      return;
    }

    console.log('🔄 [Manual Validation] Normalizando URL...');
    const normalizedUrl = normalizeURL(state.url);
    console.log('🔄 [Manual Validation] Resultado de normalización:', {
      original: state.url,
      normalized: normalizedUrl,
      changed: state.url !== normalizedUrl
    });

    console.log('🔍 [Manual Validation] Realizando validación completa...');
    const isValid = validateURL(normalizedUrl);
    
    console.log('📊 [Manual Validation] Análisis completo:', {
      url: normalizedUrl,
      isValid: isValid,
      urlType: getURLType(normalizedUrl),
      validations: {
        hasProtocol: /^(https?|mailto|tel|sms|whatsapp|telegram):/i.test(normalizedUrl),
        webRegexMatch: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_\.~+=-]*)?(#[-a-z\d_]*)?$/i.test(normalizedUrl),
        specialProtocolMatch: /^(mailto:|tel:|sms:|whatsapp:|telegram:)/i.test(normalizedUrl),
        emailFormat: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedUrl),
        phoneFormat: /^[\+]?[1-9][\d\s\-\(\)]{7,}$/.test(normalizedUrl)
      },
      structure: {
        containsDot: normalizedUrl.includes('.'),
        containsAtSymbol: normalizedUrl.includes('@'),
        containsColon: normalizedUrl.includes(':'),
        length: normalizedUrl.length,
        startsWithHttp: normalizedUrl.toLowerCase().startsWith('http'),
        startsWithMailto: normalizedUrl.toLowerCase().startsWith('mailto:'),
        startsWithTel: normalizedUrl.toLowerCase().startsWith('tel:')
      }
    });

    if (isValid) {
      console.log('✅ [Manual Validation] URL válida confirmada');
    } else {
      console.log('❌ [Manual Validation] URL inválida - Razones posibles:', {
        noProtocol: !/^(https?|mailto|tel|sms|whatsapp|telegram):/i.test(normalizedUrl),
        invalidWebFormat: !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_\.~+=-]*)?(#[-a-z\d_]*)?$/i.test(normalizedUrl) && !/^(mailto:|tel:|sms:|whatsapp:|telegram:)/i.test(normalizedUrl),
        missingDomain: !normalizedUrl.includes('.') && !/^(mailto:|tel:|sms:|whatsapp:|telegram:)/i.test(normalizedUrl),
        tooShort: normalizedUrl.length < 5,
        invalidCharacters: /[<>"\s]/.test(normalizedUrl)
      });
    }

    updateState({
      url: normalizedUrl,
      isValidUrl: isValid,
      error: isValid ? null : 'URL no válida. Verifica el formato.'
    });
  }, [state.url, updateState]);

  // 🎨 Actualización de opciones del QR
  const updateQROptions = useCallback((newOptions: Partial<QROptions>) => {
    updateState({
      qrOptions: { ...state.qrOptions, ...newOptions }
    });
  }, [state.qrOptions, updateState]);

  // 🌈 Aplicar preset de color
  const applyColorPreset = useCallback((presetIndex: number) => {
    const preset = COLOR_PRESETS[presetIndex];
    if (preset) {
      updateQROptions({
        darkColor: preset.darkColor,
        lightColor: preset.lightColor
      });
      setTempDarkColor(preset.darkColor);
      setTempLightColor(preset.lightColor);
      setDarkColorError(false);
      setLightColorError(false);
      setActiveColorPreset(presetIndex);
    }
  }, [updateQROptions]);

  // 🎨 Manejar cambio de color oscuro (input text)
  const handleDarkColorChange = useCallback((value: string) => {
    setTempDarkColor(value);
    setDarkColorError(false);
  }, []);

  // 🎨 Validar y aplicar color oscuro
  const handleDarkColorBlur = useCallback(() => {
    if (validateHexColor(tempDarkColor)) {
      updateQROptions({ darkColor: tempDarkColor });
      setDarkColorError(false);
    } else {
      setDarkColorError(true);
      // Revertir al valor válido anterior
      setTempDarkColor(state.qrOptions.darkColor);
    }
  }, [tempDarkColor, state.qrOptions.darkColor, updateQROptions]);

  // 🎨 Manejar cambio de color claro (input text)
  const handleLightColorChange = useCallback((value: string) => {
    setTempLightColor(value);
    setLightColorError(false);
  }, []);

  // 🎨 Validar y aplicar color claro
  const handleLightColorBlur = useCallback(() => {
    if (validateHexColor(tempLightColor)) {
      updateQROptions({ lightColor: tempLightColor });
      setLightColorError(false);
    } else {
      setLightColorError(true);
      // Revertir al valor válido anterior
      setTempLightColor(state.qrOptions.lightColor);
    }
  }, [tempLightColor, state.qrOptions.lightColor, updateQROptions]);

  // 🖼️ Manejar carga de imagen de logo
  const handleLogoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      updateState({ error: 'Por favor selecciona una imagen válida' });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      updateState({ error: 'La imagen es demasiado grande (máximo 5MB)' });
      return;
    }

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      updateQROptions({ logoUrl: result });
      
      // Recomendar corrección de errores alta cuando hay logo
      if (state.qrOptions.errorCorrectionLevel === 'L' || state.qrOptions.errorCorrectionLevel === 'M') {
        console.warn('⚠️ [Logo] Se recomienda usar corrección de errores "Alta (Q)" o "Máxima (H)" con logo');
        updateQROptions({ 
          logoUrl: result,
          errorCorrectionLevel: 'H' // Cambiar automáticamente a máxima
        });
      }
    };
    reader.onerror = () => {
      updateState({ error: 'Error al cargar la imagen' });
    };
    reader.readAsDataURL(file);
  }, [updateQROptions, updateState, state.qrOptions.errorCorrectionLevel]);

  // 🗑️ Remover logo
  const handleRemoveLogo = useCallback(() => {
    updateQROptions({ logoUrl: null });
  }, [updateQROptions]);
  // 🎯 Generación automática de QR al cambiar opciones
  useEffect(() => {
    console.log('🎯 [QR Generation] useEffect triggered:', {
      isValidUrl: state.isValidUrl,
      url: state.url,
      qrOptionsChanged: state.qrOptions
    });

    if (state.isValidUrl && state.url) {
      console.log('✅ [QR Generation] Condiciones cumplidas para generar QR:', {
        url: state.url,
        urlType: getURLType(state.url),
        qrOptions: state.qrOptions
      });

      updateState({ isGenerating: true, error: null });
      
      console.log('🔄 [QR Generation] Llamando generateCustomQR con parámetros:', {
        url: state.url,
        options: {
          size: state.qrOptions.size,
          margin: state.qrOptions.margin,
          errorCorrectionLevel: state.qrOptions.errorCorrectionLevel,
          darkColor: state.qrOptions.darkColor,
          lightColor: state.qrOptions.lightColor
        }
      });

      generateCustomQR(state.url, {
        size: state.qrOptions.size,
        margin: state.qrOptions.margin,
        errorCorrectionLevel: state.qrOptions.errorCorrectionLevel,
        darkColor: state.qrOptions.darkColor,
        lightColor: state.qrOptions.lightColor
      }).then(() => {
        console.log('✅ [QR Generation] QR generado exitosamente');
      }).catch((error) => {
        console.error('❌ [QR Generation] Error generando QR:', {
          error: error,
          errorMessage: error.message,
          errorStack: error.stack,
          url: state.url,
          options: state.qrOptions
        });
        updateState({ 
          error: `Error generando QR: ${error.message}`,
          isGenerating: false 
        });
      });
    } else {
      console.log('⚠️ [QR Generation] Condiciones no cumplidas:', {
        isValidUrl: state.isValidUrl,
        hasUrl: !!state.url,
        url: state.url,
        reason: !state.isValidUrl ? 'URL inválida' : !state.url ? 'URL vacía' : 'Condiciones desconocidas'
      });
    }
  }, [state.isValidUrl, state.url, state.qrOptions, generateCustomQR, updateState]);

  // 🔄 Sincronizar estado de generación
  useEffect(() => {
    updateState({ isGenerating });
  }, [isGenerating, updateState]);

  // ❌ Manejo de errores del hook
  useEffect(() => {
    if (qrError) {
      console.error('❌ [QR Hook Error] Error del hook de generación:', {
        error: qrError,
        currentUrl: state.url,
        currentOptions: state.qrOptions,
        isValidUrl: state.isValidUrl,
        timestamp: new Date().toISOString()
      });
      updateState({ error: qrError });
    }
  }, [qrError, updateState, state.url, state.qrOptions, state.isValidUrl]);

  // 💾 Función de descarga PNG
  const handleDownloadPNG = useCallback(async () => {
    if (!qrDataURL) {
      setDownloadStatus('❌ No hay QR para descargar');
      return;
    }

    if (!isDownloadSupported()) {
      setDownloadStatus('❌ Tu navegador no soporta descargas');
      return;
    }

    try {
      // Si hay logo, necesitamos crear un canvas combinado
      if (state.qrOptions.logoUrl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo crear el contexto del canvas');

        const size = state.qrOptions.size;
        canvas.width = size;
        canvas.height = size;

        // Cargar imagen del QR
        const qrImage = new window.Image();
        qrImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
          qrImage.src = qrDataURL;
        });

        // Dibujar QR
        ctx.drawImage(qrImage, 0, 0, size, size);

        // Dibujar logo si existe
        const logoSize = (size * (state.qrOptions.logoSize || 20)) / 100;
        const logoPosition = (size - logoSize) / 2;
        const padding = 8;

        // Fondo del logo
        ctx.fillStyle = state.qrOptions.logoBackgroundColor || '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(logoPosition, logoPosition, logoSize, logoSize, 8);
        ctx.fill();

        // Sombra del logo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        // Cargar y dibujar logo
        const logoImage = new window.Image();
        logoImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          logoImage.onload = resolve;
          logoImage.onerror = reject;
          logoImage.src = state.qrOptions.logoUrl!;
        });

        ctx.drawImage(
          logoImage,
          logoPosition + padding,
          logoPosition + padding,
          logoSize - padding * 2,
          logoSize - padding * 2
        );

        // Descargar desde canvas
        const finalDataURL = canvas.toDataURL('image/png');
        const fileName = generateQRFileName(state.url, 'png');
        downloadQRAsPNG(finalDataURL, fileName);
        setDownloadStatus(createDownloadMessage('png', fileName));
      } else {
        // Sin logo, descarga normal
        const fileName = generateQRFileName(state.url, 'png');
        downloadQRAsPNG(qrDataURL, fileName);
        setDownloadStatus(createDownloadMessage('png', fileName));
      }
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      const errorMessage = handleDownloadError(error as Error, 'png');
      setDownloadStatus(errorMessage);
    }
  }, [qrDataURL, state.url, state.qrOptions]);

  // 💾 Función de descarga JPG
  const handleDownloadJPG = useCallback(async () => {
    if (!qrDataURL) {
      setDownloadStatus('❌ No hay QR para descargar');
      return;
    }

    if (!isDownloadSupported()) {
      setDownloadStatus('❌ Tu navegador no soporta descargas');
      return;
    }

    try {
      // Si hay logo, necesitamos crear un canvas combinado
      if (state.qrOptions.logoUrl) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('No se pudo crear el contexto del canvas');

        const size = state.qrOptions.size;
        canvas.width = size;
        canvas.height = size;

        // Cargar imagen del QR
        const qrImage = new window.Image();
        qrImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          qrImage.onload = resolve;
          qrImage.onerror = reject;
          qrImage.src = qrDataURL;
        });

        // Dibujar QR
        ctx.drawImage(qrImage, 0, 0, size, size);

        // Dibujar logo si existe
        const logoSize = (size * (state.qrOptions.logoSize || 20)) / 100;
        const logoPosition = (size - logoSize) / 2;
        const padding = 8;

        // Fondo del logo
        ctx.fillStyle = state.qrOptions.logoBackgroundColor || '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(logoPosition, logoPosition, logoSize, logoSize, 8);
        ctx.fill();

        // Sombra del logo
        ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 2;

        // Cargar y dibujar logo
        const logoImage = new window.Image();
        logoImage.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
          logoImage.onload = resolve;
          logoImage.onerror = reject;
          logoImage.src = state.qrOptions.logoUrl!;
        });

        ctx.drawImage(
          logoImage,
          logoPosition + padding,
          logoPosition + padding,
          logoSize - padding * 2,
          logoSize - padding * 2
        );

        // Descargar desde canvas como JPG
        const finalDataURL = canvas.toDataURL('image/jpeg', 0.95);
        const fileName = generateQRFileName(state.url, 'jpg');
        await downloadQRAsJPG(finalDataURL, fileName);
        setDownloadStatus(createDownloadMessage('jpg', fileName));
      } else {
        // Sin logo, descarga normal
        const fileName = generateQRFileName(state.url, 'jpg');
        await downloadQRAsJPG(qrDataURL, fileName);
        setDownloadStatus(createDownloadMessage('jpg', fileName));
      }
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setDownloadStatus(''), 3000);
    } catch (error) {
      const errorMessage = handleDownloadError(error as Error, 'jpg');
      setDownloadStatus(errorMessage);
    }
  }, [qrDataURL, state.url, state.qrOptions]);

  // 🔄 Función de reset
  const handleReset = useCallback(() => {
    setState({
      url: '',
      name: undefined,
      isValidUrl: false,
      qrOptions: DEFAULT_QR_OPTIONS,
      isGenerating: false,
      error: null
    });
    setDownloadStatus('');
    setActiveColorPreset(0);
  }, []);

  // 🎯 Obtener tipo de URL para iconos
  const urlType = useMemo(() => getURLType(state.url), [state.url]);
  const urlSuggestions = useMemo(() => getURLSuggestions(), []);

  return (
    <div className={styles.createQRContainer}>
      {/* 📋 Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>🎯 Crear Código QR</h1>
        <p className={styles.subtitle}>
          Genera códigos QR personalizados desde cualquier URL
        </p>
      </div>

      {/* 🔗 Sección de URL */}
      <div className={styles.urlSection}>
        <label htmlFor="url-input" className={styles.urlLabel}>
          📎 URL de destino
        </label>
        <div className={styles.urlInputContainer}>
          <input
            id="url-input"
            type="url"
            value={state.url}
            onChange={(e) => handleURLChange(e.target.value)}
            placeholder="https://ejemplo.com, mailto:correo@ejemplo.com, tel:+1234567890"
            className={`${styles.urlInput} ${
              state.url ? (state.isValidUrl ? styles.valid : styles.invalid) : ''
            }`}
            disabled={state.isGenerating}
          />
          <button
            type="button"
            onClick={handleValidateURL}
            disabled={!state.url.trim() || state.isGenerating}
            className={styles.validateButton}
          >
            {state.isGenerating ? '🔄' : '✅'} Validar
          </button>
        </div>
        
        {/* Estado de validación */}
        {state.url && (
          <div className={`${styles.urlStatus} ${state.isValidUrl ? styles.valid : styles.invalid}`}>
            {(() => {
              console.log('🎨 [URL Status Render] Renderizando estado de URL:', {
                url: state.url,
                isValid: state.isValidUrl,
                urlType: urlType,
                displayStatus: state.isValidUrl ? 'válida' : 'inválida'
              });
              
              return state.isValidUrl ? (
                <>✅ URL válida ({urlType})</>
              ) : (
                <>❌ URL inválida - Verifica el formato</>
              );
            })()}
          </div>
        )}

        {/* Sugerencias de URL */}
        {!state.url && (
          <div style={{ marginTop: '1rem' }}>
            <small style={{ color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
              💡 Ejemplos de URLs válidas:
            </small>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {urlSuggestions.slice(0, 3).map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleURLChange(suggestion)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ⚙️ Sección de Personalización */}
      {state.isValidUrl && (
        <div className={styles.customizationSection}>
          <h3 className={styles.sectionTitle}>
            ⚙️ Personalización
          </h3>

          {/* 📏 Controles de Tamaño */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>📏 Tamaño del QR</label>
            <div className={styles.sizeOptions}>
              {SIZE_OPTIONS.map((option) => (
                <div key={option.value} className={styles.sizeOption}>
                  <input
                    type="radio"
                    id={`size-${option.value}`}
                    name="qr-size"
                    value={option.value}
                    checked={state.qrOptions.size === option.value}
                    onChange={() => updateQROptions({ size: option.value })}
                    className={styles.sizeRadio}
                  />
                  <label htmlFor={`size-${option.value}`} className={styles.sizeLabel}>
                    <span className={styles.sizeLabelText}>{option.label}</span>
                    <span className={styles.sizeLabelDesc}>{option.description}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* 🎨 Controles de Color */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>🎨 Colores personalizados</label>
            <div className={styles.colorControls}>
              <div className={styles.colorGroup}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>
                  Color del QR
                </span>
                <div className={styles.colorInputContainer}>
                  <input
                    type="color"
                    value={state.qrOptions.darkColor}
                    onChange={(e) => {
                      updateQROptions({ darkColor: e.target.value });
                      setTempDarkColor(e.target.value);
                      setDarkColorError(false);
                    }}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={tempDarkColor}
                    onChange={(e) => handleDarkColorChange(e.target.value)}
                    onBlur={handleDarkColorBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleDarkColorBlur();
                      }
                    }}
                    placeholder="#000000"
                    className={styles.colorInput}
                    style={{
                      borderColor: darkColorError ? '#ef4444' : undefined,
                      outline: darkColorError ? '2px solid #fecaca' : undefined
                    }}
                  />
                  {darkColorError && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                      ❌ Color inválido (formato: #RRGGBB)
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.colorGroup}>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#4b5563' }}>
                  Color de fondo
                </span>
                <div className={styles.colorInputContainer}>
                  <input
                    type="color"
                    value={state.qrOptions.lightColor}
                    onChange={(e) => {
                      updateQROptions({ lightColor: e.target.value });
                      setTempLightColor(e.target.value);
                      setLightColorError(false);
                    }}
                    className={styles.colorPicker}
                  />
                  <input
                    type="text"
                    value={tempLightColor}
                    onChange={(e) => handleLightColorChange(e.target.value)}
                    onBlur={handleLightColorBlur}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleLightColorBlur();
                      }
                    }}
                    placeholder="#FFFFFF"
                    className={styles.colorInput}
                    style={{
                      borderColor: lightColorError ? '#ef4444' : undefined,
                      outline: lightColorError ? '2px solid #fecaca' : undefined
                    }}
                  />
                  {lightColorError && (
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                      ❌ Color inválido (formato: #RRGGBB)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Presets de Color */}
            <div className={styles.colorPresets}>
              {COLOR_PRESETS.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyColorPreset(index)}
                  className={`${styles.presetButton} ${
                    activeColorPreset === index ? styles.active : ''
                  }`}
                >
                  <span>{preset.preview}</span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 🔧 Opciones Avanzadas */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>🔧 Opciones avanzadas</label>
            <div className={styles.advancedGrid}>
              <div>
                <label htmlFor="error-correction" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Corrección de errores
                </label>
                <select
                  id="error-correction"
                  value={state.qrOptions.errorCorrectionLevel}
                  onChange={(e) => updateQROptions({ 
                    errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' 
                  })}
                  className={styles.select}
                >
                  {ERROR_CORRECTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {state.qrOptions.logoUrl && (state.qrOptions.errorCorrectionLevel === 'L' || state.qrOptions.errorCorrectionLevel === 'M') && (
                  <div style={{ 
                    marginTop: '0.5rem', 
                    fontSize: '0.75rem', 
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    ⚠️ Se recomienda "Alto (Q)" o "Máximo (H)" cuando usas logo
                  </div>
                )}
              </div>
              <div className={styles.rangeContainer}>
                <label htmlFor="margin-range" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Margen
                </label>
                <input
                  id="margin-range"
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={state.qrOptions.margin}
                  onChange={(e) => updateQROptions({ margin: parseInt(e.target.value) })}
                  className={styles.rangeInput}
                />
                <div className={styles.rangeValue}>
                  {state.qrOptions.margin} px
                </div>
              </div>
            </div>
          </div>

          {/* 🖼️ Sección de Logo */}
          <div className={styles.optionGroup}>
            <label className={styles.optionLabel}>🖼️ Logo en el centro (opcional)</label>
            
            {!state.qrOptions.logoUrl ? (
              <div style={{ marginTop: '0.5rem' }}>
                <label 
                  htmlFor="logo-upload"
                  style={{
                    display: 'inline-block',
                    padding: '0.75rem 1.5rem',
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                >
                  📤 Subir imagen de logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  style={{ display: 'none' }}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
                  Formatos: JPG, PNG, SVG • Tamaño máximo: 5MB
                </div>
              </div>
            ) : (
              <div style={{ marginTop: '0.5rem' }}>
                {/* Preview del logo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <Image
                    src={state.qrOptions.logoUrl}
                    alt="Logo preview"
                    width={60}
                    height={60}
                    style={{
                      objectFit: 'contain',
                      borderRadius: '4px',
                      background: state.qrOptions.logoBackgroundColor
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>
                      ✅ Logo cargado
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Se mostrará en el centro del QR
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    🗑️ Quitar
                  </button>
                </div>

                {/* Control de tamaño del logo */}
                <div className={styles.rangeContainer} style={{ marginTop: '1rem' }}>
                  <label htmlFor="logo-size-range" style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Tamaño del logo
                  </label>
                  <input
                    id="logo-size-range"
                    type="range"
                    min="10"
                    max="40"
                    step="5"
                    value={state.qrOptions.logoSize || 20}
                    onChange={(e) => updateQROptions({ logoSize: parseInt(e.target.value) })}
                    className={styles.rangeInput}
                  />
                  <div className={styles.rangeValue}>
                    {state.qrOptions.logoSize || 20}%
                  </div>
                  {(state.qrOptions.logoSize || 20) > 30 && (
                    <div style={{ 
                      marginTop: '0.5rem', 
                      fontSize: '0.75rem', 
                      color: '#f59e0b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      ⚠️ Un logo muy grande puede dificultar el escaneo del QR
                    </div>
                  )}
                </div>

                {/* Control de fondo del logo */}
                <div style={{ marginTop: '1rem' }}>
                  <label style={{ fontSize: '0.85rem', color: '#6b7280', display: 'block', marginBottom: '0.5rem' }}>
                    Fondo del logo
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={state.qrOptions.logoBackgroundColor || '#FFFFFF'}
                      onChange={(e) => updateQROptions({ logoBackgroundColor: e.target.value })}
                      style={{
                        width: '60px',
                        height: '40px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                      {state.qrOptions.logoBackgroundColor || '#FFFFFF'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📱 Sección de Preview */}
      {state.isValidUrl && (
        <div className={styles.previewSection}>
          <h3 className={styles.sectionTitle}>
            📱 Vista Previa
          </h3>
          <div className={styles.previewContainer}>
            {qrDataURL ? (
              <>
              <h2 className='text-3xl font-bold'>Invitado: {name}</h2>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <Image
                    src={qrDataURL}
                    alt="Código QR generado"
                    width={state.qrOptions.size}
                    height={state.qrOptions.size}
                    className={styles.qrPreview}
                  />
                  {/* Logo superpuesto sobre el QR */}
                  {state.qrOptions.logoUrl && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: `${state.qrOptions.logoSize}%`,
                        height: `${state.qrOptions.logoSize}%`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: state.qrOptions.logoBackgroundColor,
                        borderRadius: '8px',
                        padding: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Image
                        src={state.qrOptions.logoUrl}
                        alt="Logo"
                        width={Math.floor(state.qrOptions.size * ((state.qrOptions.logoSize || 20) / 100) - 16)}
                        height={Math.floor(state.qrOptions.size * ((state.qrOptions.logoSize || 20) / 100) - 16)}
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>
                <div className={`${styles.previewStatus} ${styles.ready}`}>
                  ✅ QR listo para descargar ({state.qrOptions.size}×{state.qrOptions.size}px)
                  {state.qrOptions.logoUrl && ' con logo'}
                </div>
              </>
            ) : state.isGenerating ? (
              <>
                <div className={styles.previewPlaceholder}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
                  <div>Generando código QR...</div>
                  <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                    {state.qrOptions.size}×{state.qrOptions.size}px
                  </div>
                </div>
                <div className={`${styles.previewStatus} ${styles.generating}`}>
                  🔄 Generando QR...
                </div>
              </>
            ) : (
              <>
                <div className={styles.previewPlaceholder}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📱</div>
                  <div>Vista previa del QR</div>
                  <div style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
                    Aparecerá aquí cuando esté listo
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 💾 Sección de Descarga */}
      {qrDataURL && (
        <div className={styles.downloadSection}>
          <h3 className={styles.sectionTitle}>
            💾 Descargar QR
          </h3>
          <div className={styles.downloadButtons}>
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={!qrDataURL}
              className={`${styles.downloadButton} ${styles.png}`}
            >
              <span>📥</span>
              Descargar PNG
            </button>
            <button
              type="button"
              onClick={handleDownloadJPG}
              disabled={!qrDataURL}
              className={`${styles.downloadButton} ${styles.jpg}`}
            >
              <span>📥</span>
              Descargar JPG
            </button>
            <button
              type="button"
              onClick={handleReset}
              className={`${styles.downloadButton} ${styles.reset}`}
            >
              <span>🔄</span>
              Restablecer
            </button>
          </div>
          
          {/* Estado de descarga */}
          {downloadStatus && (
            <div style={{ 
              marginTop: '1rem', 
              textAlign: 'center', 
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {downloadStatus}
            </div>
          )}
        </div>
      )}

      {/* ❌ Manejo de errores */}
      {state.error && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          background: '#fef2f2',
          border: '2px solid #fecaca',
          borderRadius: '10px',
          color: '#dc2626',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ❌ {state.error}
        </div>
      )}
    </div>
  );
};

export default CreateQR;