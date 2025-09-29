'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

// Schema para campos de validación
const FieldSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
    description: 'Nombre del campo',
  },
  description: {
    type: Schema.Types.String,
    required: true,
    description: 'Descripción del campo',
  },
  regex: {
    type: Schema.Types.String,
    required: false,
    description: 'Expresión regular de validación',
  },
  required: {
    type: Schema.Types.Boolean,
    required: true,
    description: 'Si el campo es obligatorio',
    default: false
  },
  type: {
    type: Schema.Types.String,
    required: true,
    description: 'Tipo de dato',
    enum: ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'OBJECT', 'ARRAY']
  },
  defaultValue: {
    type: Schema.Types.Mixed,
    description: 'Valor por defecto del campo'
  }
}, { _id: false });

// Schema para configuración de transport
const TransportConfigSchema = new Schema({
  subject: {
    type: Schema.Types.String,
    required: false,
    description: 'Asunto del email',
  },
  content: {
    type: Schema.Types.String,
    required: true,
    description: 'Contenido/template del email',
  },
  htmlContent: {
    type: Schema.Types.String,
    required: false,
    description: 'Contenido HTML del email',
  },
  attachments: [{
    type: Schema.Types.String,
    description: 'URLs de archivos adjuntos'
  }],
  active: {
    type: Schema.Types.Boolean,
    default: true,
    description: 'Si este transport está activo',
  }
}, { _id: false });

// Schema principal de EmailTemplate
const EMAIL_TEMPLATE_MODEL = new Schema(
  {
    // Identificación
    name: {
      type: Schema.Types.String,
      required: true,
      description: 'Nombre de la plantilla',
      uppercase: true,
    },
    code: {
      type: Schema.Types.String,
      required: true,
      unique: true,
      description: 'Código único de la plantilla',
      uppercase: true,
    },
    
    // Categorización
    category: {
      type: Schema.Types.String,
      required: true,
      description: 'Categoría de la plantilla',
      enum: ['FINE', 'NOTIFICATION', 'PAYMENT', 'CANCELLATION', 'REMINDER', 'OTHER'],
      uppercase: true,
    },
    
    // Tag para identificación específica
    tag: {
      type: Schema.Types.String,
      required: true,
      description: 'Tag único para identificar la plantilla',
      unique: true,
      uppercase: true,
    },
    
    // Descripción
    description: {
      type: Schema.Types.String,
      description: 'Descripción de la plantilla',
    },
    
    // Estado
    active: {
      type: Schema.Types.Boolean,
      default: true,
      description: 'Si la plantilla está activa',
    },
    
    // Configuración funcional (validaciones y campos)
    functionalConfig: {
      fields: [FieldSchema],
      allowedTransports: {
        type: [Schema.Types.String],
        required: true,
        description: 'Transports permitidos para esta plantilla',
        enum: ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP'],
        default: ['EMAIL']
      }
    },
    
    // Configuración de diseño (templates por transport)
    designConfig: {
      transports: {
        type: Schema.Types.Mixed, // Permite cualquier estructura de objeto
        default: {},
        description: 'Configuraciones dinámicas de transports',
        validate: {
          validator: function(transports) {
            return typeof transports === 'object' && transports !== null;
          },
          message: 'Transports debe ser un objeto'
        }
      }
    },
    
    // Configuración específica para emails
    emailConfig: {
      from: {
        type: Schema.Types.String,
        description: 'Email remitente por defecto',
        lowercase: true
      },
      replyTo: {
        type: Schema.Types.String,
        description: 'Email de respuesta',
        lowercase: true
      },
      cc: [{
        type: Schema.Types.String,
        description: 'Emails en copia',
        lowercase: true
      }],
      bcc: [{
        type: Schema.Types.String,
        description: 'Emails en copia oculta',
        lowercase: true
      }],
      priority: {
        type: Schema.Types.String,
        enum: ['LOW', 'NORMAL', 'HIGH'],
        default: 'NORMAL',
        uppercase: true
      }
    },
    
    // Layout HTML para la plantilla
    layout: {
      type: Schema.Types.String,
      description: 'Layout HTML completo para la plantilla',
      required: false
    },
    
    // Variables disponibles en la plantilla
    availableVariables: [{
      name: {
        type: Schema.Types.String,
        required: true,
        description: 'Nombre de la variable'
      },
      description: {
        type: Schema.Types.String,
        required: true,
        description: 'Descripción de la variable'
      },
      type: {
        type: Schema.Types.String,
        required: true,
        description: 'Tipo de la variable',
        enum: ['STRING', 'NUMBER', 'DATE', 'BOOLEAN', 'OBJECT', 'ARRAY']
      },
      example: {
        type: Schema.Types.String,
        description: 'Ejemplo de uso de la variable'
      }
    }],
    
    // Configuración de envío
    sendConfig: {
      immediate: {
        type: Schema.Types.Boolean,
        default: true,
        description: 'Si se envía inmediatamente'
      },
      delay: {
        type: Schema.Types.Number,
        default: 0,
        description: 'Retraso en minutos antes del envío'
      },
      retryAttempts: {
        type: Schema.Types.Number,
        default: 3,
        description: 'Número de intentos de reenvío'
      },
      retryDelay: {
        type: Schema.Types.Number,
        default: 5,
        description: 'Retraso entre intentos en minutos'
      }
    },
    
    // Metadatos
    version: {
      type: Schema.Types.Number,
      default: 1,
      description: 'Versión de la plantilla'
    },
    lastUsed: {
      type: Schema.Types.Date,
      description: 'Última vez que se usó la plantilla'
    },
    usageCount: {
      type: Schema.Types.Number,
      default: 0,
      description: 'Número de veces que se ha usado la plantilla'
    },
    
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'email_templates' 
  }
);

// Índices para optimizar consultas
EMAIL_TEMPLATE_MODEL.index({ code: 1 });
EMAIL_TEMPLATE_MODEL.index({ tag: 1 });
EMAIL_TEMPLATE_MODEL.index({ category: 1 });
EMAIL_TEMPLATE_MODEL.index({ active: 1 });
EMAIL_TEMPLATE_MODEL.index({ createdAt: -1 });
EMAIL_TEMPLATE_MODEL.index({ lastUsed: -1 });

// Índice compuesto para búsquedas por categoría y estado
EMAIL_TEMPLATE_MODEL.index({ 
  category: 1, 
  active: 1 
});

module.exports = model('EmailTemplate', EMAIL_TEMPLATE_MODEL);
