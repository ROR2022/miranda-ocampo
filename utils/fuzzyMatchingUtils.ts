/**
 * 🎯 Utilidades de Fuzzy Matching para Sistema de Confirmación Automática
 * 
 * Este módulo implementa algoritmos de búsqueda inteligente para encontrar
 * coincidencias de nombres de invitados, incluso con errores de tipeo o variaciones.
 * 
 * Funcionalidades:
 * - Normalización de texto (acentos, espacios, case)
 * - Algoritmo Levenshtein Distance para calcular similitud
 * - Búsqueda inteligente con threshold configurable
 * - Manejo de casos edge y múltiples coincidencias
 * 
 * @author Sistema de Invitaciones VIP
 * @date 26 de agosto, 2025
 * @version 1.0
 */

import { IGuest } from '@/models/Guest';

// 🎚️ Configuración del sistema
export const FUZZY_CONFIG = {
  SIMILARITY_THRESHOLD: 80, // Porcentaje mínimo para considerar match
  MIN_NAME_LENGTH: 2,       // Longitud mínima del nombre
  MAX_NAME_LENGTH: 100,     // Longitud máxima del nombre
  EXACT_MATCH_BONUS: 5      // Bonus para coincidencias exactas (case insensitive)
} as const;

// 📋 Interfaces para resultados de búsqueda
export interface MatchResult {
  guest: IGuest;
  similarity: number;
  isExactMatch: boolean;
  matchType: 'exact' | 'fuzzy' | 'partial';
  normalizedSearchName: string;
  normalizedGuestName: string;
  // Nuevos campos para búsqueda multi-campo
  matchMethod?: 'phone' | 'name' | 'name_with_phone_conflict';
  phoneMatch?: boolean;
  nameSimilarity?: number;
  hasConflict?: boolean;
}

export interface SearchStats {
  totalGuests: number;
  searchTime: number;
  candidatesEvaluated: number;
  bestSimilarity: number;
  matchFound: boolean;
}

/**
 * 🧹 Normaliza texto removiendo acentos, espacios extra y caracteres especiales
 * @param text - Texto a normalizar
 * @returns Texto normalizado para comparación
 */
