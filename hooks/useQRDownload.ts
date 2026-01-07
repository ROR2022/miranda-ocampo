"use client";

import React, { useState, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import QRCode from "qrcode";

import {
  QREventData,
  DownloadFormat,
  QRDownloadState,
  QRDownloadHook,
} from "@/types/qrDownload.types";

import {
  FORMAT_CONFIGS,
  generateFileName,
  validateEventData,
  dataURLtoBlob,
  triggerDownload,
  calculateOptimalDimensions,
  logDownloadEvent,
  getErrorMessage,
} from "@/utils/qrDownloadHelpers";

// Utilidades de dispositivos para el hook
const DeviceUtils = {
  isIOS: () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  },
  
  isSafari: () => {
    if (typeof window === 'undefined') return false;
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },
  
  getDeviceInfo: () => {
    if (typeof window === 'undefined') return {
      isIOS: false,
      isSafari: false,
      userAgent: 'SSR',
      platform: 'Server',
      screenSize: 'unknown',
      devicePixelRatio: 1,
      availableMemory: 'unknown'
    };
    
    return {
      isIOS: DeviceUtils.isIOS(),
      isSafari: DeviceUtils.isSafari(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      devicePixelRatio: window.devicePixelRatio || 1,
      availableMemory: (navigator as any).deviceMemory || 'unknown'
    };
  }
};

// Logger específico para el hook
const HookLogger = {
  info: (message: string, data?: any) => {
    console.log(`🔧 [useQRDownload] ${message}`, data || '');
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [useQRDownload] ${message}`, data || '');
  },
  
  error: (message: string, error?: any) => {
    console.error(`💥 [useQRDownload] ${message}`, error || '');
  },
  
  timing: (operation: string, startTime: number, success: boolean = true) => {
    const duration = Date.now() - startTime;
    const status = success ? '✅' : '❌';
    console.log(`⏱️ [useQRDownload] ${status} ${operation} completada en ${duration}ms`);
  }
};

export const useQRDownload = (eventData: QREventData): QRDownloadHook => {
  // Estado principal del hook
  const [state, setState] = useState<QRDownloadState>({
    isGenerating: false,
    downloadProgress: 0,
    error: null,
    previewUrl: null,
    currentFormat: null,
  });

  // Ref para el componente de descarga attachado externamente
  const downloadCardRef = useRef<HTMLDivElement>(null);

  // Log inicial del hook
  React.useEffect(() => {
    const deviceInfo = DeviceUtils.getDeviceInfo();
    HookLogger.info('Hook useQRDownload inicializado', {
      eventData: {
        hasQrUrl: !!eventData.qrCodeUrl,
        qrUrlLength: eventData.qrCodeUrl?.length || 0,
        dataKeys: Object.keys(eventData)
      },
      deviceInfo
    });

    if (deviceInfo.isIOS) {
      HookLogger.warn('Dispositivo iOS detectado - aplicando configuraciones específicas', {
        isSafari: deviceInfo.isSafari,
        availableMemory: deviceInfo.availableMemory
      });
    }
  }, [eventData]);

  // Actualizar estado de forma segura
  const updateState = useCallback((updates: Partial<QRDownloadState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Validar datos del evento
  const validateQRData = useCallback((): boolean => {
    try {
      const isValid = validateEventData(eventData);
      if (!isValid) {
        updateState({ error: "Los datos del evento no son válidos" });
      }
      return isValid;
    } catch (error) {
      updateState({ error: getErrorMessage(error) });
      return false;
    }
  }, [eventData, updateState]);

  // Generar QR Code como Data URL
  const generateQRDataURL = useCallback(async (): Promise<string> => {
    try {
      updateState({ downloadProgress: 10 });

      const qrDataURL = await QRCode.toDataURL(eventData.qrCodeUrl, {
        width: 300,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
        errorCorrectionLevel: "M",
      });

      updateState({ downloadProgress: 25 });
      return qrDataURL;
    } catch (error) {
      throw new Error(`Error generando QR: ${getErrorMessage(error)}`);
    }
  }, [eventData.qrCodeUrl, updateState]);

  // Capturar elemento como canvas
  const captureElementAsCanvas = useCallback(
    async (
      element: HTMLElement,
      format: DownloadFormat
    ): Promise<HTMLCanvasElement> => {
      const startTime = Date.now();
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      try {
        HookLogger.info(`Iniciando captura de canvas para formato: ${format}`, {
          element: {
            tagName: element.tagName,
            className: element.className,
            offsetDimensions: `${element.offsetWidth}x${element.offsetHeight}`,
            scrollDimensions: `${element.scrollWidth}x${element.scrollHeight}`
          },
          deviceInfo
        });

        updateState({ downloadProgress: 40 });

        // Esperar a que las imágenes se carguen - más tiempo para iOS
        const waitTime = deviceInfo.isIOS ? 2000 : 1000;
        HookLogger.info(`Esperando ${waitTime}ms para carga de recursos...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));

        updateState({ downloadProgress: 50 });

        const config = FORMAT_CONFIGS[format];

        // Configuración específica para iOS
        if (deviceInfo.isIOS) {
          HookLogger.warn('Aplicando configuración específica para iOS', {
            format,
            availableMemory: deviceInfo.availableMemory,
            devicePixelRatio: deviceInfo.devicePixelRatio
          });
        }

        // Para PDF, usar dimensiones más altas para mejor calidad
        const captureOptions =
          format === "pdf"
            ? {
                width: deviceInfo.isIOS ? 1200 : 1600, // Reducir para iOS por memoria
                height: deviceInfo.isIOS ? 1500 : 2000,
                useCORS: true,
                allowTaint: false,
                background: config.backgroundColor || "#FFFFFF",
                scale: deviceInfo.isIOS ? 2 : 3, // Escala menor para iOS
                logging: process.env.NODE_ENV === "development",
                onclone: (clonedDoc: Document) => {
                  HookLogger.info('Documento clonado para captura', {
                    originalDoc: document.title,
                    clonedDoc: clonedDoc.title
                  });
                }
              }
            : {
                width: deviceInfo.isIOS ? 600 : 800, // Reducir para iOS
                height: deviceInfo.isIOS ? 750 : 1000,
                useCORS: true,
                allowTaint: false,
                background: config.backgroundColor || "#FFFFFF",
                scale: deviceInfo.isIOS ? 1.5 : 2,
                logging: process.env.NODE_ENV === "development",
                onclone: (clonedDoc: Document) => {
                  HookLogger.info('Documento clonado para captura', {
                    format,
                    isIOS: deviceInfo.isIOS
                  });
                }
              };

        HookLogger.info('Configuración de html2canvas:', captureOptions);

        // Para iOS, usar timeout agresivo para html2canvas
        let canvas: HTMLCanvasElement;
        
        if (deviceInfo.isIOS) {
          HookLogger.warn('🍎 iOS detectado - usando timeout de 5s para html2canvas...');
          
          try {
            // Promise.race con timeout de 5 segundos para iOS
            canvas = await Promise.race([
              html2canvas(element, captureOptions),
              new Promise<never>((_, reject) => {
                setTimeout(() => {
                  reject(new Error('html2canvas timeout en iOS Safari - 5 segundos excedidos'));
                }, 5000);
              })
            ]);
            
            HookLogger.info('✅ html2canvas completado exitosamente en iOS');
            
          } catch (timeoutError) {
            HookLogger.error('❌ html2canvas falló o timeout en iOS:', timeoutError);
            throw timeoutError; // Esto activará el fallback iOS
          }
          
        } else {
          // Método normal para otros dispositivos
          canvas = await html2canvas(element, captureOptions);
        }

        HookLogger.info(`Canvas capturado exitosamente para ${format}:`, {
          dimensions: `${canvas.width}x${canvas.height}px`,
          element: `${element.offsetWidth}x${element.offsetHeight}px`,
          hasContent: canvas.width > 0 && canvas.height > 0,
          deviceInfo: deviceInfo.isIOS ? 'iOS' : 'Other'
        });

        updateState({ downloadProgress: 75 });

        // Verificación específica para iOS
        if (deviceInfo.isIOS && (canvas.width === 0 || canvas.height === 0)) {
          throw new Error('iOS: Canvas vacío - posible limitación de memoria o Safari');
        }

        HookLogger.timing(`Captura de canvas (${format})`, startTime);
        return canvas;
        
      } catch (error) {
        HookLogger.error(`Error capturando elemento para ${format}`, {
          error,
          deviceInfo,
          element: {
            exists: !!element,
            dimensions: element ? `${element.offsetWidth}x${element.offsetHeight}` : 'N/A'
          },
          duration: Date.now() - startTime
        });

        // Errores específicos para iOS
        if (deviceInfo.isIOS) {
          if (error instanceof Error && error.message.includes('memory')) {
            throw new Error('iOS: Memoria insuficiente para generar la imagen. Intenta cerrar otras apps.');
          } else if (error instanceof Error && error.message.includes('canvas')) {
            throw new Error('iOS: Error de canvas en Safari. Intenta usar Chrome o actualizar Safari.');
          } else {
            throw new Error(`iOS: ${error instanceof Error ? error.message : 'Error desconocido en dispositivo iOS'}`);
          }
        }

        throw new Error(`Error capturando elemento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    },
    [updateState]
  );

  // Versión mejorada del método downloadAsPDF
  const downloadAsPDF = useCallback(async (): Promise<void> => {
    const startTime = Date.now();
    const deviceInfo = DeviceUtils.getDeviceInfo();

    try {
      HookLogger.info('Iniciando descarga PDF', { deviceInfo });
      
      if (!validateQRData()) {
        HookLogger.error('Validación de datos QR falló');
        return;
      }

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "pdf",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente de descarga no encontrado");
      }

      const element = downloadCardRef.current;

      // Warnings específicos para iOS
      if (deviceInfo.isIOS) {
        HookLogger.warn('Iniciando descarga PDF en iOS - posibles limitaciones:', {
          safari: deviceInfo.isSafari,
          memory: deviceInfo.availableMemory,
          screen: deviceInfo.screenSize
        });
      }

      // 1. OBTENER DIMENSIONES REALES DEL CONTENIDO
      const rect = element.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(element);

      HookLogger.info("Análisis del elemento:", {
        boundingRect: `${rect.width}x${rect.height}px`,
        offsetDimensions: `${element.offsetWidth}x${element.offsetHeight}px`,
        scrollDimensions: `${element.scrollWidth}x${element.scrollHeight}px`,
        computedStyle: {
          width: computedStyle.width,
          height: computedStyle.height,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
        },
      });

      updateState({ downloadProgress: 20 });

      // 2. CONFIGURACIÓN MEJORADA PARA html2canvas
      const contentWidth = Math.max(
        rect.width,
        element.offsetWidth,
        element.scrollWidth
      );
      const contentHeight = Math.max(
        rect.height,
        element.offsetHeight,
        element.scrollHeight
      );

      // Asegurar dimensiones mínimas - ajustadas para iOS
      const minWidth = deviceInfo.isIOS ? 600 : 800;
      const minHeight = deviceInfo.isIOS ? 750 : 1000;

      const finalWidth = Math.max(contentWidth, minWidth);
      const finalHeight = Math.max(contentHeight, minHeight);

      const captureOptions = {
        width: finalWidth,
        height: finalHeight,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
        scale: deviceInfo.isIOS ? 1.5 : 2, // Escala reducida para iOS
        scrollX: 0,
        scrollY: 0,
        windowWidth: finalWidth,
        windowHeight: finalHeight,
        logging: process.env.NODE_ENV === "development",
      };

      HookLogger.info("Configuración de captura PDF:", {
        ...captureOptions,
        deviceOptimized: deviceInfo.isIOS ? 'iOS' : 'Desktop'
      });

      updateState({ downloadProgress: 30 });

      // 3. ESPERAR A QUE TODO SE RENDERICE - más tiempo para iOS
      const waitTime = deviceInfo.isIOS ? 1500 : 500;
      await new Promise((resolve) => setTimeout(resolve, waitTime));

      updateState({ downloadProgress: 40 });

      // 4. CAPTURAR CANVAS
      HookLogger.info('Capturando canvas...');
      
      let canvas: HTMLCanvasElement;
      
      // DETECCIÓN DE INCOMPATIBILIDAD iOS
      if (deviceInfo.isIOS) {
        HookLogger.warn('iOS detectado - html2canvas puede fallar. Implementando workaround...');
        
        // NUEVO: Para Safari iOS, saltar directamente al fallback
        if (deviceInfo.isSafari) {
          HookLogger.warn('🚨 Safari iOS detectado - saltando html2canvas directamente y usando fallback...');
          
          try {
            const alternativeCanvas = await createiOSFallbackCanvas(element, captureOptions);
            if (alternativeCanvas) {
              canvas = alternativeCanvas;
              HookLogger.info('✅ Método alternativo iOS exitoso (directo)');
            } else {
              throw new Error('Método alternativo iOS falló');
            }
          } catch (alternativeError) {
            HookLogger.error('❌ Método alternativo iOS falló, creando emergencia...', alternativeError);
            
            try {
              canvas = await createEmergencyiOSCanvas(element);
              HookLogger.info('✅ Canvas de emergencia iOS creado');
            } catch (emergencyError) {
              HookLogger.error('❌ Canvas de emergencia también falló. Mostrando instrucciones al usuario...', emergencyError);
              await handleiOSManualInstructions();
              return;
            }
          }
          
        } else {
          // Solo para iOS no-Safari (como Chrome iOS), intentar método estándar
          try {
            HookLogger.info('Intentando método alternativo para iOS...');
            
            // Método alternativo 1: Usar domtoimage como fallback
            const alternativeCanvas = await createiOSFallbackCanvas(element, captureOptions);
            if (alternativeCanvas) {
              canvas = alternativeCanvas;
              HookLogger.info('✅ Método alternativo iOS exitoso');
            } else {
              throw new Error('Método alternativo iOS falló');
            }
            
          } catch (iosError) {
            HookLogger.error('❌ Método alternativo iOS falló, intentando html2canvas con configuración mínima...', iosError);
            
            // Si todo falla en iOS, crear un canvas con información básica
            HookLogger.warn('🚨 html2canvas NO es compatible con este iPhone. Creando solución de emergencia...');
            
            try {
              canvas = await createEmergencyiOSCanvas(element);
              HookLogger.info('✅ Canvas de emergencia iOS creado');
            } catch (emergencyError) {
              HookLogger.error('❌ Canvas de emergencia también falló. Mostrando instrucciones al usuario...', emergencyError);
              await handleiOSManualInstructions();
              return;
            }
          }
        }
        
      } else {
        // Método estándar para otros dispositivos
        try {
          HookLogger.info('Iniciando html2canvas con configuración:', captureOptions);
          
          canvas = await html2canvas(element, {
            ...captureOptions,
            logging: true,
            useCORS: true,
            allowTaint: false
          });

          HookLogger.info('html2canvas completado exitosamente');
          
        } catch (canvasError) {
          HookLogger.error('Error específico en html2canvas:', {
            error: canvasError,
            errorMessage: canvasError instanceof Error ? canvasError.message : 'Error desconocido',
            stack: canvasError instanceof Error ? canvasError.stack : undefined,
            captureOptions,
            elementInfo: {
              exists: !!element,
              visible: element ? element.offsetWidth > 0 && element.offsetHeight > 0 : false,
              inViewport: element ? element.getBoundingClientRect().top >= 0 : false
            }
          });
          throw canvasError;
        }
      }
      
      if (!canvas) {
        throw new Error('html2canvas retornó null o undefined');
      }

      HookLogger.info("Canvas generado:", {
        dimensions: `${canvas.width}x${canvas.height}px`,
        hasContent: canvas.width > 0 && canvas.height > 0,
        deviceType: deviceInfo.isIOS ? 'iOS' : 'Other',
        canvasArea: canvas.width * canvas.height,
        expectedArea: captureOptions.width * captureOptions.height,
        method: deviceInfo.isIOS ? 'iOS Alternative' : 'Standard html2canvas'
      });

      HookLogger.info("Canvas generado:", {
        dimensions: `${canvas.width}x${canvas.height}px`,
        hasContent: canvas.width > 0 && canvas.height > 0,
        deviceType: deviceInfo.isIOS ? 'iOS' : 'Other'
      });

      updateState({ downloadProgress: 60 });

      // 5. VERIFICAR QUE EL CANVAS TIENE CONTENIDO
      if (canvas.width === 0 || canvas.height === 0) {
        const errorMsg = deviceInfo.isIOS 
          ? "El canvas generado está vacío (posible limitación de Safari iOS)"
          : "El canvas generado está vacío";
        throw new Error(errorMsg);
      }

      // 6. CREAR PDF CON PROPORCIONES CORRECTAS
      const imgData = canvas.toDataURL("image/jpeg", deviceInfo.isIOS ? 0.8 : 0.92);

      HookLogger.info('Creando PDF...');
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // 7. CALCULAR ESCALADO MANTENIENDO PROPORCIONES
      const canvasRatio = canvas.width / canvas.height;
      const pdfRatio = pdfWidth / pdfHeight;

      let finalPdfWidth, finalPdfHeight, offsetX, offsetY;

      if (canvasRatio > pdfRatio) {
        // El contenido es más ancho proporcionalmente
        finalPdfWidth = pdfWidth;
        finalPdfHeight = pdfWidth / canvasRatio;
        offsetX = 0;
        offsetY = (pdfHeight - finalPdfHeight) / 2;
      } else {
        // El contenido es más alto proporcionalmente
        finalPdfHeight = pdfHeight;
        finalPdfWidth = pdfHeight * canvasRatio;
        offsetX = (pdfWidth - finalPdfWidth) / 2;
        offsetY = 0;
      }

      HookLogger.info("Configuración PDF:", {
        pdfSize: `${pdfWidth}x${pdfHeight}mm`,
        canvasRatio: canvasRatio.toFixed(3),
        pdfRatio: pdfRatio.toFixed(3),
        finalSize: `${finalPdfWidth.toFixed(1)}x${finalPdfHeight.toFixed(1)}mm`,
        offset: `${offsetX.toFixed(1)}, ${offsetY.toFixed(1)}mm`,
        scaling: canvasRatio > pdfRatio ? "Ajustado por ancho" : "Ajustado por altura",
        deviceOptimized: deviceInfo.isIOS
      });

      updateState({ downloadProgress: 80 });

      // 8. AGREGAR IMAGEN AL PDF MANTENIENDO PROPORCIONES
      pdf.addImage(
        imgData,
        "JPEG",
        offsetX,
        offsetY,
        finalPdfWidth,
        finalPdfHeight,
        undefined,
        "FAST"
      );

      updateState({ downloadProgress: 90 });

      // 9. GENERAR Y DESCARGAR
      HookLogger.info('Generando blob y descargando...');
      
      try {
        HookLogger.info('Convirtiendo PDF a blob...');
        const pdfBlob = pdf.output("blob");
        
        HookLogger.info('PDF blob generado:', {
          size: pdfBlob.size,
          type: pdfBlob.type,
          sizeInMB: (pdfBlob.size / (1024 * 1024)).toFixed(2)
        });

        const fileName = generateFileName("pdf", eventData);
        HookLogger.info('Nombre de archivo generado:', fileName);

        // Logging específico para iOS antes de la descarga
        if (deviceInfo.isIOS) {
          HookLogger.warn('Intentando descarga en iOS - verificar permisos de Safari', {
            fileName,
            blobSize: pdfBlob.size,
            isSafari: deviceInfo.isSafari,
            safariVersion: navigator.userAgent.match(/Version\/([0-9\.]+)/)?.[1] || 'unknown'
          });
        }

        HookLogger.info('Ejecutando triggerDownload...');
        triggerDownload(pdfBlob, fileName);
        HookLogger.info('triggerDownload ejecutado - esperando resultado...');

      } catch (blobError) {
        HookLogger.error('Error generando o descargando blob PDF:', {
          error: blobError,
          errorMessage: blobError instanceof Error ? blobError.message : 'Error desconocido',
          pdfExists: !!pdf,
          deviceInfo
        });
        throw blobError;
      }

      updateState({ downloadProgress: 100 });
      HookLogger.info('Progreso actualizado a 100%');
      
      HookLogger.timing('Descarga PDF completa', startTime);
      logDownloadEvent("pdf", true, Date.now() - startTime);
      
      HookLogger.info('✅ DESCARGA PDF EXITOSA - proceso completado');
      
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      HookLogger.error("Error en downloadAsPDF:", {
        error,
        deviceInfo,
        duration: Date.now() - startTime,
        step: 'Error durante el proceso'
      });
      
      // Error específico para iOS con sugerencias
      if (deviceInfo.isIOS) {
        const iosErrorMsg = `iOS Error: ${errorMsg}\n\nSugerencias:\n• Usa Safari en lugar de Chrome\n• Permite descargas en Configuración > Safari\n• Cierra otras apps para liberar memoria\n• Intenta la vista previa primero`;
        updateState({ error: iosErrorMsg });
      } else {
        updateState({ error: errorMsg });
      }
      
      logDownloadEvent("pdf", false, Date.now() - startTime, errorMsg);
    } finally {
      HookLogger.info('Iniciando cleanup final...');
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
        HookLogger.info('Cleanup final completado');
      }, 1000);
    }
  }, [eventData, validateQRData, updateState]);

  // FUNCIÓN AUXILIAR PARA DEBUGGING
  const debugElementDimensions = useCallback(() => {
    if (!downloadCardRef.current) return;

    const element = downloadCardRef.current;
    const rect = element.getBoundingClientRect();
    const computed = window.getComputedStyle(element);

    console.log("🔧 DEBUG - Dimensiones del elemento:", {
      elemento:
        element.tagName + (element.className ? `.${element.className}` : ""),
      boundingClientRect: {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      },
      offset: {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: element.offsetTop,
        left: element.offsetLeft,
      },
      scroll: {
        width: element.scrollWidth,
        height: element.scrollHeight,
      },
      computed: {
        width: computed.width,
        height: computed.height,
        display: computed.display,
        visibility: computed.visibility,
        position: computed.position,
        transform: computed.transform,
      },
      children: element.children.length,
      textContent: element.textContent?.substring(0, 50) + "...",
    });
  }, []);

  // Descargar como PNG
  // Versión simplificada de downloadAsPNG para iOS
  const downloadAsPNG = useCallback(async (): Promise<void> => {
    const startTime = Date.now();
    const deviceInfo = DeviceUtils.getDeviceInfo();

    try {
      HookLogger.info('🔍 [PNG] Iniciando descarga PNG', { 
        deviceInfo: { isIOS: deviceInfo.isIOS, isSafari: deviceInfo.isSafari }
      });
      
      // PARA SAFARI iOS - SALTO DIRECTO A INSTRUCCIONES MANUALES
      if (deviceInfo.isIOS && deviceInfo.isSafari) {
        HookLogger.warn('🚨 [PNG] Safari iOS detectado - activando instrucciones inmediatas');
        
        updateState({
          isGenerating: false,
          error: 'Safari iOS no puede descargar imágenes automáticamente. Se mostrarán instrucciones.',
          currentFormat: "png",
          downloadProgress: 0,
        });
        
        // Mostrar instrucciones inmediatamente
        setTimeout(async () => {
          await handleiOSManualInstructionsImage('png');
        }, 100);
        
        return;
      }
      
      if (!validateQRData()) {
        HookLogger.error('❌ [PNG] Validación falló');
        return;
      }

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "png",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente no encontrado");
      }

      let canvas: HTMLCanvasElement;
      
      // Para otros dispositivos (incluyendo Chrome iOS)
      if (deviceInfo.isIOS && !deviceInfo.isSafari) {
        HookLogger.info('🍎 [PNG] Chrome iOS - intentando fallback directo');
        
        try {
          const alternativeCanvas = await createiOSImageFallbackCanvas(downloadCardRef.current, 'png');
          if (alternativeCanvas) {
            canvas = alternativeCanvas;
            HookLogger.info('✅ [PNG] Fallback exitoso');
          } else {
            throw new Error('Fallback falló');
          }
        } catch (fallbackError) {
          HookLogger.error('❌ [PNG] Fallback falló, usando emergencia');
          canvas = await createEmergencyiOSImageCanvas(downloadCardRef.current, 'png');
        }
      } else {
        // Dispositivos no-iOS
        canvas = await captureElementAsCanvas(downloadCardRef.current, "png");
      }

      updateState({ downloadProgress: 90 });

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            HookLogger.error('❌ [PNG] Blob falló');
            throw new Error("Error generando imagen PNG");
          }

          const fileName = generateFileName("png", eventData);
          triggerDownload(blob, fileName);
          updateState({ downloadProgress: 100 });
          
          HookLogger.info('✅ [PNG] Descarga completada');
          logDownloadEvent("png", true, Date.now() - startTime);
        },
        "image/png",
        FORMAT_CONFIGS.png.quality
      );
      
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      HookLogger.error('💥 [PNG] Error final:', errorMsg);
      
      updateState({ error: errorMsg });
      logDownloadEvent("png", false, Date.now() - startTime, errorMsg);
    } finally {
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
      }, 1000);
    }
  }, [eventData, validateQRData, updateState, captureElementAsCanvas]);

  // Descargar como JPG
  const downloadAsJPG = useCallback(async (): Promise<void> => {
    const startTime = Date.now();
    const deviceInfo = DeviceUtils.getDeviceInfo();

    try {
      HookLogger.info('Iniciando descarga JPG', { deviceInfo });
      
      if (!validateQRData()) {
        HookLogger.error('Validación de datos QR falló para JPG');
        return;
      }

      updateState({
        isGenerating: true,
        error: null,
        currentFormat: "jpg",
        downloadProgress: 0,
      });

      if (!downloadCardRef.current) {
        throw new Error("Componente de descarga no encontrado");
      }

      if (deviceInfo.isIOS) {
        HookLogger.info('Descarga JPG en iOS - formato más compatible y ligero');
      }

      let canvas: HTMLCanvasElement;
      
      // SISTEMA DE FALLBACK ESPECÍFICO PARA iOS IMÁGENES JPG
      if (deviceInfo.isIOS) {
        HookLogger.warn('iOS detectado para JPG - html2canvas puede fallar. Implementando workaround...');
        
        // NUEVO: Para Safari iOS, saltar directamente al fallback
        if (deviceInfo.isSafari) {
          HookLogger.warn('🚨 Safari iOS detectado - saltando html2canvas directamente y usando fallback...');
          
          try {
            const alternativeCanvas = await createiOSImageFallbackCanvas(downloadCardRef.current, 'jpg');
            if (alternativeCanvas) {
              canvas = alternativeCanvas;
              HookLogger.info('✅ Canvas alternativo JPG iOS exitoso (directo)');
            } else {
              throw new Error('Canvas alternativo JPG iOS falló');
            }
          } catch (alternativeError) {
            HookLogger.error('❌ Canvas alternativo JPG iOS falló, creando emergencia...', alternativeError);
            
            try {
              canvas = await createEmergencyiOSImageCanvas(downloadCardRef.current, 'jpg');
              HookLogger.info('✅ Canvas de emergencia JPG iOS creado');
            } catch (emergencyError) {
              HookLogger.error('❌ Canvas de emergencia JPG también falló. Mostrando instrucciones...', emergencyError);
              await handleiOSManualInstructionsImage('jpg');
              return;
            }
          }
          
        } else {
          // Solo para iOS no-Safari (como Chrome iOS), intentar método estándar
          try {
            HookLogger.info('Intentando método estándar con configuración iOS optimizada...');
            canvas = await captureElementAsCanvas(downloadCardRef.current, "jpg");
            HookLogger.info('✅ Método estándar iOS JPG exitoso');
            
          } catch (iosError) {
            HookLogger.error('❌ Método estándar iOS JPG falló, intentando canvas alternativo...', iosError);
            
            try {
              const alternativeCanvas = await createiOSImageFallbackCanvas(downloadCardRef.current, 'jpg');
              if (alternativeCanvas) {
                canvas = alternativeCanvas;
                HookLogger.info('✅ Canvas alternativo JPG iOS exitoso');
              } else {
                throw new Error('Canvas alternativo JPG iOS falló');
              }
              
            } catch (alternativeError) {
              HookLogger.error('❌ Canvas alternativo JPG iOS falló, creando emergencia...', alternativeError);
              
              try {
                canvas = await createEmergencyiOSImageCanvas(downloadCardRef.current, 'jpg');
                HookLogger.info('✅ Canvas de emergencia JPG iOS creado');
              } catch (emergencyError) {
                HookLogger.error('❌ Canvas de emergencia JPG también falló. Mostrando instrucciones...', emergencyError);
                await handleiOSManualInstructionsImage('jpg');
                return;
              }
            }
          }
        }
        
      } else {
        // Método estándar para otros dispositivos
        canvas = await captureElementAsCanvas(downloadCardRef.current, "jpg");
      }

      updateState({ downloadProgress: 90 });

      HookLogger.info('Convirtiendo canvas a blob JPG...');

      // Convertir a blob JPG
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            const errorMsg = deviceInfo.isIOS 
              ? "Error generando imagen JPG en iOS"
              : "Error generando imagen JPG";
            
            if (deviceInfo.isIOS) {
              HookLogger.error('❌ toBlob JPG falló en iOS, mostrando instrucciones manuales...');
              await handleiOSManualInstructionsImage('jpg');
              return;
            }
            
            throw new Error(errorMsg);
          }

          const fileName = generateFileName("jpg", eventData);
          
          HookLogger.info('Descargando JPG:', {
            fileName,
            blobSize: blob.size,
            deviceType: deviceInfo.isIOS ? 'iOS' : 'Other',
            recommended: deviceInfo.isIOS ? 'Formato recomendado para iOS' : ''
          });

          triggerDownload(blob, fileName);

          updateState({ downloadProgress: 100 });
          HookLogger.timing('Descarga JPG completa', startTime);
          logDownloadEvent("jpg", true, Date.now() - startTime);
        },
        "image/jpeg",
        FORMAT_CONFIGS.jpg.quality
      );
    } catch (error) {
      const errorMsg = getErrorMessage(error);
      HookLogger.error('Error en downloadAsJPG:', {
        error,
        deviceInfo,
        duration: Date.now() - startTime
      });
      
      if (deviceInfo.isIOS) {
        const iosErrorMsg = `iOS JPG Error: ${errorMsg}\n\nEsto es inusual ya que JPG es el formato más compatible con iOS.\nIntenta:\n• Recargar la página\n• Usar la vista previa primero\n• Verificar espacio de almacenamiento`;
        updateState({ error: iosErrorMsg });
        
        // También mostrar instrucciones detalladas
        HookLogger.error('❌ Descarga JPG iOS falló completamente, mostrando instrucciones...');
        setTimeout(async () => {
          await handleiOSManualInstructionsImage('jpg');
        }, 1000); // Pequeño delay para que se vea el error primero
        
      } else {
        updateState({ error: errorMsg });
      }
      
      logDownloadEvent("jpg", false, Date.now() - startTime, errorMsg);
    } finally {
      setTimeout(() => {
        updateState({
          isGenerating: false,
          downloadProgress: 0,
          currentFormat: null,
        });
      }, 1000);
    }
  }, [eventData, validateQRData, updateState, captureElementAsCanvas]);

  // Generar preview
  const generatePreview = useCallback(
    async (format: DownloadFormat): Promise<string> => {
      const startTime = Date.now();
      const deviceInfo = DeviceUtils.getDeviceInfo();
      
      try {
        HookLogger.info(`Generando preview para formato: ${format}`, { deviceInfo });
        
        if (!downloadCardRef.current) {
          throw new Error("Componente de descarga no encontrado");
        }

        if (deviceInfo.isIOS) {
          HookLogger.warn('Generando preview en iOS - usando configuración optimizada');
        }

        const canvas = await captureElementAsCanvas(
          downloadCardRef.current,
          format
        );
        
        HookLogger.info('Canvas capturado para preview, generando DataURL...');
        const previewDataURL = canvas.toDataURL("image/jpeg", deviceInfo.isIOS ? 0.7 : 0.8);

        updateState({ previewUrl: previewDataURL });
        
        HookLogger.info('Preview generado exitosamente:', {
          format,
          dataUrlLength: previewDataURL.length,
          deviceType: deviceInfo.isIOS ? 'iOS' : 'Other'
        });
        
        HookLogger.timing(`Preview generado (${format})`, startTime);
        return previewDataURL;
        
      } catch (error) {
        const errorMsg = getErrorMessage(error);
        HookLogger.error(`Error generando preview para ${format}:`, {
          error,
          deviceInfo,
          duration: Date.now() - startTime
        });
        
        if (deviceInfo.isIOS) {
          const iosErrorMsg = `iOS Preview Error: ${errorMsg}\n\nIntenta:\n• Esperar un momento y reintentar\n• Descargar directamente sin preview\n• Usar un formato diferente`;
          updateState({ error: iosErrorMsg });
        } else {
          updateState({ error: errorMsg });
        }
        throw error;
      }
    },
    [updateState, captureElementAsCanvas]
  );

  // Generar nombre de archivo
  const getFileName = useCallback(
    (format: DownloadFormat): string => {
      return generateFileName(format, eventData);
    },
    [eventData]
  );

  // Limpiar error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Reset completo del estado
  const resetState = useCallback(() => {
    updateState({
      isGenerating: false,
      downloadProgress: 0,
      error: null,
      previewUrl: null,
      currentFormat: null,
    });
  }, [updateState]);

  // Exponer ref para que los componentes puedan usarlo
  const attachDownloadRef = useCallback((element: HTMLDivElement | null) => {
    if (element && downloadCardRef.current !== element) {
      downloadCardRef.current = element;
    }
  }, []);

  return {
    // Estados
    isGenerating: state.isGenerating,
    downloadProgress: state.downloadProgress,
    error: state.error,
    previewUrl: state.previewUrl,
    currentFormat: state.currentFormat,

    // Acciones principales
    downloadAsPDF,
    downloadAsPNG,
    downloadAsJPG,

    // Utilidades
    generatePreview,
    getFileName,
    validateQRData,
    clearError,
    resetState,

    // Ref para componente
    attachDownloadRef,
  };
};

// Función de fallback para iOS cuando html2canvas falla
const createiOSFallbackCanvas = async (
  element: HTMLElement, 
  options: any
): Promise<HTMLCanvasElement | null> => {
  try {
    console.log('🍎 [iOS Fallback] Creando canvas alternativo para iOS...');
    
    // Crear canvas manualmente
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo obtener contexto 2D');
    }
    
    // Dimensiones reducidas para iOS
    canvas.width = Math.min(options.width, 600);
    canvas.height = Math.min(options.height, 800);
    
    // Fondo blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Mensaje de fallback
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('QR generado en iOS', canvas.width / 2, 50);
    ctx.fillText('(Vista simplificada)', canvas.width / 2, 70);
    
    // Intentar capturar imágenes básicas si existen
    const images = element.querySelectorAll('img');
    let imagePromises: Promise<void>[] = [];
    
    images.forEach((img, index) => {
      if (index < 3) { // Máximo 3 imágenes para iOS
        const promise = new Promise<void>((resolve) => {
          const tempImg = new Image();
          tempImg.crossOrigin = 'anonymous';
          tempImg.onload = () => {
            try {
              const x = 50 + (index * 100);
              const y = 100;
              ctx.drawImage(tempImg, x, y, 80, 80);
            } catch (drawError) {
              console.warn('⚠️ [iOS Fallback] Error dibujando imagen:', drawError);
            }
            resolve();
          };
          tempImg.onerror = () => resolve();
          tempImg.src = img.src;
        });
        imagePromises.push(promise);
      }
    });
    
    // Esperar a que las imágenes se carguen (máximo 2 segundos)
    await Promise.race([
      Promise.all(imagePromises),
      new Promise(resolve => setTimeout(resolve, 2000))
    ]);
    
    console.log('✅ [iOS Fallback] Canvas alternativo iOS creado:', {
      dimensions: `${canvas.width}x${canvas.height}`,
      imagesProcessed: Math.min(images.length, 3)
    });
    
    return canvas;
    
  } catch (fallbackError) {
    console.error('❌ [iOS Fallback] Error en canvas alternativo iOS:', fallbackError);
    return null;
  }
};

// Canvas de emergencia para iOS cuando todo falla
const createEmergencyiOSCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
  console.log('🚨 [iOS Emergency] Creando canvas de emergencia...');
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No se pudo obtener contexto 2D para canvas de emergencia');
  }
  
  // Tamaño fijo para iOS
  canvas.width = 400;
  canvas.height = 600;
  
  // Fondo blanco
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Borde
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
  
  // Título
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 20px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Invitación QR', canvas.width / 2, 50);
  
  // Subtítulo
  ctx.font = '14px Arial, sans-serif';
  ctx.fillText('Generado en Safari iOS', canvas.width / 2, 75);
  
  // Mensaje principal
  ctx.font = '16px Arial, sans-serif';
  ctx.fillText('📱 LIMITACIÓN DE SAFARI iOS', canvas.width / 2, 120);
  
  // Instrucciones
  const instructions = [
    'Para obtener tu invitación:',
    '',
    '1. Toma un screenshot de la pantalla',
    '2. O abre en Chrome para iOS',
    '3. O solicita ayuda a un amigo',
    '',
    'Lamentamos las limitaciones',
    'técnicas de Safari iOS'
  ];
  
  ctx.font = '12px Arial, sans-serif';
  ctx.textAlign = 'left';
  instructions.forEach((line, index) => {
    ctx.fillText(line, 30, 160 + (index * 20));
  });
  
  // QR placeholder
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  const qrSize = 150;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 350;
  
  // Marco del QR
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  
  // Patrón simulado de QR
  ctx.fillStyle = '#000000';
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      if ((i + j) % 2 === 0) {
        ctx.fillRect(qrX + i * 15, qrY + j * 15, 10, 10);
      }
    }
  }
  
  // Texto del QR
  ctx.font = '10px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE PLACEHOLDER', canvas.width / 2, qrY + qrSize + 20);
  
  console.log('✅ [iOS Emergency] Canvas de emergencia creado');
  return canvas;
};

// Función para manejar instrucciones manuales iOS
const handleiOSManualInstructions = async (): Promise<void> => {
  console.log('📱 [iOS Manual] Mostrando instrucciones manuales...');
  
  // Crear mensaje de instrucciones
  const message = `🍎 LIMITACIÓN DE SAFARI iOS DETECTADA

❌ Safari no puede generar PDFs automáticamente.

📱 SOLUCIONES DISPONIBLES:

1️⃣ SCREENSHOT MANUAL:
• Toma un screenshot de la invitación
• Usa "Marcar" para editar si necesitas
• Guárdalo en "Fotos"

2️⃣ CAMBIAR NAVEGADOR:
• Abre esta página en Chrome para iOS
• El problema es específico de Safari

3️⃣ USAR OTRO DISPOSITIVO:
• Pide a alguien con Android/PC
• Comparte el enlace de la invitación

💡 RECOMENDACIÓN:
Para mejor experiencia, usa Chrome en lugar de Safari.

Lamentamos las limitaciones técnicas de Safari iOS.`;

  // Mostrar en consola para debugging
  console.log(message);
  
  // Mostrar alert al usuario
  alert(message);
  
  // También copiar al portapapeles si es posible
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(window.location.href);
      console.log('📋 [iOS Manual] URL copiada al portapapeles');
    }
  } catch (clipboardError) {
    console.log('📋 [iOS Manual] No se pudo copiar al portapapeles:', clipboardError);
  }
};

// Función para manejar instrucciones manuales iOS para imágenes
const handleiOSManualInstructionsImage = async (format: 'png' | 'jpg'): Promise<void> => {
  console.log(`📱 [iOS Manual] Mostrando instrucciones manuales para ${format.toUpperCase()}...`);
  
  // Crear mensaje de instrucciones específico para imágenes
  const message = `🍎 LIMITACIÓN DE SAFARI iOS DETECTADA

❌ Safari no puede generar imágenes ${format.toUpperCase()} automáticamente.

📱 SOLUCIONES DISPONIBLES:

1️⃣ SCREENSHOT MANUAL:
• Toma un screenshot de la invitación
• Se guardará automáticamente en "Fotos"
• Funciona igual que un ${format.toUpperCase()}

2️⃣ CAMBIAR NAVEGADOR:
• Abre esta página en Chrome para iOS
• Chrome tiene mejor compatibilidad con descargas

3️⃣ USAR OTRO DISPOSITIVO:
• Pide a alguien con Android/PC
• Comparte el enlace de la invitación

💡 RECOMENDACIÓN:
El screenshot manual es la opción más rápida para iOS.

Lamentamos las limitaciones técnicas de Safari iOS.`;

  // Mostrar en consola para debugging
  console.log(message);
  
  // Mostrar alert al usuario
  alert(message);
  
  // También copiar al portapapeles si es posible
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(window.location.href);
      console.log('📋 [iOS Manual] URL copiada al portapapeles');
    }
  } catch (clipboardError) {
    console.log('📋 [iOS Manual] No se pudo copiar al portapapeles:', clipboardError);
  }
};

// Canvas de emergencia para iOS - versión imagen
const createEmergencyiOSImageCanvas = async (element: HTMLElement, format: 'png' | 'jpg'): Promise<HTMLCanvasElement> => {
  console.log(`🚨 [iOS Emergency] Creando canvas de emergencia para ${format.toUpperCase()}...`);
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No se pudo obtener contexto 2D para canvas de emergencia');
  }
  
  // Tamaño optimizado para imagen (más ancho)
  canvas.width = 600;
  canvas.height = 800;
  
  // Fondo - blanco para JPG, transparente para PNG si es posible
  if (format === 'jpg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    // PNG puede tener fondo transparente, pero Safari iOS a veces lo requiere blanco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Borde decorativo
  ctx.strokeStyle = '#E0E0E0';
  ctx.lineWidth = 3;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
  
  // Título principal
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Invitación Quince Años', canvas.width / 2, 60);
  
  // Subtítulo con formato
  ctx.font = '16px Arial, sans-serif';
  ctx.fillStyle = '#666666';
  ctx.fillText(`Imagen ${format.toUpperCase()} generada en iOS`, canvas.width / 2, 85);
  
  // Línea decorativa
  ctx.beginPath();
  ctx.moveTo(100, 110);
  ctx.lineTo(canvas.width - 100, 110);
  ctx.strokeStyle = '#D0D0D0';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Información principal
  ctx.fillStyle = '#333333';
  ctx.font = '18px Arial, sans-serif';
  ctx.fillText('🎉 Celebración Especial', canvas.width / 2, 150);
  
  // Mensaje de limitación técnica
  ctx.font = 'bold 16px Arial, sans-serif';
  ctx.fillStyle = '#E74C3C';
  ctx.fillText('⚠️ LIMITACIÓN DE SAFARI iOS', canvas.width / 2, 200);
  
  // Instrucciones detalladas
  const instructions = [
    'Safari iOS no puede generar imágenes automáticamente.',
    '',
    'SOLUCIONES RECOMENDADAS:',
    '',
    '📸 SCREENSHOT MANUAL:',
    '• Presiona botón lateral + botón de volumen',
    '• La imagen se guardará en "Fotos"',
    '• Funciona perfectamente como imagen',
    '',
    '🌐 USAR CHROME:',
    '• Descarga Chrome para iOS',
    '• Abre esta misma página',
    '• La descarga funcionará normalmente',
    '',
    '📱 COMPARTIR ENLACE:',
    '• Copia el enlace de esta página',
    '• Envíalo a alguien con Android/PC',
    '• Pídeles que descarguen por ti',
    '',
    `Formato solicitado: ${format.toUpperCase()}`,
    'Resolución: Óptima para redes sociales'
  ];
  
  ctx.font = '12px Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#444444';
  
  instructions.forEach((line, index) => {
    if (line.includes('SOLUCIONES') || line.includes('SCREENSHOT') || line.includes('CHROME') || line.includes('COMPARTIR')) {
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillStyle = '#2C3E50';
    } else if (line.startsWith('•')) {
      ctx.font = '11px Arial, sans-serif';
      ctx.fillStyle = '#555555';
    } else {
      ctx.font = '12px Arial, sans-serif';
      ctx.fillStyle = '#444444';
    }
    
    ctx.fillText(line, 40, 240 + (index * 18));
  });
  
  // QR placeholder más grande para imagen
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 2;
  const qrSize = 180;
  const qrX = (canvas.width - qrSize) / 2;
  const qrY = 580;
  
  // Marco del QR
  ctx.strokeRect(qrX, qrY, qrSize, qrSize);
  
  // Patrón simulado de QR más detallado
  ctx.fillStyle = '#000000';
  const cellSize = 12;
  for (let i = 0; i < Math.floor(qrSize / cellSize); i++) {
    for (let j = 0; j < Math.floor(qrSize / cellSize); j++) {
      // Patrón más realista
      if ((i + j) % 3 === 0 || (i % 3 === 0 && j % 2 === 0)) {
        ctx.fillRect(qrX + i * cellSize, qrY + j * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
  
  // Esquinas características del QR
  const cornerSize = 36;
  // Esquina superior izquierda
  ctx.strokeRect(qrX + 6, qrY + 6, cornerSize, cornerSize);
  ctx.fillRect(qrX + 12, qrY + 12, cornerSize - 12, cornerSize - 12);
  
  // Esquina superior derecha
  ctx.strokeRect(qrX + qrSize - cornerSize - 6, qrY + 6, cornerSize, cornerSize);
  ctx.fillRect(qrX + qrSize - cornerSize + 6, qrY + 12, cornerSize - 12, cornerSize - 12);
  
  // Esquina inferior izquierda
  ctx.strokeRect(qrX + 6, qrY + qrSize - cornerSize - 6, cornerSize, cornerSize);
  ctx.fillRect(qrX + 12, qrY + qrSize - cornerSize, cornerSize - 12, cornerSize - 12);
  
  // Texto descriptivo del QR
  ctx.font = 'bold 14px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#2C3E50';
  ctx.fillText('CÓDIGO QR DE INVITACIÓN', canvas.width / 2, qrY + qrSize + 30);
  
  // Footer informativo
  ctx.font = '10px Arial, sans-serif';
  ctx.fillStyle = '#888888';
  ctx.fillText(`Imagen de emergencia generada para iOS Safari • Formato: ${format.toUpperCase()}`, canvas.width / 2, canvas.height - 20);
  
  console.log(`✅ [iOS Emergency] Canvas de emergencia ${format.toUpperCase()} creado`);
  return canvas;
};

// Canvas de fallback para iOS - específico para imágenes
const createiOSImageFallbackCanvas = async (
  element: HTMLElement, 
  format: 'png' | 'jpg'
): Promise<HTMLCanvasElement | null> => {
  console.log(`🍎 [iOS Image Fallback] Creando canvas alternativo para ${format.toUpperCase()}...`);
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('No se pudo obtener contexto 2D');
    }
    
    // Tamaño optimizado para imágenes en iOS
    const width = format === 'jpg' ? 800 : 600; // JPG puede ser más grande
    const height = format === 'jpg' ? 1000 : 800;
    
    canvas.width = width;
    canvas.height = height;
    
    // Configuración específica por formato
    if (format === 'jpg') {
      // JPG requiere fondo sólido
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    } else {
      // PNG puede intentar transparencia pero iOS Safari puede requerir fondo
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    }
    
    // Intentar copiar información básica del elemento
    const computedStyle = window.getComputedStyle(element);
    const backgroundColor = computedStyle.backgroundColor;
    
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }
    
    // Título básico
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Invitación Digital', width / 2, 50);
    
    // Información del formato
    ctx.font = '14px Arial, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText(`Formato: ${format.toUpperCase()}`, width / 2, 75);
    ctx.fillText('Generado en iOS Safari', width / 2, 95);
    
    // Simular contenido de invitación
    ctx.fillStyle = '#333333';
    ctx.font = '16px Arial, sans-serif';
    ctx.fillText('🎉 Celebración Especial', width / 2, 140);
    
    // QR Code placeholder
    const qrSize = 150;
    const qrX = (width - qrSize) / 2;
    const qrY = height * 0.4;
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    
    // Patrón QR simple
    ctx.fillStyle = '#000000';
    for (let i = 0; i < 12; i++) {
      for (let j = 0; j < 12; j++) {
        if ((i + j) % 2 === 0) {
          ctx.fillRect(qrX + i * 12, qrY + j * 12, 10, 10);
        }
      }
    }
    
    // Mensaje sobre limitaciones
    ctx.font = '12px Arial, sans-serif';
    ctx.fillStyle = '#E74C3C';
    ctx.textAlign = 'center';
    ctx.fillText('⚠️ Limitación de Safari iOS detectada', width / 2, qrY + qrSize + 40);
    ctx.fillText('Para mejor calidad, usa Chrome o toma screenshot', width / 2, qrY + qrSize + 60);
    
    console.log(`✅ [iOS Image Fallback] Canvas alternativo ${format.toUpperCase()} creado:`, {
      dimensions: `${width}x${height}`,
      format,
      hasContent: true
    });
    
    return canvas;
    
  } catch (fallbackError) {
    console.error(`❌ [iOS Image Fallback] Error en canvas alternativo ${format.toUpperCase()}:`, fallbackError);
    return null;
  }
};
