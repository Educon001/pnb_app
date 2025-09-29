'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const FINE_MODEL = new Schema(
  {
    // Identificación
    fineNumber: {
      type: Schema.Types.String,
      description: 'Número único de la multa',
      required: true,
      unique: true,
      uppercase: true,
    },
    infractionReference: {
      type: Schema.Types.String,
      description: 'Referencia de la infracción (ej: M-001234)',
      required: true,
      uppercase: true,
    },
    
    // Referencias
    infraction: {
      type: Schema.Types.ObjectId,
      description: 'Referencia a la infracción',
      required: true,
      ref: 'Infraction'
    },
    officer: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que emitió la multa',
      required: true,
      ref: 'Police'
    },
    
    // Estado y fechas
    status: {
      type: Schema.Types.String,
      description: 'Estado de la multa',
      required: true,
      enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED'],
      default: 'DRAFT'
    },
    infractionDate: {
      type: Schema.Types.Date,
      description: 'Fecha de la infracción',
      required: true
    },
    infractionTime: {
      type: Schema.Types.String,
      description: 'Hora de la infracción',
      required: false
    },
    sentAt: {
      type: Schema.Types.Date,
      description: 'Fecha de envío de la multa'
    },
    paidAt: {
      type: Schema.Types.Date,
      description: 'Fecha de pago de la multa'
    },
    cancelledAt: {
      type: Schema.Types.Date,
      description: 'Fecha de cancelación de la multa'
    },
    
    // Ubicación
    location: {
      address: {
        type: Schema.Types.String,
        description: 'Dirección donde ocurrió la infracción',
        required: true
      },
      coordinates: {
        latitude: {
          type: Schema.Types.Number,
          description: 'Latitud de la ubicación'
        },
        longitude: {
          type: Schema.Types.Number,
          description: 'Longitud de la ubicación'
        }
      }
    },
    
    // Datos del conductor (embebidos)
    driver: {
      firstName: {
        type: Schema.Types.String,
        description: 'Nombres del conductor',
        required: true,
        uppercase: true,
      },
      lastName: {
        type: Schema.Types.String,
        description: 'Apellidos del conductor',
        required: true,
        uppercase: true,
      },
      idDocumentType: {
        type: Schema.Types.String,
        description: 'Tipo de documento del conductor',
        enum: ['V', 'E', 'P'],
        default: 'V',
        uppercase: true,
      },
      documentNumber: {
        type: Schema.Types.String,
        description: 'Número de documento del conductor',
        required: true,
        uppercase: true,
      },
      licenseGrade: {
        type: Schema.Types.String,
        description: 'Grado de la licencia de conducir',
        required: true,
        uppercase: true,
      },
      license: {
        type: Schema.Types.String,
        description: 'Número de licencia de conducir',
        uppercase: true,
      },
      address: {
        type: Schema.Types.String,
        description: 'Dirección del conductor',
        required: true
      },
      email: {
        type: Schema.Types.String,
        description: 'Correo electrónico del conductor',
        lowercase: true
      },
      phone: {
        type: Schema.Types.String,
        description: 'Número de teléfono del conductor'
      }
    },
    
    // Datos del propietario (embebidos)
    owner: {
      firstName: {
        type: Schema.Types.String,
        description: 'Nombres del propietario',
        uppercase: true,
      },
      lastName: {
        type: Schema.Types.String,
        description: 'Apellidos del propietario',
        uppercase: true,
      },
      idDocumentType: {
        type: Schema.Types.String,
        description: 'Tipo de documento del propietario',
        enum: ['V', 'E', 'P'],
        uppercase: true,
      },
      documentNumber: {
        type: Schema.Types.String,
        description: 'Número de documento del propietario',
        uppercase: true,
      },
      licenseGrade: {
        type: Schema.Types.String,
        description: 'Grado de la licencia del propietario',
        uppercase: true,
      },
      license: {
        type: Schema.Types.String,
        description: 'Número de licencia del propietario',
        uppercase: true,
      },
      address: {
        type: Schema.Types.String,
        description: 'Dirección del propietario'
      },
      email: {
        type: Schema.Types.String,
        description: 'Correo electrónico del propietario',
        lowercase: true
      }
    },
    
    // Datos del vehículo (embebidos)
    vehicle: {
      plate: {
        type: Schema.Types.String,
        description: 'Placa del vehículo',
        required: true,
        uppercase: true,
      },
      brand: {
        type: Schema.Types.String,
        description: 'Marca del vehículo',
        required: true,
        uppercase: true,
      },
      model: {
        type: Schema.Types.String,
        description: 'Modelo del vehículo',
        required: true,
        uppercase: true,
      },
      year: {
        type: Schema.Types.String,
        description: 'Año del vehículo',
        required: true
      },
      color: {
        type: Schema.Types.String,
        description: 'Color del vehículo',
        required: true,
        uppercase: true,
      },
      type: {
        type: Schema.Types.String,
        description: 'Tipo de vehículo',
        required: true,
        uppercase: true,
      }
    },
    
    // Evidencias
    evidence: [{
      type: {
        type: Schema.Types.String,
        description: 'Tipo de evidencia',
        enum: ['PHOTO', 'VIDEO', 'DOCUMENT'],
        default: 'PHOTO',
        uppercase: true,
      },
      url: {
        type: Schema.Types.String,
        description: 'URL de la evidencia',
        required: true
      },
      description: {
        type: Schema.Types.String,
        description: 'Descripción de la evidencia'
      }
    }],
    
    // Montos y pagos
    infractionAmount: {
      type: Schema.Types.Number,
      description: 'Monto de la multa en bolívares'
    },
    infractionUT: {
      type: Schema.Types.Number,
      description: 'Unidades tributarias de la multa'
    },
    
    // Control
    isOtherOwner: {
      type: Schema.Types.Boolean,
      description: 'Indica si el propietario es diferente al conductor',
      default: false
    },
    notes: {
      type: Schema.Types.String,
      description: 'Notas adicionales sobre la multa'
    },
    cancellationReason: {
      type: Schema.Types.String,
      description: 'Motivo de cancelación de la multa'
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que canceló la multa',
      ref: 'Police'
    },
    paymentMethod: {
      type: Schema.Types.String,
      description: 'Método de pago utilizado',
      enum: ['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'DEBIT_CARD', 'OTHER']
    },
    paymentReference: {
      type: Schema.Types.String,
      description: 'Referencia del pago'
    },
    
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'fines' 
  }
);

// Índices para optimizar consultas
FINE_MODEL.index({ fineNumber: 1 });
FINE_MODEL.index({ infractionReference: 1 });
FINE_MODEL.index({ status: 1 });
FINE_MODEL.index({ officer: 1 });
FINE_MODEL.index({ infraction: 1 });
FINE_MODEL.index({ 'driver.documentNumber': 1 });
FINE_MODEL.index({ 'vehicle.plate': 1 });
FINE_MODEL.index({ createdAt: -1 });
FINE_MODEL.index({ infractionDate: -1 });
FINE_MODEL.index({ 'driver.firstName': 1, 'driver.lastName': 1 });
FINE_MODEL.index({ 'vehicle.brand': 1, 'vehicle.model': 1 });

module.exports = model('Fine', FINE_MODEL);
