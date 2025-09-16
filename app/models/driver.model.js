'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const DRIVER_MODEL = new Schema(
  {
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
    idCard: {
      type: Schema.Types.String,
      description: 'Cédula de identidad del conductor',
      required: true,
      unique: true,
      uppercase: true,
    },
    licenseNumber: {
      type: Schema.Types.String,
      description: 'Número de licencia de conducir',
      required: true,
      unique: true,
      uppercase: true,
    },
    licenseGrade: {
      type: Schema.Types.String,
      description: 'Grado de la licencia de conducir',
      required: true,
      enum: ['PROFESSIONAL', 'CLASS_A', 'CLASS_B', 'CLASS_C', 'CLASS_D', 'MOTORCYCLE'],
      uppercase: true,
    },
    licenseIssueDate: {
      type: Schema.Types.Date,
      description: 'Fecha de emisión de la licencia',
      required: true
    },
    licenseExpiryDate: {
      type: Schema.Types.Date,
      description: 'Fecha de vencimiento de la licencia',
      required: true
    },
    phone: {
      type: Schema.Types.String,
      description: 'Número de teléfono del conductor'
    },
    email: {
      type: Schema.Types.String,
      description: 'Correo electrónico del conductor',
      lowercase: true
    },
    address: {
      type: Schema.Types.String,
      description: 'Dirección del conductor',
      required: true
    },
    birthDate: {
      type: Schema.Types.Date,
      description: 'Fecha de nacimiento del conductor',
      required: true
    },
    nationality: {
      type: Schema.Types.String,
      description: 'Nacionalidad del conductor',
      required: true,
      uppercase: true,
    },
    gender: {
      type: Schema.Types.String,
      description: 'Sexo del conductor',
      required: true,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      uppercase: true,
    },
    active: {
      type: Schema.Types.Boolean,
      description: 'Indica si el conductor está activo',
      default: true
    },
    suspended: {
      type: Schema.Types.Boolean,
      description: 'Indica si el conductor está suspendido',
      default: false
    },
    suspensionReason: {
      type: Schema.Types.String,
      description: 'Motivo de suspensión del conductor'
    },
    suspendedAt: {
      type: Schema.Types.Date,
      description: 'Fecha de suspensión del conductor'
    },
    suspendedBy: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que suspendió al conductor',
      ref: 'Police'
    },
    reactivatedAt: {
      type: Schema.Types.Date,
      description: 'Fecha de reactivación del conductor'
    },
    reactivatedBy: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que reactivó al conductor',
      ref: 'Police'
    },
    emergencyContact: {
      name: {
        type: Schema.Types.String,
        description: 'Nombre del contacto de emergencia'
      },
      phone: {
        type: Schema.Types.String,
        description: 'Teléfono del contacto de emergencia'
      },
      relationship: {
        type: Schema.Types.String,
        description: 'Relación con el contacto de emergencia'
      }
    },
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'drivers' 
  }
);

// Índices para optimizar consultas
DRIVER_MODEL.index({ idCard: 1 });
DRIVER_MODEL.index({ licenseNumber: 1 });
DRIVER_MODEL.index({ firstName: 1, lastName: 1 });
DRIVER_MODEL.index({ active: 1 });
DRIVER_MODEL.index({ suspended: 1 });
DRIVER_MODEL.index({ licenseGrade: 1 });
DRIVER_MODEL.index({ createdAt: -1 });

module.exports = model('Driver', DRIVER_MODEL);