export function normalizeText(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    // Convertir a minúsculas
    .toLowerCase()
    // Remover acentos y tildes
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remover caracteres especiales, mantener solo letras, números y espacios
    .replace(/[^a-z0-9\s]/g, ' ')
    // Remover espacios extra y trimear
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 🔢 Calcula la distancia de Levenshtein entre dos strings
 * 
 * El algoritmo de Levenshtein mide el número mínimo de operaciones
 * (inserción, eliminación, sustitución) necesarias para transformar
 * un string en otro.
 * 
 * @param str1 - Primer string
 * @param str2 - Segundo string
 * @returns Número de operaciones necesarias (0 = idénticos)
 */
export function levenshteinDistance(str1: string, str2: string): number {
  // Casos base
  if (str1 === str2) return 0;
  if (str1.length === 0) return str2.length;
  if (str2.length === 0) return str1.length;

  // Crear matriz de distancias
  const matrix: number[][] = [];
  
  // Inicializar primera fila y columna
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Llenar matriz con distancias mínimas
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        // Caracteres iguales, no hay costo
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        // Encontrar operación con menor costo
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // Sustitución
          matrix[i][j - 1] + 1,     // Inserción
          matrix[i - 1][j] + 1      // Eliminación
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * 📊 Calcula el porcentaje de similitud entre dos strings
 * 
 * Convierte la distancia de Levenshtein en un porcentaje de similitud
 * donde 100% = idénticos y 0% = completamente diferentes
 * 
 * @param str1 - Primer string
 * @param str2 - Segundo string
 * @returns Porcentaje de similitud (0-100)
 */
export function calculateSimilarity(str1: string, str2: string): number {
  // Normalizar strings para comparación justa
  const normalized1 = normalizeText(str1);
  const normalized2 = normalizeText(str2);

  // Casos especiales
  if (normalized1 === normalized2) return 100;
  if (!normalized1 || !normalized2) return 0;

  // Calcular distancia de Levenshtein
  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLength = Math.max(normalized1.length, normalized2.length);

  // Convertir a porcentaje de similitud
  const similarity = ((maxLength - distance) / maxLength) * 100;

  // Bonus para coincidencias exactas (ignorando case y acentos)
  if (normalized1 === normalized2) {
    return Math.min(100, similarity + FUZZY_CONFIG.EXACT_MATCH_BONUS);
  }

  return Math.max(0, Math.round(similarity * 100) / 100); // Redondear a 2 decimales
}

/**
 * 🔍 Busca palabras parciales dentro de un nombre más largo
 * 
 * Útil para casos como "María" que debería encontrar "María José González"
 * 
 * @param searchTerm - Término de búsqueda
 * @param fullName - Nombre completo donde buscar
 * @returns Porcentaje de coincidencia parcial
 */
function calculatePartialMatch(searchTerm: string, fullName: string): number {
  const normalizedSearch = normalizeText(searchTerm);
  const normalizedFull = normalizeText(fullName);

  if (!normalizedSearch || !normalizedFull) return 0;

  // Dividir nombres en palabras
  const searchWords = normalizedSearch.split(' ').filter(word => word.length > 1);
  const fullWords = normalizedFull.split(' ').filter(word => word.length > 1);

  if (searchWords.length === 0 || fullWords.length === 0) return 0;

  let totalSimilarity = 0;
  let matchedWords = 0;

  // Para cada palabra del término de búsqueda
  for (const searchWord of searchWords) {
    let bestWordMatch = 0;

    // Buscar la mejor coincidencia en el nombre completo
    for (const fullWord of fullWords) {
      const wordSimilarity = calculateSimilarity(searchWord, fullWord);
      bestWordMatch = Math.max(bestWordMatch, wordSimilarity);
    }

    // Si la palabra tiene suficiente similitud, contarla
    if (bestWordMatch >= 60) {
      totalSimilarity += bestWordMatch;
      matchedWords++;
    }
  }

  // Calcular promedio ponderado
  if (matchedWords === 0) return 0;

  const averageSimilarity = totalSimilarity / matchedWords;
  const completenessRatio = matchedWords / searchWords.length;

  return averageSimilarity * completenessRatio;
}

/**
 * 🎯 Búsqueda multi-campo: teléfono + nombre para mayor precisión
 * 
 * Estrategia inteligente:
 * 1. Buscar por teléfono primero (más confiable)
 * 2. Si no coincide, buscar por nombre con fuzzy matching
 * 3. Verificar compatibilidad entre nombre y teléfono
 * 
 * @param searchData - Datos de búsqueda (nombre y teléfono opcional)
 * @param guests - Array de invitados donde buscar
 * @returns Resultado detallado de la búsqueda
 */
export function findBestGuestMatchMultiField(
  searchData: { name: string; phone?: string },
  guests: IGuest[]
): MatchResult | null {
  const { name: searchName, phone: searchPhone } = searchData;
  
  // 🔍 Validaciones iniciales
  if (!searchName || typeof searchName !== 'string') {
    console.warn('🚨 Nombre de búsqueda inválido:', searchName);
    return null;
  }

  if (!guests || !Array.isArray(guests) || guests.length === 0) {
    console.warn('🚨 Array de invitados vacío o inválido');
    return null;
  }

  console.log(`🔍 Búsqueda multi-campo para "${searchName}"${searchPhone ? ` con teléfono ${searchPhone}` : ''}`);

  // 📱 PASO 1: Búsqueda por teléfono (si está disponible)
  if (searchPhone) {
    const normalizedSearchPhone = normalizePhoneNumber(searchPhone);
    
    for (const guest of guests) {
      if (guest.phone) {
        const normalizedGuestPhone = normalizePhoneNumber(guest.phone);
        
        if (normalizedSearchPhone === normalizedGuestPhone) {
          console.log(`📱 Match por teléfono encontrado: "${guest.name}" (${guest.phone})`);
          
          // Verificar si el nombre también es similar
          const nameSimilarity = calculateSimilarity(searchName, guest.name);
          
          return {
            guest,
            similarity: 100, // Teléfono es match perfecto
            isExactMatch: true,
            matchType: 'exact',
            normalizedSearchName: normalizeText(searchName),
            normalizedGuestName: normalizeText(guest.name),
            matchMethod: 'phone',
            nameSimilarity, // Info adicional
            phoneMatch: true
          };
        }
      }
    }
    
    console.log('📱 No se encontró match exacto por teléfono');
  }

  // 👤 PASO 2: Búsqueda por nombre (método original mejorado)
  const nameMatch = findBestGuestMatchByName(searchName, guests);
  
  if (nameMatch && searchPhone) {
    // Verificar compatibilidad de teléfono si ambos están disponibles
    if (nameMatch.guest.phone) {
      const guestPhone = normalizePhoneNumber(nameMatch.guest.phone);
      const searchPhoneNorm = normalizePhoneNumber(searchPhone);
      
      if (guestPhone !== searchPhoneNorm) {
        console.log(`⚠️ Conflicto detectado: nombre similar pero teléfonos diferentes`);
        console.log(`   Nombre: "${nameMatch.guest.name}" vs "${searchName}" (${nameMatch.similarity}%)`);
        console.log(`   Teléfono: ${nameMatch.guest.phone} vs ${searchPhone}`);
        
        // Reducir confianza por conflicto de teléfono
        return {
          ...nameMatch,
          similarity: Math.max(0, nameMatch.similarity - 20), // Penalizar conflicto
          matchMethod: 'name_with_phone_conflict',
          phoneMatch: false,
          hasConflict: true
        };
      }
    }
    
    // No hay conflicto, agregar info de teléfono
    return {
      ...nameMatch,
      matchMethod: 'name',
      phoneMatch: false
    };
  }

  return nameMatch;
}

/**
 * 🔢 Normaliza número de teléfono para comparación
 */
function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remover todo excepto dígitos
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Si empieza con 52 (código México), removerlo para comparar localmente
  if (digitsOnly.startsWith('52') && digitsOnly.length === 12) {
    return digitsOnly.substring(2);
  }
  
  return digitsOnly;
}

/**
 * 🎯 Encuentra la mejor coincidencia de invitado para un nombre dado (método original)
 * 
 * Implementa búsqueda inteligente con múltiples estrategias:
 * 1. Coincidencia exacta (100%)
 * 2. Fuzzy matching con Levenshtein
 * 3. Coincidencia parcial de palabras
 * 
 * @param searchName - Nombre a buscar
 * @param guests - Array de invitados donde buscar
 * @returns Mejor coincidencia encontrada o null si no hay match suficiente
 */
export function findBestGuestMatchByName(
  searchName: string,
  guests: IGuest[]
): MatchResult | null {
  // 🔍 Validaciones iniciales
  if (!searchName || typeof searchName !== 'string') {
    console.warn('🚨 Nombre de búsqueda inválido:', searchName);
    return null;
  }

  if (!guests || !Array.isArray(guests) || guests.length === 0) {
    console.warn('🚨 Array de invitados vacío o inválido');
    return null;
  }

  const normalizedSearchName = normalizeText(searchName);
  
  if (normalizedSearchName.length < FUZZY_CONFIG.MIN_NAME_LENGTH) {
    console.warn('🚨 Nombre demasiado corto:', searchName);
    return null;
  }

  // 📊 Variables para tracking de estadísticas
  const startTime = Date.now();
  let candidatesEvaluated = 0;
  let bestMatch: MatchResult | null = null;
  let bestSimilarity = 0;

  console.log(`🔍 Iniciando búsqueda de "${searchName}" entre ${guests.length} invitados`);

  // 🎯 Búsqueda en todos los invitados
  for (const guest of guests) {
    if (!guest.name || typeof guest.name !== 'string') {
      continue; // Saltar invitados con nombres inválidos
    }

    candidatesEvaluated++;
    const normalizedGuestName = normalizeText(guest.name);

    // 🥇 Estrategia 1: Coincidencia exacta
    if (normalizedSearchName === normalizedGuestName) {
      const exactMatch: MatchResult = {
        guest,
        similarity: 100,
        isExactMatch: true,
        matchType: 'exact',
        normalizedSearchName,
        normalizedGuestName
      };

      console.log(`🎯 Coincidencia exacta encontrada: "${guest.name}"`);
      return exactMatch; // Retornar inmediatamente en coincidencia exacta
    }

    // 🥈 Estrategia 2: Fuzzy matching con Levenshtein
    const fuzzySimilarity = calculateSimilarity(searchName, guest.name);

    // 🥉 Estrategia 3: Coincidencia parcial de palabras
    const partialSimilarity = calculatePartialMatch(searchName, guest.name);

    // Tomar la mejor similitud entre fuzzy y partial
    const bestGuestSimilarity = Math.max(fuzzySimilarity, partialSimilarity);

    // Determinar tipo de match
    let matchType: 'exact' | 'fuzzy' | 'partial' = 'fuzzy';
    if (partialSimilarity > fuzzySimilarity) {
      matchType = 'partial';
    }

    // Actualizar mejor match si es mejor que el actual
    if (bestGuestSimilarity > bestSimilarity) {
      bestSimilarity = bestGuestSimilarity;
      bestMatch = {
        guest,
        similarity: bestGuestSimilarity,
        isExactMatch: false,
        matchType,
        normalizedSearchName,
        normalizedGuestName
      };
    }
  }

  // 📊 Log de estadísticas de búsqueda
  const searchTime = Date.now() - startTime;
  const stats: SearchStats = {
    totalGuests: guests.length,
    searchTime,
    candidatesEvaluated,
    bestSimilarity,
    matchFound: bestMatch !== null && bestSimilarity >= FUZZY_CONFIG.SIMILARITY_THRESHOLD
  };

  console.log('📊 Estadísticas de búsqueda:', stats);

  // 🎯 Verificar threshold y retornar resultado
  if (bestMatch && bestSimilarity >= FUZZY_CONFIG.SIMILARITY_THRESHOLD) {
    console.log(`✅ Match encontrado: "${bestMatch.guest.name}" (${bestSimilarity.toFixed(1)}% similitud)`);
    return bestMatch;
  }

  console.log(`❌ No se encontró match suficiente. Mejor similitud: ${bestSimilarity.toFixed(1)}%`);
  return null;
}

/**
 * 🎯 Función principal de búsqueda (mantiene compatibilidad)
 * Wrapper que usa la búsqueda multi-campo cuando hay teléfono
 */
export function findBestGuestMatch(
  searchName: string,
  guests: IGuest[],
  searchPhone?: string
): MatchResult | null {
  if (searchPhone) {
    return findBestGuestMatchMultiField({ name: searchName, phone: searchPhone }, guests);
  } else {
    return findBestGuestMatchByName(searchName, guests);
  }
}

/**
 * 🔍 Busca múltiples coincidencias para detectar casos ambiguos
 * 
 * Útil para identificar cuando hay varios invitados con nombres similares
 * y se necesita crear un nuevo registro en lugar de actualizar uno existente.
 * 
 * @param searchName - Nombre a buscar
 * @param guests - Array de invitados donde buscar
 * @param maxResults - Máximo número de resultados a retornar (default: 3)
 * @returns Array de coincidencias ordenadas por similitud
 */
export function findMultipleMatches(
  searchName: string,
  guests: IGuest[],
  maxResults: number = 3
): MatchResult[] {
  if (!searchName || !guests || guests.length === 0) {
    return [];
  }

  const normalizedSearchName = normalizeText(searchName);
  const matches: MatchResult[] = [];

  console.log(`🔍 Buscando múltiples coincidencias para "${searchName}"`);

  // Evaluar todos los invitados
  for (const guest of guests) {
    if (!guest.name || typeof guest.name !== 'string') {
      continue;
    }

    const normalizedGuestName = normalizeText(guest.name);
    const fuzzySimilarity = calculateSimilarity(searchName, guest.name);
    const partialSimilarity = calculatePartialMatch(searchName, guest.name);
    const bestSimilarity = Math.max(fuzzySimilarity, partialSimilarity);

    // Solo incluir matches por encima del threshold
    if (bestSimilarity >= FUZZY_CONFIG.SIMILARITY_THRESHOLD) {
      matches.push({
        guest,
        similarity: bestSimilarity,
        isExactMatch: normalizedSearchName === normalizedGuestName,
        matchType: partialSimilarity > fuzzySimilarity ? 'partial' : 'fuzzy',
        normalizedSearchName,
        normalizedGuestName
      });
    }
  }

  // Ordenar por similitud (mayor a menor) y limitar resultados
  const sortedMatches = matches
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, maxResults);

  console.log(`📊 Encontradas ${sortedMatches.length} coincidencias múltiples`);
  
  return sortedMatches;
}

