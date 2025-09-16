'use strict';

const { CmmErrorClass } = require('../utils');

/* Models */
const FINE_MODEL = require('../models/fine.model');
const INFRACTION_MODEL = require('../models/infraction.model');
const DRIVER_MODEL = require('../models/driver.model');
const VEHICLE_MODEL = require('../models/vehicle.model');
const POLICE_MODEL = require('../models/police.model');

/* Services */
const { sendFineMailSV } = require('./mail.service');

/* Constants */
const TAX_UNIT_VALUE = 60; // Valor por unidad tributaria en bolívares

/**
 * @description Formatear fecha a formato DD/MM/YYYY
 * @param {Date} _date - Fecha a formatear
 * @returns {String} Fecha formateada
 */
const formatDateSV = (_date) => {
  const DATE = new Date(_date);
  const DAY = String(DATE.getDate()).padStart(2, '0');
  const MONTH = String(DATE.getMonth() + 1).padStart(2, '0');
  const YEAR = DATE.getFullYear();
  return `${DAY}/${MONTH}/${YEAR}`;
};

module.exports = {
  /**
   * @description Crear nueva multa
   * @param {Object} _fineData - Datos de la multa
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async createFineSV(_fineData, _officerId) {
    try {
      // Para efectos de prueba, tomar el primer resultado de infracciones
      const INFRACTION_EXISTS = await INFRACTION_MODEL.findOne({ active: true }).catch((_error) => {
        console.log(_error);
        throw new CmmErrorClass(__filename, 'FINEE001', _error).database();
      });

      if (!INFRACTION_EXISTS) throw new CmmErrorClass(__filename, 'FINEE002', 'No hay infracciones disponibles').frontend();


      // Validar que el conductor existe
      const DRIVER_EXISTS = await DRIVER_MODEL.findOne({ active: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE003', _error).database();
      });

      if (!DRIVER_EXISTS) throw new CmmErrorClass(__filename, 'FINEE004', 'Conductor no encontrado').frontend();


      // Validar que el vehículo existe
      const VEHICLE_EXISTS = await VEHICLE_MODEL.findOne({ active: true }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE005', _error).database();
      });

      if (!VEHICLE_EXISTS) throw new CmmErrorClass(__filename, 'FINEE006', 'Vehículo no encontrado').frontend();


      // Generar número de multa único
      const FINE_NUMBER = await module.exports.generateFineNumberSV();

      // Calcular el amount basado en las unidades tributarias
      const CALCULATED_AMOUNT = INFRACTION_EXISTS.taxUnits * TAX_UNIT_VALUE;

      const FINE_DATA = {
        ..._fineData,
        infraction: INFRACTION_EXISTS._id,
        driver: DRIVER_EXISTS._id,
        vehicle: VEHICLE_EXISTS._id,
        fineNumber: FINE_NUMBER,
        officer: _officerId,
        amount: CALCULATED_AMOUNT,
        createdAt: new Date()
      };

      const FINE_RESULT = await FINE_MODEL.create(FINE_DATA).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE007', _error).database();
      });

      // Obtener datos completos para el correo
      const FINE_WITH_POPULATE = await FINE_MODEL.findById(FINE_RESULT._id)
        .populate('infraction', 'code name description article severity taxUnits')
        .populate('driver', 'firstName lastName idCard email')
        .populate('vehicle', 'plate brand model year color vehicleType')
        .populate('officer', 'firstName lastName idCard badgeNumber')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE036', _error).database();
        });

      // Calcular el monto de la multa

      // Preparar datos para el correo
      const MAIL_DATA = {
        fineId: FINE_WITH_POPULATE.fineNumber,
        date: formatDateSV(FINE_WITH_POPULATE.infractionDate || new Date()),
        offense: FINE_WITH_POPULATE.infraction.name,
        article: FINE_WITH_POPULATE.infraction.article,
        plate: FINE_WITH_POPULATE.vehicle.plate,
        model: `${FINE_WITH_POPULATE.vehicle.brand} ${FINE_WITH_POPULATE.vehicle.model} ${FINE_WITH_POPULATE.vehicle.year}`,
        color: FINE_WITH_POPULATE.vehicle.color,
        amount: `Bs. ${CALCULATED_AMOUNT.toLocaleString('es-VE')}`,
        officer: `${FINE_WITH_POPULATE.officer.firstName} ${FINE_WITH_POPULATE.officer.lastName}`,
        officerId: FINE_WITH_POPULATE.officer.idCard,
        paymentDeadline: formatDateSV(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // 15 días
        reconsiderationDeadline: formatDateSV(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)) // 5 días
      };


      const MAIL_RESULT = await sendFineMailSV([_fineData.driverEmail], MAIL_DATA);
      console.log(MAIL_RESULT);
      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE008', _error).server() : _error;
    }
  },

  /**
   * @description Obtener multas con filtros
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getFinesSV(_filters, _page, _limit) {
    try {
      const WHERE = {};

      if (_filters.status) WHERE.status = _filters.status;
      if (_filters.officer) WHERE.officer = _filters.officer;
      if (_filters.severity) WHERE['infraction.severity'] = _filters.severity;
      if (_filters.driverId) WHERE['driver.idCard'] = _filters.driverId;
      if (_filters.vehiclePlate) WHERE['vehicle.plate'] = _filters.vehiclePlate;

      if (_filters.dateFrom || _filters.dateTo) {
        WHERE.createdAt = {};
        if (_filters.dateFrom) WHERE.createdAt.$gte = new Date(_filters.dateFrom);
        if (_filters.dateTo) WHERE.createdAt.$lte = new Date(_filters.dateTo);
      }

      const SKIP = (_page - 1) * _limit;

      const FINES_RESULT = await FINE_MODEL.find(WHERE)
        .populate('infraction', 'code name description article severity taxUnits bolivarValue')
        .populate('driver', 'firstName lastName idCard licenseNumber licenseGrade')
        .populate('vehicle', 'plate brand model year color vehicleType')
        .populate('officer', 'firstName lastName idCard badgeNumber')
        .sort({ createdAt: -1 })
        .skip(SKIP)
        .limit(_limit)
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE009', _error).database();
        });

      const TOTAL_COUNT = await FINE_MODEL.countDocuments(WHERE).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE010', _error).database();
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
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE011', _error).server() : _error;
    }
  },

  /**
   * @description Obtener multa por ID
   * @param {String} _id - ID de la multa
   * @returns {Promise} Promise with the response
   */
  async getFineByIdSV(_id) {
    try {
      const FINE_RESULT = await FINE_MODEL.findById(_id)
        .populate('infraction')
        .populate('driver')
        .populate('vehicle')
        .populate('officer')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE012', _error).database();
        });

      if (!FINE_RESULT) {
        throw new CmmErrorClass(__filename, 'FINEE013', 'Multa no encontrada').frontend();
      }

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE014', _error).server() : _error;
    }
  },

  /**
   * @description Actualizar multa
   * @param {String} _id - ID de la multa
   * @param {Object} _updateData - Datos a actualizar
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async updateFineSV(_id, _updateData, _officerId) {
    try {
      const FINE_EXISTS = await FINE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE015', _error).database();
      });

      if (!FINE_EXISTS) {
        throw new CmmErrorClass(__filename, 'FINEE016', 'Multa no encontrada').frontend();
      }

      // Solo se puede actualizar si es borrador o si es el mismo oficial
      if (FINE_EXISTS.status !== 'DRAFT' && FINE_EXISTS.officer.toString() !== _officerId) {
        throw new CmmErrorClass(__filename, 'FINEE017', 'No tiene permisos para actualizar esta multa').frontend();
      }

      const UPDATE_DATA = {
        ..._updateData,
        updatedAt: new Date()
      };

      const FINE_RESULT = await FINE_MODEL.findByIdAndUpdate(_id, UPDATE_DATA, { new: true })
        .populate('infraction')
        .populate('driver')
        .populate('vehicle')
        .populate('officer')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE018', _error).database();
        });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE019', _error).server() : _error;
    }
  },

  /**
   * @description Enviar multa
   * @param {String} _id - ID de la multa
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async sendFineSV(_id, _officerId) {
    try {
      const FINE_EXISTS = await FINE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE020', _error).database();
      });

      if (!FINE_EXISTS) {
        throw new CmmErrorClass(__filename, 'FINEE021', 'Multa no encontrada').frontend();
      }

      if (FINE_EXISTS.status !== 'DRAFT') {
        throw new CmmErrorClass(__filename, 'FINEE022', 'Solo se pueden enviar multas en estado borrador').frontend();
      }

      if (FINE_EXISTS.officer.toString() !== _officerId) {
        throw new CmmErrorClass(__filename, 'FINEE023', 'No tiene permisos para enviar esta multa').frontend();
      }

      const FINE_RESULT = await FINE_MODEL.findByIdAndUpdate(_id,
        {
          status: 'SENT',
          sentAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      ).populate('infraction')
        .populate('driver')
        .populate('vehicle')
        .populate('officer')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE024', _error).database();
        });

      // Preparar datos para el correo
      const MAIL_DATA = {
        fineId: FINE_RESULT.fineNumber,
        date: formatDateSV(FINE_RESULT.infractionDate || new Date()),
        offense: FINE_RESULT.infraction.name,
        article: FINE_RESULT.infraction.article,
        plate: FINE_RESULT.vehicle.plate,
        model: `${FINE_RESULT.vehicle.brand} ${FINE_RESULT.vehicle.model} ${FINE_RESULT.vehicle.year}`,
        color: FINE_RESULT.vehicle.color,
        amount: `Bs. ${FINE_RESULT.amount.toLocaleString('es-VE')}`,
        officer: `${FINE_RESULT.officer.firstName} ${FINE_RESULT.officer.lastName}`,
        officerId: FINE_RESULT.officer.idCard,
        paymentDeadline: formatDateSV(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)), // 15 días
        reconsiderationDeadline: formatDateSV(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)) // 5 días
      };

      await sendFineMailSV([FINE_RESULT.driver.email], MAIL_DATA);

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE025', _error).server() : _error;
    }
  },

  /**
   * @description Anular multa
   * @param {String} _id - ID de la multa
   * @param {String} _reason - Motivo de anulación
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async cancelFineSV(_id, _reason, _officerId) {
    try {
      const FINE_EXISTS = await FINE_MODEL.findById(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE026', _error).database();
      });

      if (!FINE_EXISTS) {
        throw new CmmErrorClass(__filename, 'FINEE027', 'Multa no encontrada').frontend();
      }

      if (FINE_EXISTS.status === 'CANCELLED') {
        throw new CmmErrorClass(__filename, 'FINEE028', 'La multa ya está anulada').frontend();
      }

      if (FINE_EXISTS.status === 'PAID') {
        throw new CmmErrorClass(__filename, 'FINEE029', 'No se puede anular una multa ya pagada').frontend();
      }

      const FINE_RESULT = await FINE_MODEL.findByIdAndUpdate(_id,
        {
          status: 'CANCELLED',
          cancellationReason: _reason,
          cancelledAt: new Date(),
          cancelledBy: _officerId,
          updatedAt: new Date()
        },
        { new: true }
      ).populate('infraction')
        .populate('driver')
        .populate('vehicle')
        .populate('officer')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'FINEE030', _error).database();
        });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE031', _error).server() : _error;
    }
  },

  /**
   * @description Obtener estadísticas de multas
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getFinesStatisticsSV(_filters) {
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
            total: { $sum: 1 },
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
            totalRevenue: { $sum: '$infraction.bolivarValue' }
          }
        }
      ]).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE032', _error).database();
      });

      return STATISTICS_RESULT[0] || {
        total: 0,
        byStatus: [],
        bySeverity: [],
        totalRevenue: 0
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE033', _error).server() : _error;
    }
  },

  /**
   * @description Generar número de multa único
   * @returns {Promise} Promise with the response
   */
  async generateFineNumberSV() {
    try {
      const TODAY = new Date();
      const YEAR = TODAY.getFullYear();
      const MONTH = String(TODAY.getMonth() + 1).padStart(2, '0');

      const PREFIX = `M-${YEAR}${MONTH}`;

      const LAST_FINE = await FINE_MODEL.findOne({
        fineNumber: { $regex: `^${PREFIX}` }
      }).sort({ fineNumber: -1 }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE034', _error).database();
      });

      let SEQUENCE = 1;
      if (LAST_FINE) {
        const LAST_SEQUENCE = parseInt(LAST_FINE.fineNumber.split('-')[2]);
        SEQUENCE = LAST_SEQUENCE + 1;
      }

      return `${PREFIX}-${String(SEQUENCE).padStart(4, '0')}`;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'FINEE035', _error).server() : _error;
    }
  }
};
