'use strict';

const { CmmErrorClass } = require('../utils');

/* Models */
const INFRACTION_MODEL = require('../models/infraction.model');

module.exports = {
  /**
   * @description Crear nueva infracción
   * @param {Object} _infractionData - Datos de la infracción
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async createInfractionSV(_infractionData, _officerId) {
    try {
      // Verificar si ya existe una infracción con este código
      const EXISTING_INFRACTION = await INFRACTION_MODEL.findOne({ code: _infractionData.code }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE001', _error).database();
      });

      if (EXISTING_INFRACTION) {
        throw new CmmErrorClass(__filename, 'INFRACTIONE002', 'Ya existe una infracción con este código').frontend();
      }

      const INFRACTION_DATA = {
        ..._infractionData,
        createdBy: _officerId,
        createdAt: new Date()
      };

      const INFRACTION_RESULT = await INFRACTION_MODEL.create(INFRACTION_DATA).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE003', _error).database();
      });

      return INFRACTION_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE004', _error).server() : _error;
    }
  },

  /**
   * @description Obtener infracciones con filtros
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getInfractionsSV(_filters, _page, _limit) {
    try {
      const WHERE = {};
      
      if (_filters.active !== undefined) WHERE.active = _filters.active;
      if (_filters.severity) WHERE.severity = _filters.severity;
      if (_filters.vehicleType) WHERE.vehicleType = _filters.vehicleType;
      
      if (_filters.search) {
        WHERE.$or = [
          { code: { $regex: _filters.search, $options: 'i' } },
          { name: { $regex: _filters.search, $options: 'i' } },
          { description: { $regex: _filters.search, $options: 'i' } },
          { article: { $regex: _filters.search, $options: 'i' } }
        ];
      }

      const SKIP = (_page - 1) * _limit;

      const INFRACTIONS_RESULT = await INFRACTION_MODEL.find(WHERE)
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'INFRACTIONE005', _error).database();
        });

      const TOTAL_COUNT = await INFRACTION_MODEL.countDocuments(WHERE).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE006', _error).database();
      });

      return {
        infractions: INFRACTIONS_RESULT,
        pagination: {
          currentPage: _page,
          totalPages: Math.ceil(TOTAL_COUNT / _limit),
          totalItems: TOTAL_COUNT,
          itemsPerPage: _limit
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE007', _error).server() : _error;
    }
  },

  /**
   * @description Obtener infracción por ID
   * @param {String} _id - ID de la infracción
   * @returns {Promise} Promise with the response
   */
  async getInfractionByIdSV(_id) {
    try {
      const INFRACTION_RESULT = await INFRACTION_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE008', _error).database();
      });

      if (!INFRACTION_RESULT) {
        throw new CmmErrorClass(__filename, 'INFRACTIONE009', 'Infracción no encontrada').frontend();
      }

      return INFRACTION_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE010', _error).server() : _error;
    }
  },

  /**
   * @description Actualizar infracción
   * @param {String} _id - ID de la infracción
   * @param {Object} _updateData - Datos a actualizar
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async updateInfractionSV(_id, _updateData, _officerId) {
    try {
      const INFRACTION_EXISTS = await INFRACTION_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE011', _error).database();
      });

      if (!INFRACTION_EXISTS) {
        throw new CmmErrorClass(__filename, 'INFRACTIONE012', 'Infracción no encontrada').frontend();
      }

      // Verificar si el nuevo código ya existe en otra infracción
      if (_updateData.code && _updateData.code !== INFRACTION_EXISTS.code) {
        const EXISTING_INFRACTION = await INFRACTION_MODEL.findOne({ 
          code: _updateData.code,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'INFRACTIONE013', _error).database();
        });

        if (EXISTING_INFRACTION) {
          throw new CmmErrorClass(__filename, 'INFRACTIONE014', 'Ya existe una infracción con este código').frontend();
        }
      }

      const UPDATE_DATA = {
        ..._updateData,
        updatedAt: new Date()
      };

      const INFRACTION_RESULT = await INFRACTION_MODEL.findByIdAndUpdate(_id, UPDATE_DATA, { new: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE015', _error).database();
      });

      return INFRACTION_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE016', _error).server() : _error;
    }
  },

  /**
   * @description Eliminar infracción
   * @param {String} _id - ID de la infracción
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async deleteInfractionSV(_id, _officerId) {
    try {
      const INFRACTION_EXISTS = await INFRACTION_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE017', _error).database();
      });

      if (!INFRACTION_EXISTS) {
        throw new CmmErrorClass(__filename, 'INFRACTIONE018', 'Infracción no encontrada').frontend();
      }

      // Verificar si la infracción tiene multas asociadas
      const { FINE_MODEL } = require('../models/fine.model');
      const FINE_COUNT = await FINE_MODEL.countDocuments({ infraction: _id }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE019', _error).database();
      });

      if (FINE_COUNT > 0) {
        throw new CmmErrorClass(__filename, 'INFRACTIONE020', 'No se puede eliminar una infracción que tiene multas asociadas').frontend();
      }

      await INFRACTION_MODEL.findByIdAndDelete(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE021', _error).database();
      });

      return { message: 'Infracción eliminada exitosamente' };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE022', _error).server() : _error;
    }
  },

  /**
   * @description Obtener infracciones por gravedad
   * @param {String} _severity - Gravedad de la infracción
   * @returns {Promise} Promise with the response
   */
  async getInfractionsBySeveritySV(_severity) {
    try {
      const INFRACTIONS_RESULT = await INFRACTION_MODEL.find({ 
        severity: _severity,
        active: true 
      }).sort({ taxUnits: -1 }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE023', _error).database();
      });

      return INFRACTIONS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE024', _error).server() : _error;
    }
  },

  /**
   * @description Obtener infracciones por tipo de vehículo
   * @param {String} _type - Tipo de vehículo
   * @returns {Promise} Promise with the response
   */
  async getInfractionsByVehicleTypeSV(_type) {
    try {
      const INFRACTIONS_RESULT = await INFRACTION_MODEL.find({ 
        vehicleType: _type,
        active: true 
      }).sort({ taxUnits: -1 }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE025', _error).database();
      });

      return INFRACTIONS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE026', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de infracciones
   * @returns {Promise} Promise with the response
   */
  async getInfractionsStatisticsSV() {
    try {
      const STATISTICS_RESULT = await INFRACTION_MODEL.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } },
            bySeverity: {
              $push: {
                severity: '$severity',
                count: 1
              }
            },
            byVehicleType: {
              $push: {
                vehicleType: '$vehicleType',
                count: 1
              }
            }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE027', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        total: 0,
        active: 0,
        bySeverity: [],
        byVehicleType: []
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE028', _error).server() : _error;
    }
  },

  /**
   * @description Buscar infracciones
   * @param {String} _term - Término de búsqueda
   * @returns {Promise} Promise with the response
   */
  async searchInfractionsSV(_term) {
    try {
      const INFRACTIONS_RESULT = await INFRACTION_MODEL.find({
        $or: [
          { code: { $regex: _term, $options: 'i' } },
          { name: { $regex: _term, $options: 'i' } },
          { description: { $regex: _term, $options: 'i' } },
          { article: { $regex: _term, $options: 'i' } }
        ],
        active: true
      }).limit(10).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTIONE029', _error).database();
      });

      return INFRACTIONS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'INFRACTIONE030', _error).server() : _error;
    }
  }
};