/**
 * 🧪 Función de testing para validar algoritmos
 * 
 * Ejecuta casos de prueba predefinidos para verificar el funcionamiento
 * de los algoritmos de fuzzy matching.
 * 
 * @returns Resultados de las pruebas
 */
export function runFuzzyMatchingTests(): void {
  console.log('🧪 Ejecutando pruebas de Fuzzy Matching...\n');

  const testCases = [
    // Casos de coincidencia exacta
    { search: 'María José', target: 'María José', expected: '100' },
    { search: 'MARÍA JOSÉ', target: 'maría josé', expected: '100' },
    
    // Casos sin acentos
    { search: 'Maria Jose', target: 'María José', expected: '>= 95' },
    { search: 'maria jose', target: 'MARÍA JOSÉ', expected: '>= 95' },
    
    // Casos con errores de tipeo
    { search: 'Maria Jorse', target: 'María José', expected: '>= 80' },
    { search: 'Mária Jossé', target: 'María José', expected: '>= 85' },
    
    // Casos de nombres parciales
    { search: 'María', target: 'María José González', expected: '>= 80' },
    { search: 'José', target: 'María José', expected: '>= 80' },
    
    // Casos sin match
    { search: 'Pedro Sánchez', target: 'María José', expected: '< 80' },
    { search: 'Ana', target: 'Roberto Carlos', expected: '< 50' }
  ];

  testCases.forEach((testCase, index) => {
    const similarity = calculateSimilarity(testCase.search, testCase.target);
    const status = evaluateExpectation(similarity, testCase.expected);
    
    console.log(`Test ${index + 1}: ${status ? '✅' : '❌'}`);
    console.log(`  Búsqueda: "${testCase.search}"`);
    console.log(`  Objetivo: "${testCase.target}"`);
    console.log(`  Similitud: ${similarity.toFixed(1)}%`);
    console.log(`  Esperado: ${testCase.expected}`);
    console.log('');
  });

  console.log('🧪 Pruebas de Fuzzy Matching completadas\n');
}

/**
 * 📊 Evalúa si un resultado cumple con la expectativa
 */
function evaluateExpectation(value: number, expectation: string): boolean {
  if (expectation.startsWith('>=')) {
    return value >= parseFloat(expectation.substring(2));
  }
  if (expectation.startsWith('<')) {
    return value < parseFloat(expectation.substring(1));
  }
  return value === parseFloat(expectation);
}

// 🎯 Exportar configuración para uso externo
export { FUZZY_CONFIG as config };

/**
 * 📝 Ejemplo de uso:
 * 
 * ```typescript
 * import { findBestGuestMatch, calculateSimilarity } from '@/utils/fuzzyMatchingUtils';
 * 
 * // Buscar invitado
 * const match = findBestGuestMatch('Maria Jose', allGuests);
 * if (match && match.similarity >= 80) {
 *   console.log(`Invitado encontrado: ${match.guest.name}`);
 * }
 * 
 * // Calcular similitud directa
 * const similarity = calculateSimilarity('María José', 'Maria Jose');
 * console.log(`Similitud: ${similarity}%`);
 * ```
 */
