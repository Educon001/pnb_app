'use strict';

const { CmmErrorClass } = require('../utils');

/* Models */
const FINE_MODEL = require('../models/fine.model');
const DRIVER_MODEL = require('../models/driver.model');
const VEHICLE_MODEL = require('../models/vehicle.model');
const INFRACTION_MODEL = require('../models/infraction.model');
const POLICE_MODEL = require('../models/police.model');

module.exports = {
  /**
   * @description Obtener estadísticas generales
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getGeneralStatisticsSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const STATISTICS_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: null,
            totalFines: { $sum: 1 },
            byStatus: {
              $push: {
                status: '$status',
                count: 1
              }
            },
            bySeverity: {
              $push: {
                severity: '$infraction.severity',
                count: 1
              }
            },
            totalRevenue: { $sum: '$infraction.bolivarValue' },
            totalTaxUnits: { $sum: '$infraction.taxUnits' }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE001', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        totalFines: 0,
        byStatus: [],
        bySeverity: [],
        totalRevenue: 0,
        totalTaxUnits: 0
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE002', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas por período
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getStatisticsByPeriodSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const STATISTICS_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
              day: { $dayOfMonth: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$infraction.bolivarValue' },
            taxUnits: { $sum: '$infraction.taxUnits' }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE003', _error).database();
      });

      return STATISTICS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE004', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de rendimiento
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getPerformanceStatisticsSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const PERFORMANCE_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: '$officer',
            totalFines: { $sum: 1 },
            sentFines: { $sum: { $cond: [{ $eq: ['$status', 'SENT'] }, 1, 0] } },
            paidFines: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } },
            cancelledFines: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
            totalRevenue: { $sum: '$infraction.bolivarValue' }
          }
        },
        {
          $lookup: {
            from: 'police',
            localField: '_id',
            foreignField: '_id',
            as: 'officer'
          }
        },
        {
          $unwind: '$officer'
        },
        {
          $project: {
            officer: {
              firstName: '$officer.firstName',
              lastName: '$officer.lastName',
              idCard: '$officer.idCard',
              badgeNumber: '$officer.badgeNumber'
            },
            totalFines: 1,
            sentFines: 1,
            paidFines: 1,
            cancelledFines: 1,
            totalRevenue: 1,
            efficiency: {
              $multiply: [
                { $divide: ['$sentFines', '$totalFines'] },
                100
              ]
            }
          }
        },
        {
          $sort: { totalFines: -1 }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE005', _error).database();
      });

      return PERFORMANCE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE006', _error).server() : _error;
    }
  },

  /**
   * @description Obtener infracciones más comunes
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getMostCommonInfractionsSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const INFRACTIONS_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: '$infraction',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$infraction.bolivarValue' }
          }
        },
        {
          $lookup: {
            from: 'infractions',
            localField: '_id',
            foreignField: '_id',
            as: 'infraction'
          }
        },
        {
          $unwind: '$infraction'
        },
        {
          $project: {
            infraction: {
              code: '$infraction.code',
              name: '$infraction.name',
              description: '$infraction.description',
              article: '$infraction.article',
              severity: '$infraction.severity',
              taxUnits: '$infraction.taxUnits',
              bolivarValue: '$infraction.bolivarValue'
            },
            count: 1,
            totalRevenue: 1
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE007', _error).database();
      });

      return INFRACTIONS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE008', _error).server() : _error;
    }
  },

  /**
   * @description Obtener ubicaciones más frecuentes
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getMostFrequentLocationsSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const LOCATIONS_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: '$location.address',
            count: { $sum: 1 },
            coordinates: { $first: '$location.coordinates' }
          }
        },
        {
          $project: {
            address: '$_id',
            coordinates: 1,
            count: 1
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE009', _error).database();
      });

      return LOCATIONS_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE010', _error).server() : _error;
    }
  },

  /**
   * @description Obtener vehículos más multados
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getMostFinedVehiclesSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const VEHICLES_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: '$vehicle',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$infraction.bolivarValue' }
          }
        },
        {
          $lookup: {
            from: 'vehicles',
            localField: '_id',
            foreignField: '_id',
            as: 'vehicle'
          }
        },
        {
          $unwind: '$vehicle'
        },
        {
          $project: {
            vehicle: {
              plate: '$vehicle.plate',
              brand: '$vehicle.brand',
              model: '$vehicle.model',
              year: '$vehicle.year',
              color: '$vehicle.color',
              vehicleType: '$vehicle.vehicleType'
            },
            count: 1,
            totalRevenue: 1
          }
        },
        {
          $sort: { count: -1 }
        },
        {
          $limit: 10
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE011', _error).database();
      });

      return VEHICLES_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE012', _error).server() : _error;
    }
  },

  /**
   * @description Obtener resumen para dashboard
   * @param {String} _officerId - ID del oficial (opcional)
   * @returns {Promise} Promise with the response
   */
  async getDashboardSummarySV(_officerId) {
    try {
      const WHERE = _officerId ? { officer: _officerId } : {};

      const SUMMARY_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: null,
            totalFines: { $sum: 1 },
            sentFines: { $sum: { $cond: [{ $eq: ['$status', 'SENT'] }, 1, 0] } },
            draftFines: { $sum: { $cond: [{ $eq: ['$status', 'DRAFT'] }, 1, 0] } },
            paidFines: { $sum: { $cond: [{ $eq: ['$status', 'PAID'] }, 1, 0] } },
            cancelledFines: { $sum: { $cond: [{ $eq: ['$status', 'CANCELLED'] }, 1, 0] } },
            totalRevenue: { $sum: '$infraction.bolivarValue' }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE013', _error).database();
      });

      const RECENT_FINES = await FINE_MODEL.find(WHERE)
        .populate('infraction', 'code name severity')
        .populate('driver', 'firstName lastName idCard')
        .populate('vehicle', 'plate brand model')
        .sort({ createdAt: -1 })
        .limit(5)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'STATISTICSE014', _error).database();
        });

      return {
        ...SUMMARY_RESULT[0],
        recentFines: RECENT_FINES
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE015', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de recaudación
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getRevenueStatisticsSV(_filters) {
    try {
      const WHERE = {};
      
      if (_filters.officer) WHERE.officer = _filters.officer;
      
      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const REVENUE_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            totalRevenue: { $sum: '$infraction.bolivarValue' },
            totalTaxUnits: { $sum: '$infraction.taxUnits' },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE016', _error).database();
      });

      return REVENUE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE017', _error).server() : _error;
    }
  }
};
