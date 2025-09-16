'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const FINE_MODEL = new Schema(
  {
    fineNumber: {
      type: Schema.Types.String,
      description: 'Número único de la multa',
      required: true,
      unique: true,
      uppercase: true,
    },
    infraction: {
      type: Schema.Types.ObjectId,
      description: 'Referencia a la infracción',
      required: true,
      ref: 'Infraction'
    },
    driver: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al conductor',
      required: true,
      ref: 'Driver'
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al vehículo',
      required: true,
      ref: 'Vehicle'
    },
    officer: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que emitió la multa',
      required: true,
      ref: 'Police'
    },
    location: {
      address: {
        type: Schema.Types.String,
        description: 'Dirección donde ocurrió la infracción',
        required: false
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
    infractionDate: {
      type: Schema.Types.Date,
      description: 'Fecha de la infracción',
      required: false
    },
    infractionTime: {
      type: Schema.Types.String,
      description: 'Hora de la infracción',
      required: false
    },
    evidence: {
      photos: [{
        type: Schema.Types.String,
        description: 'URLs de las fotos de evidencia'
      }],
      videos: [{
        type: Schema.Types.String,
        description: 'URLs de los videos de evidencia'
      }],
      documents: [{
        type: Schema.Types.String,
        description: 'URLs de los documentos de evidencia'
      }]
    },
    status: {
      type: Schema.Types.String,
      description: 'Estado de la multa',
      required: true,
      enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED'],
      default: 'DRAFT'
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
    notes: {
      type: Schema.Types.String,
      description: 'Notas adicionales sobre la multa'
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
FINE_MODEL.index({ status: 1 });
FINE_MODEL.index({ officer: 1 });
FINE_MODEL.index({ infraction: 1 });
FINE_MODEL.index({ driver: 1 });
FINE_MODEL.index({ vehicle: 1 });
FINE_MODEL.index({ createdAt: -1 });
FINE_MODEL.index({ infractionDate: -1 });

module.exports = model('Fine', FINE_MODEL);
