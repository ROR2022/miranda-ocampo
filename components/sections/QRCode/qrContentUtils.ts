// 🎯 Utilidades para detección y manejo de contenido QR - Aurora VIP Design

import type { ContentTypeDetection } from './ReadQR.types';

// 🔍 Detectar tipo de contenido
export function detectContentType(content: string): ContentTypeDetection {
  const trimmedContent = content.trim();
  
  if (isURL(trimmedContent)) {
    return {
      type: 'url',
      isValid: true,
      actions: ['open', 'copy']
    };
  }
  
  if (isEmail(trimmedContent)) {
    return {
      type: 'email',
      isValid: true,
      actions: ['mailto', 'copy']
    };
  }
  
  if (isPhone(trimmedContent)) {
    return {
      type: 'phone',
      isValid: true,
      actions: ['call', 'copy']
    };
  }
  
  // Si no es ningún tipo específico, es texto
  return {
    type: 'text',
    isValid: true,
    actions: ['copy']
  };
}

// 🌐 Validar URL
export function isURL(text: string): boolean {
  try {
    // Agregar protocolo si no existe
    const urlToTest = text.includes('://') ? text : `https://${text}`;
    const url = new URL(urlToTest);
    return ['http:', 'https:', 'ftp:', 'ftps:'].includes(url.protocol);
  } catch {
    return false;
  }
}

// 📧 Validar email
export function isEmail(text: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(text);
}

// 📞 Validar teléfono
export function isPhone(text: string): boolean {
  // Eliminar espacios, guiones y paréntesis
  const cleanPhone = text.replace(/[\s\-\(\)]/g, '');
  
  // Verificar si contiene solo números y signos + al inicio
  const phoneRegex = /^\+?[0-9]{7,15}$/;
  return phoneRegex.test(cleanPhone);
}

// 🔧 Normalizar contenido
export function normalizeContent(content: string, type: string): string {
  switch (type) {
    case 'url':
      return content.includes('://') ? content : `https://${content}`;
    
    case 'email':
      return content.toLowerCase();
    
    case 'phone':
      // Mantener formato original para mostrar
      return content;
    
    default:
      return content;
  }
}

// 🎬 Manejar acciones de contenido
export async function handleContentAction(action: string, content: string): Promise<void> {
  switch (action) {
    case 'open':
      if (isURL(content)) {
        const url = normalizeContent(content, 'url');
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      break;
    
    case 'mailto':
      if (isEmail(content)) {
        window.location.href = `mailto:${content}`;
      }
      break;
    
    case 'call':
      if (isPhone(content)) {
        window.location.href = `tel:${content}`;
      }
      break;
    
    case 'copy':
      await copyToClipboard(content);
      break;
    
    default:
      console.warn(`Acción no reconocida: ${action}`);
  }
}

// 📋 Copiar al portapapeles
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback para navegadores más antiguos
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Error copiando al portapapeles:', error);
    return false;
  }
}

// 🔗 Extraer dominio de URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(isURL(url) ? normalizeContent(url, 'url') : url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

// 📊 Obtener información del contenido
export function getContentInfo(content: string): {
  type: string;
  displayText: string;
  actions: string[];
  isValid: boolean;
} {
  const detection = detectContentType(content);
  let displayText = content;
  
  switch (detection.type) {
    case 'url':
      displayText = extractDomain(content);
      break;
    case 'email':
    case 'phone':
    case 'text':
    default:
      displayText = content.length > 50 
        ? `${content.substring(0, 50)}...` 
        : content;
  }
  
  return {
    type: detection.type,
    displayText,
    actions: detection.actions,
    isValid: detection.isValid
  };
}
