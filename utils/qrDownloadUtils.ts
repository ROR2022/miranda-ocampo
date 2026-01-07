// 💾 Utilidades para descarga directa de códigos QR

/**
 * Convierte un dataURL a Blob
 */
export const dataURLToBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Trigger de descarga de un blob
 */
export const triggerBlobDownload = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = fileName;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Descarga un QR como PNG desde dataURL
 */
export const downloadQRAsPNG = (qrDataURL: string, fileName: string): void => {
  try {
    const blob = dataURLToBlob(qrDataURL);
    const pngFileName = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
    triggerBlobDownload(blob, pngFileName);
  } catch (error) {
    console.error('Error descargando PNG:', error);
    throw new Error('No se pudo descargar el archivo PNG');
  }
};

/**
 * Descarga un QR como JPG desde dataURL
 */
export const downloadQRAsJPG = (qrDataURL: string, fileName: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Crear canvas temporal para convertir PNG a JPG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Configurar canvas
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }
        
        // Fondo blanco para JPG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar QR
        ctx.drawImage(img, 0, 0);
        
        // Convertir a JPG
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('No se pudo generar el blob JPG'));
              return;
            }
            
            const jpgFileName = fileName.endsWith('.jpg') ? fileName : `${fileName}.jpg`;
            triggerBlobDownload(blob, jpgFileName);
            resolve();
          },
          'image/jpeg',
          0.9 // Calidad 90%
        );
      };
      
      img.onerror = () => {
        reject(new Error('No se pudo cargar la imagen QR'));
      };
      
      img.src = qrDataURL;
    } catch (error) {
      console.error('Error descargando JPG:', error);
      reject(new Error('No se pudo descargar el archivo JPG'));
    }
  });
};

/**
 * Valida si el navegador soporta descarga de archivos
 */
export const isDownloadSupported = (): boolean => {
  // Verificar soporte de Blob y URL.createObjectURL
  return !!(window.Blob && window.URL && window.URL.createObjectURL);
};

/**
 * Crea un mensaje de confirmación de descarga
 */
export const createDownloadMessage = (format: 'png' | 'jpg', fileName: string): string => {
  return `✅ QR descargado exitosamente como ${format.toUpperCase()}: ${fileName}`;
};

/**
 * Maneja errores de descarga con mensajes amigables
 */
export const handleDownloadError = (error: Error, format: 'png' | 'jpg'): string => {
  console.error(`Error descargando ${format.toUpperCase()}:`, error);
  
  if (error.message.includes('blob')) {
    return `❌ Error generando archivo ${format.toUpperCase()}. Intenta nuevamente.`;
  }
  
  if (error.message.includes('canvas')) {
    return `❌ Error procesando imagen. Tu navegador podría no soportar esta función.`;
  }
  
  return `❌ Error descargando archivo ${format.toUpperCase()}. Verifica tu conexión e intenta nuevamente.`;
};
