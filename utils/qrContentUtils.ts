// 🔍 Utilidades para detección y manejo de contenido QR

import { ContentTypeDetection } from '@/components/sections/QRCode/ReadQR.types';

/**
 * Detecta el tipo de contenido de un QR y proporciona acciones apropiadas
 */
export const detectContentType = (content: string): ContentTypeDetection => {
  if (!content || content.trim().length === 0) {
    return {
      type: 'unknown',
      isValid: false,
      actions: []
    };
  }

  const trimmedContent = content.trim();

  // Detectar URLs
  if (isURL(trimmedContent)) {
    return {
      type: 'url',
      isValid: true,
      actions: ['open', 'copy']
    };
  }

  // Detectar emails
  if (isEmail(trimmedContent)) {
    return {
      type: 'email',
      isValid: true,
      actions: ['mailto', 'copy']
    };
  }

  // Detectar teléfonos
  if (isPhone(trimmedContent)) {
    return {
      type: 'phone',
      isValid: true,
      actions: ['call', 'copy']
    };
  }

  // Fallback a texto
  return {
    type: 'text',
    isValid: true,
    actions: ['copy']
  };
};

/**
 * Valida si el contenido es una URL
 */
export const isURL = (content: string): boolean => {
  try {
    // Verificar protocolos comunes
    const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?(\?[;&a-z\d%_\.~+=-]*)?(#[-a-z\d_]*)?$/i;
    
    // Si ya tiene protocolo, verificar directamente
    if (/^https?:\/\//i.test(content)) {
      return urlRegex.test(content);
    }
    
    // Si no tiene protocolo, agregarlo temporalmente para validar
    return urlRegex.test(`https://${content}`);
  } catch {
    return false;
  }
};

/**
 * Valida si el contenido es un email
 */
export const isEmail = (content: string): boolean => {
  // Remover mailto: si existe
  const emailContent = content.replace(/^mailto:/i, '');
  
  // Regex mejorado para emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(emailContent);
};

/**
 * Valida si el contenido es un teléfono
 */
export const isPhone = (content: string): boolean => {
  // Remover tel: si existe
  const phoneContent = content.replace(/^tel:/i, '');
  
  // Regex para números de teléfono (internacional y nacional)
  const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,}$/;
  return phoneRegex.test(phoneContent.replace(/\s/g, ''));
};

/**
 * Normaliza una URL agregando protocolo si es necesario
 */
export const normalizeURL = (url: string): string => {
  const trimmedUrl = url.trim();
  
  if (/^https?:\/\//i.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  return `https://${trimmedUrl}`;
};

/**
 * Normaliza un email agregando mailto: si es necesario
 */
export const normalizeEmail = (email: string): string => {
  const trimmedEmail = email.trim().replace(/^mailto:/i, '');
  return `mailto:${trimmedEmail}`;
};

/**
 * Normaliza un teléfono agregando tel: si es necesario
 */
export const normalizePhone = (phone: string): string => {
  const trimmedPhone = phone.trim().replace(/^tel:/i, '');
  return `tel:${trimmedPhone}`;
};

/**
 * Abre una URL en una nueva ventana
 */
export const openURL = (url: string): void => {
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Error abriendo URL:', error);
    // Fallback: copiar al clipboard
    copyToClipboard(url);
  }
};

/**
 * Abre el cliente de email predeterminado
 */
export const openEmail = (email: string): void => {
  try {
    window.location.href = email;
  } catch (error) {
    console.error('Error abriendo email:', error);
    // Fallback: copiar al clipboard
    copyToClipboard(email);
  }
};

/**
 * Abre la aplicación de teléfono
 */
export const openPhone = (phone: string): void => {
  try {
    window.location.href = phone;
  } catch (error) {
    console.error('Error abriendo teléfono:', error);
    // Fallback: copiar al clipboard
    copyToClipboard(phone);
  }
};

/**
 * Copia contenido al portapapeles
 */
export const copyToClipboard = async (content: string): Promise<boolean> => {
  try {
    // Usar Clipboard API si está disponible
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(content);
      return true;
    }
    
    // Fallback para navegadores más antiguos
    const textArea = document.createElement('textarea');
    textArea.value = content;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return success;
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    return false;
  }
};

/**
 * Valida si un archivo es una imagen soportada
 */
export const isValidImageFile = (file: File): boolean => {
  const supportedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  return supportedTypes.includes(file.type);
};

/**
 * Valida el tamaño del archivo
 */
export const isValidFileSize = (file: File, maxSizeInMB: number = 10): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Obtiene un ícono apropiado para el tipo de contenido
 */
export const getContentTypeIcon = (type: string): string => {
  const icons = {
    url: '🌐',
    email: '📧',
    phone: '📞',
    text: '📝',
    unknown: '❓'
  };
  
  return icons[type as keyof typeof icons] || icons.unknown;
};

/**
 * Obtiene un mensaje descriptivo para el tipo de contenido
 */
export const getContentTypeDescription = (type: string): string => {
  const descriptions = {
    url: 'Enlace web detectado',
    email: 'Dirección de correo detectada',
    phone: 'Número de teléfono detectado',
    text: 'Contenido de texto',
    unknown: 'Contenido no reconocido'
  };
  
  return descriptions[type as keyof typeof descriptions] || descriptions.unknown;
};
