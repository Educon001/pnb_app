'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const VEHICLE_MODEL = new Schema(
  {
    plate: {
      type: Schema.Types.String,
      description: 'Placa del vehículo',
      required: true,
      unique: true,
      uppercase: true,
    },
    serialNumber: {
      type: Schema.Types.String,
      description: 'Número serial del vehículo',
      unique: true,
      sparse: true,
      uppercase: true,
    },
    engineNumber: {
      type: Schema.Types.String,
      description: 'Número de motor del vehículo',
      unique: true,
      sparse: true,
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
      type: Schema.Types.Number,
      description: 'Año del vehículo',
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 1
    },
    color: {
      type: Schema.Types.String,
      description: 'Color del vehículo',
      required: true,
      uppercase: true,
    },
    vehicleType: {
      type: Schema.Types.String,
      description: 'Tipo de vehículo',
      required: true,
      enum: ['MOTORCYCLE', 'CAR', 'TRUCK', 'BUS', 'VAN', 'PICKUP', 'OTHER'],
      uppercase: true,
    },
    displacement: {
      type: Schema.Types.Number,
      description: 'Cilindrada del motor en cc'
    },
    fuel: {
      type: Schema.Types.String,
      description: 'Tipo de combustible',
      enum: ['GASOLINE', 'DIESEL', 'GAS', 'ELECTRIC', 'HYBRID', 'OTHER'],
      uppercase: true,
    },
    transmission: {
      type: Schema.Types.String,
      description: 'Tipo de transmisión',
      enum: ['MANUAL', 'AUTOMATIC', 'CVT', 'SEMI_AUTOMATIC'],
      uppercase: true,
    },
    owner: {
      firstName: {
        type: Schema.Types.String,
        description: 'Nombres del propietario',
        required: true,
        uppercase: true,
      },
      lastName: {
        type: Schema.Types.String,
        description: 'Apellidos del propietario',
        required: true,
        uppercase: true,
      },
      idCard: {
        type: Schema.Types.String,
        description: 'Cédula del propietario',
        required: true,
        uppercase: true,
      },
      phone: {
        type: Schema.Types.String,
        description: 'Teléfono del propietario'
      },
      email: {
        type: Schema.Types.String,
        description: 'Email del propietario',
        lowercase: true
      },
      address: {
        type: Schema.Types.String,
        description: 'Dirección del propietario',
        required: true
      },
      birthDate: {
        type: Schema.Types.Date,
        description: 'Fecha de nacimiento del propietario'
      }
    },
    active: {
      type: Schema.Types.Boolean,
      description: 'Indica si el vehículo está activo',
      default: true
    },
    stolen: {
      type: Schema.Types.Boolean,
      description: 'Indica si el vehículo está reportado como robado',
      default: false
    },
    stolenData: {
      reportNumber: {
        type: Schema.Types.String,
        description: 'Número de denuncia del robo'
      },
      reportDate: {
        type: Schema.Types.Date,
        description: 'Fecha de la denuncia'
      },
      reportLocation: {
        type: Schema.Types.String,
        description: 'Lugar donde se reportó el robo'
      }
    },
    stolenAt: {
      type: Schema.Types.Date,
      description: 'Fecha de reporte de robo'
    },
    stolenBy: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que reportó el robo',
      ref: 'Police'
    },
    stolenReportRemovedAt: {
      type: Schema.Types.Date,
      description: 'Fecha de eliminación del reporte de robo'
    },
    stolenReportRemovedBy: {
      type: Schema.Types.ObjectId,
      description: 'Referencia al oficial que eliminó el reporte de robo',
      ref: 'Police'
    },
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'vehicles' 
  }
);

// Índices para optimizar consultas
VEHICLE_MODEL.index({ plate: 1 });
VEHICLE_MODEL.index({ serialNumber: 1 });
VEHICLE_MODEL.index({ engineNumber: 1 });
VEHICLE_MODEL.index({ brand: 1, model: 1 });
VEHICLE_MODEL.index({ vehicleType: 1 });
VEHICLE_MODEL.index({ active: 1 });
VEHICLE_MODEL.index({ stolen: 1 });
VEHICLE_MODEL.index({ 'owner.idCard': 1 });
VEHICLE_MODEL.index({ createdAt: -1 });

module.exports = model('Vehicle', VEHICLE_MODEL);
