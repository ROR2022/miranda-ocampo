/**
 * Necesito crear un endpoint API en Next.js que registre mensajes de depuración.
 * El endpoint debe aceptar solicitudes POST con un cuerpo JSON que contenga:
 * - message: string (el mensaje de depuración)
 * - level: string (nivel de severidad, ej. "info", "warn", "error")
 * - timestamp: string (fecha y hora en formato ISO 8601)
 */

import { NextRequest, NextResponse } from 'next/server';

// Validar niveles permitidos
const VALID_LEVELS = ['info', 'warn', 'error'];

// Handler para solicitudes POST
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validaciones básicas
    if (!data.message || typeof data.message !== 'string') {
      return NextResponse.json({ error: 'message es requerido y debe ser una cadena' }, { status: 400 });
    }
    if (!data.level || !VALID_LEVELS.includes(data.level)) {
      return NextResponse.json({ error: `level es requerido y debe ser uno de: ${VALID_LEVELS.join(', ')}` }, { status: 400 });
    }
    if (!data.timestamp || isNaN(Date.parse(data.timestamp))) {
      return NextResponse.json({ error: 'timestamp es requerido y debe ser una fecha válida en formato ISO 8601' }, { status: 400 });
    }

    // Loguear el mensaje solo cuando es un error
    if (data.level === 'error'|| data.message.toLowerCase().includes('error')) {
      console.error(`[ERROR] ${data.timestamp}: ${data.message}`);
    }
    // Aquí se podría guardar el log en una base de datos o servicio externo
    console.log(`[${data.level.toUpperCase()}] ${data.timestamp}: ${data.message}`);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error al procesar la solicitud de debug-log:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}