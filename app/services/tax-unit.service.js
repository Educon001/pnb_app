'use strict';

const { CmmErrorClass } = require('../utils');
const TAX_UNIT_MODEL = require('../models/tax-unit.model');

module.exports = {
  /**
   * @description Obtener el valor actual de la unidad tributaria
   * @param {String} _severity - Severidad de la infracción (opcional)
   * @returns {Promise} Promise con el valor de la unidad tributaria
   */
  async getCurrentTaxUnitValueSV(_severity = 'ALL') {
    try {
      const TODAY = new Date();
      
      const TAX_UNIT = await TAX_UNIT_MODEL.findOne({
        active: true,
        effectiveDate: { $lte: TODAY },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: TODAY } }
        ],
        $or: [
          { applicableTo: 'ALL' },
          { applicableTo: _severity }
        ]
      })
        .sort({ effectiveDate: -1 })
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'CPNB-STAXU001', _error).database();
        });

      if (!TAX_UNIT) {
        throw new CmmErrorClass(
          __filename,
          'CPNB-STAXU002',
          'No se encontró una unidad tributaria activa'
        ).frontend();
      }

      return TAX_UNIT.value;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STAXU003', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener todas las unidades tributarias activas
   * @returns {Promise} Promise con las unidades tributarias
   */
  async getActiveTaxUnitsSV() {
    try {
      const TODAY = new Date();
      
      const TAX_UNITS = await TAX_UNIT_MODEL.find({
        active: true,
        effectiveDate: { $lte: TODAY },
        $or: [
          { expiryDate: { $exists: false } },
          { expiryDate: null },
          { expiryDate: { $gte: TODAY } }
        ]
      })
        .sort({ effectiveDate: -1 })
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'CPNB-STAXU004', _error).database();
        });

      return TAX_UNITS;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STAXU005', _error).server()
        : _error;
    }
  },

  /**
   * @description Crear nueva unidad tributaria
   * @param {Object} _taxUnitData - Datos de la unidad tributaria
   * @returns {Promise} Promise con la unidad tributaria creada
   */
  async createTaxUnitSV(_taxUnitData) {
    try {
      const TAX_UNIT_RESULT = await TAX_UNIT_MODEL.create(_taxUnitData).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STAXU006', _error).database();
      });

      return TAX_UNIT_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STAXU007', _error).server()
        : _error;
    }
  },

  /**
   * @description Actualizar unidad tributaria
   * @param {String} _id - ID de la unidad tributaria
   * @param {Object} _updateData - Datos a actualizar
   * @returns {Promise} Promise con la unidad tributaria actualizada
   */
  async updateTaxUnitSV(_id, _updateData) {
    try {
      const TAX_UNIT_RESULT = await TAX_UNIT_MODEL.findByIdAndUpdate(
        _id,
        { ..._updateData, updatedAt: new Date() },
        { new: true }
      ).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STAXU008', _error).database();
      });

      if (!TAX_UNIT_RESULT) {
        throw new CmmErrorClass(
          __filename,
          'CPNB-STAXU009',
          'Unidad tributaria no encontrada'
        ).frontend();
      }

      return TAX_UNIT_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STAXU010', _error).server()
        : _error;
    }
  }
};
