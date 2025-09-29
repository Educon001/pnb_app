'use strict';

const { CmmErrorClass } = require('../utils');
const FINE_MODEL = require('../models/fine.model');

/**
 * @description Repository para operaciones de base de datos de multas
 * Implementa el patrón Repository para separar la lógica de acceso a datos
 */
class FineRepository {
  /**
   * @description Crear nueva multa
   * @param {Object} _fineData - Datos de la multa
   * @returns {Promise} Promise con la multa creada
   */
  async create(_fineData) {
    try {
      const FINE_RESULT = await FINE_MODEL.create(_fineData).catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE001', _error).database();
      });
      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE002', _error).server() : _error;
    }
  }

  /**
   * @description Buscar multa por ID
   * @param {String} _id - ID de la multa
   * @param {Object} _populateOptions - Opciones de populate
   * @returns {Promise} Promise con la multa encontrada
   */
  async findById(_id, _populateOptions = {}) {
    try {
      let query = FINE_MODEL.findById(_id);
      
      if (_populateOptions.infraction) {
        query = query.populate('infraction', _populateOptions.infraction);
      }
      if (_populateOptions.officer) {
        query = query.populate('officer', _populateOptions.officer);
      }
      
      const FINE_RESULT = await query.catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE003', _error).database();
      });

      if (!FINE_RESULT) {
        throw new CmmErrorClass(__filename, 'FINEE004', 'Multa no encontrada').frontend();
      }

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE005', _error).server() : _error;
    }
  }

  /**
   * @description Buscar multas con filtros y paginación
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @param {Object} _populateOptions - Opciones de populate
   * @returns {Promise} Promise con las multas encontradas
   */
  async findByFilters(_filters, _page, _limit, _populateOptions = {}) {
    try {
      const WHERE = this._buildWhereClause(_filters);
      const SKIP = (_page - 1) * _limit;

      let query = FINE_MODEL.find(WHERE);
      
      if (_populateOptions.infraction) {
        query = query.populate('infraction', _populateOptions.infraction);
      }
      if (_populateOptions.officer) {
        query = query.populate('officer', _populateOptions.officer);
      }
      
      const FINES_RESULT = await query
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'FINEE006', _error).database();
        });

      const TOTAL_COUNT = await FINE_MODEL.countDocuments(WHERE).catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE007', _error).database();
      });

      return {
        fines: FINES_RESULT,
        pagination: {
          currentPage: _page,
          totalPages: Math.ceil(TOTAL_COUNT / _limit),
          totalItems: TOTAL_COUNT,
          itemsPerPage: _limit
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE008', _error).server() : _error;
    }
  }

  /**
   * @description Actualizar multa
   * @param {String} _id - ID de la multa
   * @param {Object} _updateData - Datos a actualizar
   * @param {Object} _populateOptions - Opciones de populate
   * @returns {Promise} Promise con la multa actualizada
   */
  async update(_id, _updateData, _populateOptions = {}) {
    try {
      let query = FINE_MODEL.findByIdAndUpdate(_id, _updateData, { new: true });
      
      if (_populateOptions.infraction) {
        query = query.populate('infraction', _populateOptions.infraction);
      }
      if (_populateOptions.officer) {
        query = query.populate('officer', _populateOptions.officer);
      }
      
      const FINE_RESULT = await query.catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE009', _error).database();
      });

      if (!FINE_RESULT) {
        throw new CmmErrorClass(__filename, 'FINEE010', 'Multa no encontrada').frontend();
      }

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE011', _error).server() : _error;
    }
  }

  /**
   * @description Buscar multa por número de multa
   * @param {String} _fineNumber - Número de la multa
   * @returns {Promise} Promise con la multa encontrada
   */
  async findByFineNumber(_fineNumber) {
    try {
      const FINE_RESULT = await FINE_MODEL.findOne({ fineNumber: _fineNumber }).catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE012', _error).database();
      });

      if (!FINE_RESULT) {
        throw new CmmErrorClass(__filename, 'FINEE013', 'Multa no encontrada').frontend();
      }

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE014', _error).server() : _error;
    }
  }

  /**
   * @description Obtener estadísticas de multas
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise con las estadísticas
   */
  async getStatistics(_filters) {
    try {
      const WHERE = this._buildWhereClause(_filters);

      const STATISTICS_RESULT = await FINE_MODEL.aggregate([
        { $match: WHERE },
        {
          $lookup: {
            from: 'infractions',
            localField: 'infraction',
            foreignField: '_id',
            as: 'infractionData'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            byStatus: {
              $push: {
                status: '$status',
                count: 1
              }
            },
            totalRevenue: { $sum: '$infractionAmount' }
          }
        }
      ]).catch(_error => {
        throw new CmmErrorClass(__filename, 'FINEE015', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        total: 0,
        byStatus: [],
        totalRevenue: 0
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE016', _error).server() : _error;
    }
  }

  /**
   * @description Generar número de multa único
   * @returns {Promise} Promise con el número generado
   */
  async generateFineNumber() {
    try {
      const TODAY = new Date();
      const YEAR = TODAY.getFullYear();
      const MONTH = String(TODAY.getMonth() + 1).padStart(2, '0');
      const PREFIX = `M-${YEAR}${MONTH}`;

      const LAST_FINE = await FINE_MODEL.findOne({
        fineNumber: { $regex: `^${PREFIX}` }
      })
        .sort({ fineNumber: -1 })
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'FINEE017', _error).database();
        });

      let SEQUENCE = 1;
      if (LAST_FINE) {
        const LAST_SEQUENCE = parseInt(LAST_FINE.fineNumber.split('-')[2]);
        SEQUENCE = LAST_SEQUENCE + 1;
      }

      return `${PREFIX}-${String(SEQUENCE).padStart(4, '0')}`;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE018', _error).server() : _error;
    }
  }

  /**
   * @description Generar referencia de infracción única
   * @returns {Promise} Promise con la referencia generada
   */
  async generateInfractionReference() {
    try {
      const TODAY = new Date();
      const YEAR = TODAY.getFullYear();
      const MONTH = String(TODAY.getMonth() + 1).padStart(2, '0');
      const PREFIX = `M-${YEAR}${MONTH}`;

      const LAST_FINE = await FINE_MODEL.findOne({
        infractionReference: { $regex: `^${PREFIX}` }
      })
        .sort({ infractionReference: -1 })
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'FINEE019', _error).database();
        });

      let SEQUENCE = 1;
      if (LAST_FINE) {
        const LAST_SEQUENCE = parseInt(LAST_FINE.infractionReference.split('-')[2]);
        SEQUENCE = LAST_SEQUENCE + 1;
      }

      return `${PREFIX}-${String(SEQUENCE).padStart(4, '0')}`;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE020', _error).server() : _error;
    }
  }

  /**
   * @description Construir cláusula WHERE para filtros
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Object} Cláusula WHERE construida
   * @private
   */
  _buildWhereClause(_filters) {
    const WHERE = {};

    if (_filters.status) WHERE.status = _filters.status;
    if (_filters.officer) WHERE.officer = _filters.officer;
    if (_filters.driverId) WHERE['driver.documentNumber'] = _filters.driverId;
    if (_filters.vehiclePlate) WHERE['vehicle.plate'] = _filters.vehiclePlate;

    if (_filters.dateFrom || _filters.dateTo) {
      WHERE.createdAt = {};
      if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
      if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
    }

    return WHERE;
  }
}

module.exports = FineRepository;
