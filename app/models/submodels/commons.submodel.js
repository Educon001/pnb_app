'use strict';

const mongoose = require('mongoose');

/**
 * @description Submodelo común para campos estándar de CMM
 * @param {string} version - Versión del submodelo
 * @returns {Object} Esquema común de CMM
 */
const CMM_COMMONS_SUBMODEL = (version = '1.0.0') => {
  return {
    // Campos de auditoría
    created_at: {
      type: Date,
      default: Date.now,
      required: true
    },
    updated_at: {
      type: Date,
      default: Date.now,
      required: true
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    updated_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    
    // Campos de estado
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'PENDING', 'DELETED'],
      default: 'ACTIVE',
      required: true
    },
    
    // Campos de versión
    version: {
      type: String,
      default: version,
      required: true
    },
    
    // Campos de soft delete
    deleted: {
      type: Boolean,
      default: false,
      required: true
    },
    deleted_at: {
      type: Date,
      required: false
    },
    deleted_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    
    // Campos de metadatos
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    },
    
    // Campos de configuración
    config: {
      type: mongoose.Schema.Types.Mixed,
      required: false
    }
  };
};

module.exports = { CMM_COMMONS_SUBMODEL };
