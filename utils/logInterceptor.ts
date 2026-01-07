/**
 * Interceptor global de console.log para enviar logs al servidor
 * Mantiene el comportamiento original + envío automático al backend
 */

// Guardar referencias originales
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

/**
 * Envía logs al servidor de forma asíncrona y silenciosa
 */
const sendToServer = async (message: string, level: string) => {
  try {
    // Envío sin await para no bloquear
    fetch('/api/debug-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: String(message),
        level,
        timestamp: new Date().toISOString()
      })
    }).catch(() => {
      // Silencioso si falla - no queremos interferir con la app
    });
  } catch (error) {
    // Silencioso si falla la preparación
  }
};

/**
 * Interceptar console.log
 * Mantiene comportamiento original + envía al servidor
 */
console.log = (...args: any[]) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  // Ejecutar console.log original primero
  originalConsoleLog(...args);
  
  // Enviar al servidor (sin bloquear)
  sendToServer(message, 'info');
};

/**
 * Interceptar console.error
 */
console.error = (...args: any[]) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  originalConsoleError(...args);
  sendToServer(message, 'error');
};

/**
 * Interceptar console.warn
 */
console.warn = (...args: any[]) => {
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  originalConsoleWarn(...args);
  sendToServer(message, 'warn');
};

// Log de confirmación de que el interceptor está activo
originalConsoleLog('🔌 LogInterceptor: Console interceptor initialized - logs will be sent to server');