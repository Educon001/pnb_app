'use strict';

const { CmmErrorClass } = require('../utils');

/* Models */
const VEHICLE_MODEL = require('../models/vehicle.model');

module.exports = {
  /**
   * @description Crear nuevo vehículo
   * @param {Object} _vehicleData - Datos del vehículo
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async createVehicleSV(_vehicleData, _officerId) {
    try {
      // Verificar si ya existe un vehículo con esta placa
      const EXISTING_VEHICLE = await VEHICLE_MODEL.findOne({ plate: _vehicleData.plate }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE001', _error).database();
      });

      if (EXISTING_VEHICLE) {
        throw new CmmErrorClass(__filename, 'VEHICLE002', 'Ya existe un vehículo con esta placa').frontend();
      }

      // Verificar si ya existe un vehículo con este número serial
      if (_vehicleData.serialNumber) {
        const EXISTING_SERIAL = await VEHICLE_MODEL.findOne({ serialNumber: _vehicleData.serialNumber }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE003', _error).database();
        });

        if (EXISTING_SERIAL) {
          throw new CmmErrorClass(__filename, 'VEHICLE004', 'Ya existe un vehículo con este número serial').frontend();
        }
      }

      // Verificar si ya existe un vehículo con este número de motor
      if (_vehicleData.engineNumber) {
        const EXISTING_ENGINE = await VEHICLE_MODEL.findOne({ engineNumber: _vehicleData.engineNumber }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE005', _error).database();
        });

        if (EXISTING_ENGINE) {
          throw new CmmErrorClass(__filename, 'VEHICLE006', 'Ya existe un vehículo con este número de motor').frontend();
        }
      }

      const VEHICLE_DATA = {
        ..._vehicleData,
        createdBy: _officerId,
        createdAt: new Date()
      };

      const VEHICLE_RESULT = await VEHICLE_MODEL.create(VEHICLE_DATA).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE007', _error).database();
      });

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE008', _error).server() : _error;
    }
  },

  /**
   * @description Obtener vehículos con filtros
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getVehiclesSV(_filters, _page, _limit) {
    try {
      const WHERE = {};
      
      if (_filters.active !== undefined) WHERE.active = _filters.active;
      if (_filters.stolen !== undefined) WHERE.stolen = _filters.stolen;
      if (_filters.vehicleType) WHERE.vehicleType = _filters.vehicleType;
      if (_filters.brand) WHERE.brand = _filters.brand;
      
      if (_filters.search) {
        WHERE.$or = [
          { plate: { $regex: _filters.search, $options: 'i' } },
          { brand: { $regex: _filters.search, $options: 'i' } },
          { model: { $regex: _filters.search, $options: 'i' } },
          { serialNumber: { $regex: _filters.search, $options: 'i' } },
          { engineNumber: { $regex: _filters.search, $options: 'i' } },
          { 'owner.firstName': { $regex: _filters.search, $options: 'i' } },
          { 'owner.lastName': { $regex: _filters.search, $options: 'i' } },
          { 'owner.idCard': { $regex: _filters.search, $options: 'i' } }
        ];
      }

      const SKIP = (_page - 1) * _limit;

      const VEHICLES_RESULT = await VEHICLE_MODEL.find(WHERE)
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE009', _error).database();
        });

      const TOTAL_COUNT = await VEHICLE_MODEL.countDocuments(WHERE).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE010', _error).database();
      });

      return {
        vehicles: VEHICLES_RESULT,
        pagination: {
          currentPage: _page,
          totalPages: Math.ceil(TOTAL_COUNT / _limit),
          totalItems: TOTAL_COUNT,
          itemsPerPage: _limit
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE011', _error).server() : _error;
    }
  },

  /**
   * @description Obtener vehículo por ID
   * @param {String} _id - ID del vehículo
   * @returns {Promise} Promise with the response
   */
  async getVehicleByIdSV(_id) {
    try {
      const VEHICLE_RESULT = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE012', _error).database();
      });

      if (!VEHICLE_RESULT) {
        throw new CmmErrorClass(__filename, 'VEHICLE013', 'Vehículo no encontrado').frontend();
      }

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE014', _error).server() : _error;
    }
  },

  /**
   * @description Obtener vehículo por placa
   * @param {String} _plate - Placa del vehículo
   * @returns {Promise} Promise with the response
   */
  async getVehicleByPlateSV(_plate) {
    try {
      const VEHICLE_RESULT = await VEHICLE_MODEL.findOne({ plate: _plate }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE015', _error).database();
      });

      if (!VEHICLE_RESULT) {
        throw new CmmErrorClass(__filename, 'VEHICLE016', 'Vehículo no encontrado').frontend();
      }

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE017', _error).server() : _error;
    }
  },

  /**
   * @description Actualizar vehículo
   * @param {String} _id - ID del vehículo
   * @param {Object} _updateData - Datos a actualizar
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async updateVehicleSV(_id, _updateData, _officerId) {
    try {
      const VEHICLE_EXISTS = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE018', _error).database();
      });

      if (!VEHICLE_EXISTS) {
        throw new CmmErrorClass(__filename, 'VEHICLE019', 'Vehículo no encontrado').frontend();
      }

      // Verificar si la nueva placa ya existe en otro vehículo
      if (_updateData.plate && _updateData.plate !== VEHICLE_EXISTS.plate) {
        const EXISTING_VEHICLE = await VEHICLE_MODEL.findOne({ 
          plate: _updateData.plate,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE020', _error).database();
        });

        if (EXISTING_VEHICLE) {
          throw new CmmErrorClass(__filename, 'VEHICLE021', 'Ya existe un vehículo con esta placa').frontend();
        }
      }

      // Verificar si el nuevo número serial ya existe en otro vehículo
      if (_updateData.serialNumber && _updateData.serialNumber !== VEHICLE_EXISTS.serialNumber) {
        const EXISTING_SERIAL = await VEHICLE_MODEL.findOne({ 
          serialNumber: _updateData.serialNumber,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE022', _error).database();
        });

        if (EXISTING_SERIAL) {
          throw new CmmErrorClass(__filename, 'VEHICLE023', 'Ya existe un vehículo con este número serial').frontend();
        }
      }

      // Verificar si el nuevo número de motor ya existe en otro vehículo
      if (_updateData.engineNumber && _updateData.engineNumber !== VEHICLE_EXISTS.engineNumber) {
        const EXISTING_ENGINE = await VEHICLE_MODEL.findOne({ 
          engineNumber: _updateData.engineNumber,
          _id: { $ne: _id }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE024', _error).database();
        });

        if (EXISTING_ENGINE) {
          throw new CmmErrorClass(__filename, 'VEHICLE025', 'Ya existe un vehículo con este número de motor').frontend();
        }
      }

      const UPDATE_DATA = {
        ..._updateData,
        updatedAt: new Date()
      };

      const VEHICLE_RESULT = await VEHICLE_MODEL.findByIdAndUpdate(_id, UPDATE_DATA, { new: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE026', _error).database();
      });

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE027', _error).server() : _error;
    }
  },

  /**
   * @description Reportar vehículo como robado
   * @param {String} _id - ID del vehículo
   * @param {Object} _stolenData - Datos del reporte de robo
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async reportStolenSV(_id, _stolenData, _officerId) {
    try {
      const VEHICLE_EXISTS = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE028', _error).database();
      });

      if (!VEHICLE_EXISTS) {
        throw new CmmErrorClass(__filename, 'VEHICLE029', 'Vehículo no encontrado').frontend();
      }

      if (VEHICLE_EXISTS.stolen) {
        throw new CmmErrorClass(__filename, 'VEHICLE030', 'El vehículo ya está reportado como robado').frontend();
      }

      const VEHICLE_RESULT = await VEHICLE_MODEL.findByIdAndUpdate(_id, 
        { 
          stolen: true,
          stolenData: _stolenData,
          stolenAt: new Date(),
          stolenBy: _officerId,
          updatedAt: new Date()
        }, 
        { new: true }
      ).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE031', _error).database();
      });

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE032', _error).server() : _error;
    }
  },

  /**
   * @description Quitar reporte de robo
   * @param {String} _id - ID del vehículo
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async removeStolenReportSV(_id, _officerId) {
    try {
      const VEHICLE_EXISTS = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE033', _error).database();
      });

      if (!VEHICLE_EXISTS) {
        throw new CmmErrorClass(__filename, 'VEHICLE034', 'Vehículo no encontrado').frontend();
      }

      if (!VEHICLE_EXISTS.stolen) {
        throw new CmmErrorClass(__filename, 'VEHICLE035', 'El vehículo no está reportado como robado').frontend();
      }

      const VEHICLE_RESULT = await VEHICLE_MODEL.findByIdAndUpdate(_id, 
        { 
          stolen: false,
          stolenData: null,
          stolenAt: null,
          stolenBy: null,
          stolenReportRemovedAt: new Date(),
          stolenReportRemovedBy: _officerId,
          updatedAt: new Date()
        }, 
        { new: true }
      ).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE036', _error).database();
      });

      return VEHICLE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE037', _error).server() : _error;
    }
  },

  /**
   * @description Eliminar vehículo
   * @param {String} _id - ID del vehículo
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async deleteVehicleSV(_id, _officerId) {
    try {
      const VEHICLE_EXISTS = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE038', _error).database();
      });

      if (!VEHICLE_EXISTS) {
        throw new CmmErrorClass(__filename, 'VEHICLE039', 'Vehículo no encontrado').frontend();
      }

      // Verificar si el vehículo tiene multas asociadas
      const { FINE_MODEL } = require('../models/fine.model');
      const FINE_COUNT = await FINE_MODEL.countDocuments({ vehicle: _id }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE040', _error).database();
      });

      if (FINE_COUNT > 0) {
        throw new CmmErrorClass(__filename, 'VEHICLE041', 'No se puede eliminar un vehículo que tiene multas asociadas').frontend();
      }

      await VEHICLE_MODEL.findByIdAndDelete(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE042', _error).database();
      });

      return { message: 'Vehículo eliminado exitosamente' };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE043', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de vehículos
   * @returns {Promise} Promise with the response
   */
  async getVehiclesStatisticsSV() {
    try {
      const STATISTICS_RESULT = await VEHICLE_MODEL.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$active', true] }, 1, 0] } },
            stolen: { $sum: { $cond: [{ $eq: ['$stolen', true] }, 1, 0] } },
            byVehicleType: {
              $push: {
                vehicleType: '$vehicleType',
                count: 1
              }
            },
            byBrand: {
              $push: {
                brand: '$brand',
                count: 1
              }
            }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE044', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        total: 0,
        active: 0,
        stolen: 0,
        byVehicleType: [],
        byBrand: []
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE045', _error).server() : _error;
    }
  },

  /**
   * @description Buscar vehículos
   * @param {String} _term - Término de búsqueda
   * @returns {Promise} Promise with the response
   */
  async searchVehiclesSV(_term) {
    try {
      const VEHICLES_RESULT = await VEHICLE_MODEL.find({
        $or: [
          { plate: { $regex: _term, $options: 'i' } },
          { brand: { $regex: _term, $options: 'i' } },
          { model: { $regex: _term, $options: 'i' } },
          { serialNumber: { $regex: _term, $options: 'i' } },
          { engineNumber: { $regex: _term, $options: 'i' } },
          { 'owner.firstName': { $regex: _term, $options: 'i' } },
          { 'owner.lastName': { $regex: _term, $options: 'i' } },
          { 'owner.idCard': { $regex: _term, $options: 'i' } }
        ]
      }).limit(10).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE046', _error).database();
      });

      return VEHICLES_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE047', _error).server() : _error;
    }
  },

  /**
   * @description Verificar si vehículo está reportado como robado
   * @param {String} _id - ID del vehículo
   * @returns {Promise} Promise with the response
   */
  async checkStolenSV(_id) {
    try {
      const VEHICLE_RESULT = await VEHICLE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE048', _error).database();
      });

      if (!VEHICLE_RESULT) {
        throw new CmmErrorClass(__filename, 'VEHICLE049', 'Vehículo no encontrado').frontend();
      }

      return VEHICLE_RESULT.stolen || false;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE050', _error).server() : _error;
    }
  },

  /**
   * @description Obtener vehículos robados
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getStolenVehiclesSV(_page, _limit) {
    try {
      const SKIP = (_page - 1) * _limit;

      const VEHICLES_RESULT = await VEHICLE_MODEL.find({ stolen: true })
        .sort({ stolenAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'VEHICLE051', _error).database();
        });

      const TOTAL_COUNT = await VEHICLE_MODEL.countDocuments({ stolen: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLE052', _error).database();
      });

      return {
        vehicles: VEHICLES_RESULT,
        pagination: {
          currentPage: _page,
          totalPages: Math.ceil(TOTAL_COUNT / _limit),
          totalItems: TOTAL_COUNT,
          itemsPerPage: _limit
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'VEHICLE053', _error).server() : _error;
    }
  }
};
