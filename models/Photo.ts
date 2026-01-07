import mongoose, { Document, Schema } from 'mongoose';

// Interface para TypeScript
export interface IPhoto extends Document {
  // Identificación
  filename: string;
  originalName: string;
  
  // URLs y Storage
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  localPath?: string;
  thumbnailUrl?: string;
  uploadSource: 'cloudinary' | 'local';
  
  // Metadata del archivo
  fileSize: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  
  // Información del usuario
  uploader: {
    name?: string;
    ip: string;
    userAgent: string;
  };
  
  // Contexto de la boda
  eventMoment?: 'ceremonia' | 'recepcion' | 'fiesta' | 'general';
  comment?: string;
  
  // Control y moderación
  uploadedAt: Date;
  isPublic: boolean;
  status: 'uploading' | 'ready' | 'processing' | 'error';
  moderationStatus: 'pending' | 'approved' | 'rejected';
  
  // Metadata adicional
  tags?: string[];
  viewCount: number;
  lastViewedAt?: Date;
}

// Esquema de Mongoose
const PhotoSchema = new Schema<IPhoto>({
  // Identificación
  filename: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true,
    trim: true
  },
  
  // URLs y Storage
  cloudinaryId: {
    type: String,
    index: true,
    sparse: true // Permite múltiples documentos con valor null/undefined
  },
  cloudinaryUrl: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Validar URL de Cloudinary si existe
        return !v || v.includes('cloudinary.com');
      },
      message: 'URL de Cloudinary inválida'
    }
  },
  localPath: {
    type: String,
    validate: {
      validator: function(v: string) {
        // Validar que tenga una extensión de imagen válida
        return !v || /\.(jpg|jpeg|png|webp|gif)$/i.test(v);
      },
      message: 'Ruta local debe ser una imagen válida'
    }
  },
  thumbnailUrl: String,
  uploadSource: {
    type: String,
    enum: ['cloudinary', 'local'],
    required: true
  },
  
  // Metadata del archivo
  fileSize: {
    type: Number,
    required: true,
    min: 0,
    max: 50 * 1024 * 1024 // 50MB máximo
  },
  mimeType: {
    type: String,
    required: true,
    enum: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  },
  dimensions: {
    width: {
      type: Number,
      required: true,
      min: 1
    },
    height: {
      type: Number,
      required: true,
      min: 1
    }
  },
  
  // Información del usuario
  uploader: {
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    ip: {
      type: String,
      required: true,
      validate: {
        validator: function(v: string) {
          // Validar IP v4 o v6 básica
          return /^(\d{1,3}\.){3}\d{1,3}$|^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i.test(v) || v === '0.0.0.0';
        },
        message: 'IP inválida'
      }
    },
    userAgent: {
      type: String,
      required: true,
      maxlength: 500
    }
  },
  
  // Contexto de la boda
  eventMoment: {
    type: String,
    enum: ['ceremonia', 'recepcion', 'fiesta', 'general'],
    default: 'general'
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Control y moderación
  uploadedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['uploading', 'ready', 'processing', 'error'],
    default: 'ready'
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  
  // Metadata adicional
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  viewCount: {
    type: Number,
    default: 0,
    min: 0
  },
  lastViewedAt: Date
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para optimizar consultas
PhotoSchema.index({ uploadedAt: -1 }); // Para ordenar por fecha
PhotoSchema.index({ eventMoment: 1 }); // Para filtrar por momento
PhotoSchema.index({ isPublic: 1, status: 1 }); // Para galería pública
PhotoSchema.index({ 'uploader.name': 1 }); // Para filtrar por uploader
PhotoSchema.index({ filename: 1 }, { unique: true }); // Para identificación única

// Virtual para URL de display optimizada
PhotoSchema.virtual('displayUrl').get(function() {
  if (this.uploadSource === 'cloudinary' && this.cloudinaryUrl) {
    // Aplicar transformaciones automáticas de Cloudinary
    return this.cloudinaryUrl.replace('/upload/', '/upload/f_auto,q_auto,w_800/');
  }
  return this.localPath;
});

// Virtual para URL de thumbnail
PhotoSchema.virtual('optimizedThumbnailUrl').get(function() {
  if (this.uploadSource === 'cloudinary' && this.cloudinaryUrl) {
    return this.cloudinaryUrl.replace('/upload/', '/upload/f_auto,q_auto,w_300,h_300,c_fill/');
  }
  return this.thumbnailUrl;
});

// Middleware pre-save para validaciones adicionales
PhotoSchema.pre('save', function(next) {
  // Validar que tenga al menos una URL (Cloudinary o local)
  if (!this.cloudinaryUrl && !this.localPath) {
    next(new Error('Debe tener al menos cloudinaryUrl o localPath'));
    return;
  }
  
  // Validar consistencia de uploadSource
  if (this.uploadSource === 'cloudinary' && !this.cloudinaryUrl) {
    next(new Error('uploadSource cloudinary requiere cloudinaryUrl'));
    return;
  }
  
  if (this.uploadSource === 'local' && !this.localPath) {
    next(new Error('uploadSource local requiere localPath'));
    return;
  }
  
  next();
});

// Método para incrementar visualizaciones
PhotoSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

// Método estático para obtener fotos públicas
PhotoSchema.statics.getPublicPhotos = function(filters = {}) {
  const query = {
    isPublic: true,
    status: 'ready',
    moderationStatus: 'approved',
    ...filters
  };
  
  return this.find(query).sort({ uploadedAt: -1 });
};

// Método estático para obtener estadísticas
PhotoSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalPhotos: { $sum: 1 },
        totalViews: { $sum: '$viewCount' },
        avgFileSize: { $avg: '$fileSize' },
        bySource: {
          $push: {
            source: '$uploadSource',
            count: 1
          }
        },
        byEventMoment: {
          $push: {
            moment: '$eventMoment',
            count: 1
          }
        }
      }
    }
  ]);
  
  return stats[0] || {};
};

// Crear o obtener el modelo
const Photo = mongoose.models.Photo || mongoose.model<IPhoto>('Photo', PhotoSchema);

export default Photo;
