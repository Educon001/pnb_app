'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const INFRACTION_MODEL = new Schema(
  {
    code: {
      type: Schema.Types.String,
      description: 'Código único de la infracción',
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: Schema.Types.String,
      description: 'Nombre de la infracción',
      required: true,
      uppercase: true,
    },
    description: {
      type: Schema.Types.String,
      description: 'Descripción detallada de la infracción',
      required: true
    },
    article: {
      type: Schema.Types.String,
      description: 'Artículo de la ley que regula la infracción',
      required: true,
      uppercase: true,
    },
    severity: {
      type: Schema.Types.String,
      description: 'Gravedad de la infracción',
      required: true,
      enum: ['LIGHT', 'LESS_SERIOUS', 'SERIOUS', 'VERY_SERIOUS'],
      uppercase: true,
    },
    vehicleType: {
      type: Schema.Types.String,
      description: 'Tipo de vehículo al que aplica la infracción',
      required: true,
      enum: ['ALL', 'MOTORCYCLE', 'CAR', 'TRUCK', 'BUS', 'MOTORCYCLE_AND_CAR'],
      uppercase: true,
    },
    taxUnits: {
      type: Schema.Types.Number,
      description: 'Unidades tributarias de la multa',
      required: true,
      min: 0
    },
    bolivarValue: {
      type: Schema.Types.Number,
      description: 'Valor en bolívares de la multa',
      required: true,
      min: 0
    },
    licensePoints: {
      type: Schema.Types.Number,
      description: 'Puntos que se descuentan de la licencia',
      default: 0,
      min: 0
    },
    requiresPhoto: {
      type: Schema.Types.Boolean,
      description: 'Indica si requiere foto como evidencia',
      default: false
    },
    requiresEvidence: {
      type: Schema.Types.Boolean,
      description: 'Indica si requiere evidencia adicional',
      default: false
    },
    active: {
      type: Schema.Types.Boolean,
      description: 'Indica si la infracción está activa',
      default: true
    },
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'infractions' 
  }
);

// Índices para optimizar consultas
INFRACTION_MODEL.index({ code: 1 });
INFRACTION_MODEL.index({ severity: 1 });
INFRACTION_MODEL.index({ vehicleType: 1 });
INFRACTION_MODEL.index({ active: 1 });
INFRACTION_MODEL.index({ taxUnits: -1 });
INFRACTION_MODEL.index({ createdAt: -1 });

module.exports = model('Infraction', INFRACTION_MODEL);
