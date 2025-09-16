'use strict';

const { CmmErrorClass } = require('../utils');

/* Models */
const DRIVER_MODEL = require('../models/driver.model');

module.exports = {
  /**
   * @description Crear nuevo conductor
   * @param {Object} _driverData - Datos del conductor
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async createDriverSV(_driverData, _officerId) {
    try {
      // Verificar si ya existe un conductor con esta cédula
      const EXISTING_DRIVER = await DRIVER_MODEL.findOne({ idCard: _driverData.idCard }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER001', _error).database();
      });

      if (EXISTING_DRIVER) {
        throw new CmmErrorClass(__filename, 'DRIVER002', 'Ya existe un conductor con esta cédula').frontend();
      }

      // Verificar si ya existe un conductor con este número de licencia
      const EXISTING_LICENSE = await DRIVER_MODEL.findOne({ licenseNumber: _driverData.licenseNumber }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER003', _error).database();
      });

      if (EXISTING_LICENSE) {
        throw new CmmErrorClass(__filename, 'DRIVER004', 'Ya existe un conductor con este número de licencia').frontend();
      }

      const DRIVER_DATA = {
        ..._driverData,
        createdBy: _officerId,
        createdAt: new Date()
      };

      const DRIVER_RESULT = await DRIVER_MODEL.create(DRIVER_DATA).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER005', _error).database();
      });

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER006', _error).server() : _error;
    }
  },

  /**
   * @description Obtener conductores con filtros
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getDriversSV(_filters, _page, _limit) {
    try {
      const WHERE = {};
      
      if (_filters.active !== undefined) WHERE.active = _filters.active;
      if (_filters.suspended !== undefined) WHERE.suspended = _filters.suspended;
      if (_filters.licenseGrade) WHERE.licenseGrade = _filters.licenseGrade;
      
      if (_filters.search) {
        WHERE.$or = [
          { firstName: { $regex: _filters.search, $options: 'i' } },
          { lastName: { $regex: _filters.search, $options: 'i' } },
          { idCard: { $regex: _filters.search, $options: 'i' } },
          { licenseNumber: { $regex: _filters.search, $options: 'i' } }
        ];
      }

      const SKIP = (_page - 1) * _limit;

      const DRIVERS_RESULT = await DRIVER_MODEL.find(WHERE)
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'DRIVER007', _error).database();
        });

      const TOTAL_COUNT = await DRIVER_MODEL.countDocuments(WHERE).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER008', _error).database();
      });

      return {
        drivers: DRIVERS_RESULT,
        pagination: {
          currentPage: _page,
          totalPages: Math.ceil(TOTAL_COUNT / _limit),
          totalItems: TOTAL_COUNT,
          itemsPerPage: _limit
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER009', _error).server() : _error;
    }
  },

  /**
   * @description Obtener conductor por ID
   * @param {String} _id - ID del conductor
   * @returns {Promise} Promise with the response
   */
  async getDriverByIdSV(_id) {
    try {
      const DRIVER_RESULT = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER010', _error).database();
      });

      if (!DRIVER_RESULT) {
        throw new CmmErrorClass(__filename, 'DRIVER011', 'Conductor no encontrado').frontend();
      }

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER012', _error).server() : _error;
    }
  },

  /**
   * @description Obtener conductor por cédula
   * @param {String} _idCard - Cédula del conductor
   * @returns {Promise} Promise with the response
   */
  async getDriverByIdCardSV(_idCard) {
    try {
      const DRIVER_RESULT = await DRIVER_MODEL.findOne({ idCard: _idCard }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER013', _error).database();
      });

      if (!DRIVER_RESULT) {
        throw new CmmErrorClass(__filename, 'DRIVER014', 'Conductor no encontrado').frontend();
      }

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER015', _error).server() : _error;
    }
  },

  /**
   * @description Actualizar conductor
   * @param {String} _id - ID del conductor
   * @param {Object} _updateData - Datos a actualizar
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async updateDriverSV(_id, _updateData, _officerId) {
    try {
      const DRIVER_EXISTS = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER016', _error).database();
      });

      if (!DRIVER_EXISTS) {
        throw new CmmErrorClass(__filename, 'DRIVER017', 'Conductor no encontrado').frontend();
      }

      // Verificar si la nueva cédula ya existe en otro conductor
      if (_updateData.idCard && _updateData.idCard !== DRIVER_EXISTS.idCard) {
        const EXISTING_DRIVER = await DRIVER_MODEL.findOne({ 
          idCard: _updateData.idCard,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'DRIVER018', _error).database();
        });

        if (EXISTING_DRIVER) {
          throw new CmmErrorClass(__filename, 'DRIVER019', 'Ya existe un conductor con esta cédula').frontend();
        }
      }

      // Verificar si el nuevo número de licencia ya existe en otro conductor
      if (_updateData.licenseNumber && _updateData.licenseNumber !== DRIVER_EXISTS.licenseNumber) {
        const EXISTING_LICENSE = await DRIVER_MODEL.findOne({ 
          licenseNumber: _updateData.licenseNumber,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'DRIVER020', _error).database();
        });

        if (EXISTING_LICENSE) {
          throw new CmmErrorClass(__filename, 'DRIVER021', 'Ya existe un conductor con este número de licencia').frontend();
        }
      }

      const UPDATE_DATA = {
        ..._updateData,
        updatedAt: new Date()
      };

      const DRIVER_RESULT = await DRIVER_MODEL.findByIdAndUpdate(_id, UPDATE_DATA, { new: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER022', _error).database();
      });

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER023', _error).server() : _error;
    }
  },

  /**
   * @description Suspender conductor
   * @param {String} _id - ID del conductor
   * @param {String} _reason - Motivo de suspensión
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async suspendDriverSV(_id, _reason, _officerId) {
    try {
      const DRIVER_EXISTS = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER024', _error).database();
      });

      if (!DRIVER_EXISTS) {
        throw new CmmErrorClass(__filename, 'DRIVER025', 'Conductor no encontrado').frontend();
      }

      if (DRIVER_EXISTS.suspended) {
        throw new CmmErrorClass(__filename, 'DRIVER026', 'El conductor ya está suspendido').frontend();
      }

      const DRIVER_RESULT = await DRIVER_MODEL.findByIdAndUpdate(_id, 
        { 
          suspended: true,
          suspensionReason: _reason,
          suspendedAt: new Date(),
          suspendedBy: _officerId,
          updatedAt: new Date()
        }, 
        { new: true }
      ).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER027', _error).database();
      });

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER028', _error).server() : _error;
    }
  },

  /**
   * @description Reactivar conductor
   * @param {String} _id - ID del conductor
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async reactivateDriverSV(_id, _officerId) {
    try {
      const DRIVER_EXISTS = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER029', _error).database();
      });

      if (!DRIVER_EXISTS) {
        throw new CmmErrorClass(__filename, 'DRIVER030', 'Conductor no encontrado').frontend();
      }

      if (!DRIVER_EXISTS.suspended) {
        throw new CmmErrorClass(__filename, 'DRIVER031', 'El conductor no está suspendido').frontend();
      }

      const DRIVER_RESULT = await DRIVER_MODEL.findByIdAndUpdate(_id, 
        { 
          suspended: false,
          suspensionReason: null,
          suspendedAt: null,
          suspendedBy: null,
          reactivatedAt: new Date(),
          reactivatedBy: _officerId,
          updatedAt: new Date()
        }, 
        { new: true }
      ).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER032', _error).database();
      });

      return DRIVER_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER033', _error).server() : _error;
    }
  },

  /**
   * @description Eliminar conductor
   * @param {String} _id - ID del conductor
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async deleteDriverSV(_id, _officerId) {
    try {
      const DRIVER_EXISTS = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER034', _error).database();
      });

      if (!DRIVER_EXISTS) {
        throw new CmmErrorClass(__filename, 'DRIVER035', 'Conductor no encontrado').frontend();
      }

      // Verificar si el conductor tiene multas asociadas
      const { FINE_MODEL } = require('../models/fine.model');
      const FINE_COUNT = await FINE_MODEL.countDocuments({ driver: _id }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER036', _error).database();
      });

      if (FINE_COUNT > 0) {
        throw new CmmErrorClass(__filename, 'DRIVER037', 'No se puede eliminar un conductor que tiene multas asociadas').frontend();
      }

      await DRIVER_MODEL.findByIdAndDelete(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER038', _error).database();
      });

      return { message: 'Conductor eliminado exitosamente' };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER039', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de conductores
   * @returns {Promise} Promise with the response
   */
  async getDriversStatisticsSV() {
    try {
      const STATISTICS_RESULT = await DRIVER_MODEL.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } },
            suspended: { $sum: { $cond: [{ $eq: ['$suspended', true] }, 1, 0] } },
            byLicenseGrade: {
              $push: {
                grade: '$licenseGrade',
                count: 1
              }
            }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER040', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        total: 0,
        active: 0,
        suspended: 0,
        byLicenseGrade: []
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER041', _error).server() : _error;
    }
  },

  /**
   * @description Buscar conductores
   * @param {String} _term - Término de búsqueda
   * @returns {Promise} Promise with the response
   */
  async searchDriversSV(_term) {
    try {
      const DRIVERS_RESULT = await DRIVER_MODEL.find({
        $or: [
          { firstName: { $regex: _term, $options: 'i' } },
          { lastName: { $regex: _term, $options: 'i' } },
          { idCard: { $regex: _term, $options: 'i' } },
          { licenseNumber: { $regex: _term, $options: 'i' } }
        ]
      }).limit(10).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER042', _error).database();
      });

      return DRIVERS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER043', _error).server() : _error;
    }
  },

  /**
   * @description Verificar licencia vencida
   * @param {String} _id - ID del conductor
   * @returns {Promise} Promise with the response
   */
  async checkExpiredLicenseSV(_id) {
    try {
      const DRIVER_RESULT = await DRIVER_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVER044', _error).database();
      });

      if (!DRIVER_RESULT) {
        throw new CmmErrorClass(__filename, 'DRIVER045', 'Conductor no encontrado').frontend();
      }

      const TODAY = new Date();
      const LICENSE_EXPIRY = new Date(DRIVER_RESULT.licenseExpiryDate);
      
      return LICENSE_EXPIRY < TODAY;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'DRIVER046', _error).server() : _error;
    }
  }
};
