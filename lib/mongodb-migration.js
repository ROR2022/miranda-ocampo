/**
 * 🔌 Conexión MongoDB para Scripts de Migración
 * 
 * Versión simplificada para uso en scripts Node.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

/**
 * Conecta a MongoDB usando la configuración del entorno
 */
async function connectToMongoDB() {
  try {
    // Cargar variables de entorno
    dotenv.config({ path: '.env.local' });
    
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI no está configurado en .env.local');
    }
    
    // Opciones de conexión optimizadas para scripts
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    
    await mongoose.connect(mongoUri, options);
    
    console.log('✅ Conectado a MongoDB Atlas');
    
    // Manejar eventos de conexión
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error de conexión MongoDB:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔌 Desconectado de MongoDB');
    });
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('💥 Error conectando a MongoDB:', error.message);
    throw error;
  }
}

/**
 * Cierra la conexión a MongoDB
 */
async function disconnectFromMongoDB() {
  try {
    await mongoose.connection.close();
    console.log('👋 Conexión MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error cerrando conexión:', error.message);
  }
}

/**
 * Verifica si la conexión está activa
 */
function isConnected() {
  return mongoose.connection.readyState === 1;
}

export {
  connectToMongoDB,
  disconnectFromMongoDB,
  isConnected,
  mongoose
};
