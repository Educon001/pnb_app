'use strict';

const { Schema, model } = require('mongoose');

//? Models
const { CMM_COMMONS_SUBMODEL } = require('./submodels');

const POLICE_MODEL = new Schema(
  {
    username: {
      type: Schema.Types.String,
      description: 'Nombre de usuario para el login',
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: Schema.Types.String,
      description: 'Contraseña encriptada',
      required: true
    },
    firstName: {
      type: Schema.Types.String,
      description: 'Nombres del policía',
      required: true,
      uppercase: true,
    },
    lastName: {
      type: Schema.Types.String,
      description: 'Apellidos del policía',
      required: true,
      uppercase: true,
    },
    idCard: {
      type: Schema.Types.String,
      description: 'Cédula de identidad del policía',
      required: true,
      unique: true,
      uppercase: true,
    },
    badgeNumber: {
      type: Schema.Types.String,
      description: 'Número de placa del policía',
      required: true,
      unique: true,
      uppercase: true,
    },
    email: {
      type: Schema.Types.String,
      description: 'Correo electrónico del policía',
      unique: true,
      sparse: true,
      lowercase: true
    },
    phone: {
      type: Schema.Types.String,
      description: 'Número de teléfono del policía'
    },
    address: {
      type: Schema.Types.String,
      description: 'Dirección del policía'
    },
    roles: [{
      type: Schema.Types.String,
      description: 'Roles del policía',
      enum: ['OFFICER', 'SUPERVISOR', 'ADMIN'],
      uppercase: true,
    }],
    rank: {
      type: Schema.Types.String,
      description: 'Rango del policía',
      enum: ['CADET', 'OFFICER', 'SERGEANT', 'LIEUTENANT', 'CAPTAIN', 'MAJOR', 'COLONEL', 'GENERAL'],
      uppercase: true,
    },
    department: {
      type: Schema.Types.String,
      description: 'Departamento o unidad del policía',
      uppercase: true,
    },
    active: {
      type: Schema.Types.Boolean,
      description: 'Indica si el policía está activo',
      default: true
    },
    lastLogin: {
      type: Schema.Types.Date,
      description: 'Último inicio de sesión'
    },
    lastLogout: {
      type: Schema.Types.Date,
      description: 'Último cierre de sesión'
    },
    passwordChangedAt: {
      type: Schema.Types.Date,
      description: 'Fecha del último cambio de contraseña'
    },
    loginAttempts: {
      type: Schema.Types.Number,
      description: 'Número de intentos de login fallidos',
      default: 0
    },
    lockedUntil: {
      type: Schema.Types.Date,
      description: 'Fecha hasta la cual la cuenta está bloqueada'
    },
    //* Comunes
    ...CMM_COMMONS_SUBMODEL('2.0.0'),
  },
  { 
    _id: true, 
    versionKey: false, 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }, 
    minimize: false, 
    collection: 'police' 
  }
);

// Índices para optimizar consultas
POLICE_MODEL.index({ username: 1 });
POLICE_MODEL.index({ idCard: 1 });
POLICE_MODEL.index({ badgeNumber: 1 });
POLICE_MODEL.index({ email: 1 });
POLICE_MODEL.index({ active: 1 });
POLICE_MODEL.index({ roles: 1 });
POLICE_MODEL.index({ createdAt: -1 });

// Método para verificar si la cuenta está bloqueada
POLICE_MODEL.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

// Método para incrementar intentos de login
POLICE_MODEL.methods.incLoginAttempts = function() {
  // Si tenemos un tiempo de bloqueo previo y ya ha expirado
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockedUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Bloquear cuenta después de 5 intentos fallidos por 2 horas
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockedUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 horas
  }
  
  return this.updateOne(updates);
};

// Resetear intentos de login
POLICE_MODEL.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockedUntil: 1 }
  });
};

module.exports = model('Police', POLICE_MODEL);
