'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const TAX_UNIT_MODEL = new Schema(
  {
    // Identificación
    name: {
      type: Schema.Types.String,
      description: 'Nombre de la configuración de unidad tributaria',
      required: true,
      uppercase: true,
    },
    code: {
      type: Schema.Types.String,
      description: 'Código único de la configuración',
      required: true,
      unique: true,
      uppercase: true,
    },
    
    // Configuración monetaria
    value: {
      type: Schema.Types.Number,
      description: 'Valor de la unidad tributaria en bolívares',
      required: true,
      min: 0
    },
    currency: {
      type: Schema.Types.String,
      description: 'Moneda de la unidad tributaria',
      required: true,
      enum: ['VES', 'USD', 'EUR'],
      default: 'VES',
      uppercase: true,
    },
    
    // Vigencia
    effectiveDate: {
      type: Schema.Types.Date,
      description: 'Fecha de vigencia de la unidad tributaria',
      required: true
    },
    expiryDate: {
      type: Schema.Types.Date,
      description: 'Fecha de vencimiento de la unidad tributaria',
      required: false
    },
    
    // Estado
    active: {
      type: Schema.Types.Boolean,
      description: 'Indica si la unidad tributaria está activa',
      default: true
    },
    
    // Información adicional
    description: {
      type: Schema.Types.String,
      description: 'Descripción de la unidad tributaria'
    },
    source: {
      type: Schema.Types.String,
      description: 'Fuente de la información (ej: Gaceta Oficial)',
      uppercase: true,
    },
    sourceNumber: {
      type: Schema.Types.String,
      description: 'Número de la fuente (ej: número de gaceta)',
      uppercase: true,
    },
    sourceDate: {
      type: Schema.Types.Date,
      description: 'Fecha de la fuente'
    },
    
    // Configuración de aplicación
    applicableTo: {
      type: [Schema.Types.String],
      description: 'Tipos de infracciones a las que aplica',
      enum: ['ALL', 'LIGHT', 'LESS_SERIOUS', 'SERIOUS', 'VERY_SERIOUS'],
      default: ['ALL']
    },
    
    // Metadatos
    version: {
      type: Schema.Types.Number,
      description: 'Versión de la configuración',
      default: 1
    },
    
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'tax_units' 
  }
);

// Índices para optimizar consultas
TAX_UNIT_MODEL.index({ code: 1 });
TAX_UNIT_MODEL.index({ active: 1 });
TAX_UNIT_MODEL.index({ effectiveDate: 1 });
TAX_UNIT_MODEL.index({ expiryDate: 1 });
TAX_UNIT_MODEL.index({ createdAt: -1 });

// Índice compuesto para búsquedas por vigencia
TAX_UNIT_MODEL.index({ 
  active: 1, 
  effectiveDate: 1, 
  expiryDate: 1 
});

module.exports = model('TaxUnit', TAX_UNIT_MODEL);
