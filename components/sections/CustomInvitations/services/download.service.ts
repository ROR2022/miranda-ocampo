// ================================================================
// 📁 services/download.service.ts
// ================================================================

import { FormData, DownloadCallbacks, Html2CanvasOptions } from '../types/invitation.types';
import { generateFileName } from '../utils/invitation.utils';
import { DOWNLOAD_CONFIG, VALIDATION_MESSAGES } from '../constants/invitation.constants';

// Declaración global para html2canvas
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    html2canvas: any;
  }
}

/**
 * Servicio para manejar la descarga de invitaciones como imagen
 */
export class DownloadService {
  /**
   * Carga dinámicamente la librería html2canvas
   * @returns Instancia de html2canvas
   */
  private static async loadHtml2Canvas() {
    if (typeof window !== 'undefined' && !window.html2canvas) {
      try {
        const html2canvas = await import('html2canvas');
        window.html2canvas = html2canvas.default;
      } catch (importError) {
        console.error('Failed to load html2canvas:', importError);
        throw new Error('No se pudo cargar html2canvas. Asegúrate de que esté instalado.');
      }
    }
    return window.html2canvas;
  }

  /**
   * Configura las opciones para html2canvas
   * @param element - Elemento HTML a capturar
   * @returns Opciones configuradas
   */
  private static getHtml2CanvasOptions(element: HTMLElement): Html2CanvasOptions {
    return {
      scale: DOWNLOAD_CONFIG.SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: null,
      width: element.offsetWidth,
      height: element.offsetHeight,
      scrollX: 0,
      scrollY: 0,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight
    };
  }

  /**
   * Crea y ejecuta la descarga del archivo
   * @param canvas - Canvas con la imagen
   * @param fileName - Nombre del archivo
   * @param onSuccess - Callback de éxito
   */
  private static handleDownload(
    canvas: HTMLCanvasElement, 
    fileName: string, 
    onSuccess: () => void
  ): void {
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("No se pudo generar la imagen");
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = fileName;
      
      // Agregar temporalmente al DOM para la descarga
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar la URL del blob después de un momento
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      // Mostrar mensaje de éxito
      alert(`✅ ${VALIDATION_MESSAGES.DOWNLOAD_SUCCESS} "${fileName}"!`);
      onSuccess();
      
    }, DOWNLOAD_CONFIG.FORMAT, DOWNLOAD_CONFIG.QUALITY);
  }

  /**
   * Valida que el elemento y los datos sean válidos para la descarga
   * @param element - Elemento a validar
   * @param formData - Datos del formulario a validar
   */
  private static validateDownloadRequirements(
    element: HTMLElement | null,
    formData: FormData
  ): void {
    if (!element) {
      throw new Error("No se pudo encontrar la invitación para descargar");
    }

    if (!formData.guestName || !formData.personalMessage || !formData.numberOfGuests) {
      throw new Error(VALIDATION_MESSAGES.DOWNLOAD_REQUIRED_FIELDS);
    }
  }

  /**
   * Descarga la invitación como imagen PNG
   * @param element - Elemento HTML que contiene la invitación
   * @param formData - Datos del formulario para generar el nombre del archivo
   * @param callbacks - Callbacks para manejar el estado de la descarga
   */
  static async downloadInvitation(
    element: HTMLElement | null,
    formData: FormData,
    callbacks: DownloadCallbacks
  ): Promise<void> {
    const { onStart, onSuccess, onError } = callbacks;
    
    onStart();

    try {
      // Validaciones iniciales
      this.validateDownloadRequirements(element, formData);
      
      // Cargar html2canvas
      const html2canvas = await this.loadHtml2Canvas();
      
      if (!element) {
        throw new Error("Elemento no encontrado después de la validación");
      }

      // Configurar opciones y capturar
      const options = this.getHtml2CanvasOptions(element);
      const canvas = await html2canvas(element, options);

      // Generar nombre de archivo y descargar
      const fileName = generateFileName(formData.guestName);
      this.handleDownload(canvas, fileName, onSuccess);

    } catch (error) {
      console.error("Error al descargar:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error desconocido al generar la imagen";
      
      onError(errorMessage);
      alert(`❌ ${VALIDATION_MESSAGES.DOWNLOAD_ERROR}: ${errorMessage}`);
    }
  }

  /**
   * Verifica si html2canvas está disponible
   * @returns Promise que resuelve true si está disponible
   */
  static async isHtml2CanvasAvailable(): Promise<boolean> {
    try {
      await this.loadHtml2Canvas();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene información sobre el canvas generado
   * @param element - Elemento a analizar
   * @returns Información del canvas que se generaría
   */
  static getCanvasInfo(element: HTMLElement): {
    width: number;
    height: number;
    scaledWidth: number;
    scaledHeight: number;
  } {
    const width = element.offsetWidth;
    const height = element.offsetHeight;
    
    return {
      width,
      height,
      scaledWidth: width * DOWNLOAD_CONFIG.SCALE,
      scaledHeight: height * DOWNLOAD_CONFIG.SCALE
    };
  }

  /**
   * Estima el tamaño del archivo que se generará
   * @param element - Elemento a analizar
   * @returns Tamaño estimado en KB
   */
  static estimateFileSize(element: HTMLElement): number {
    const canvasInfo = this.getCanvasInfo(element);
    const pixels = canvasInfo.scaledWidth * canvasInfo.scaledHeight;
    
    // Estimación aproximada: 4 bytes por pixel (RGBA) comprimido a ~30%
    const estimatedBytes = pixels * 4 * 0.3;
    return Math.round(estimatedBytes / 1024); // KB
  }
}