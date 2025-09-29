'use strict';

const { CmmErrorClass, formatDateSV } = require('../utils');

/* Models */
const INFRACTION_MODEL = require('../models/infraction.model');
const POLICE_MODEL = require('../models/police.model');

/* Services */
const { sendFineMailSV } = require('./mail.service');

/* Patterns */
const FineRepository = require('../repositories/fine.repository');
const FineBuilder = require('../builders/fine.builder');
const FineFactory = require('../factories/fine.factory');

/* Constants */
const TAX_UNIT_VALUE = 60; // Valor por unidad tributaria en bolívares

/* Repository Instance */
const fineRepository = new FineRepository();

module.exports = {
  /**
   * @description Crear nueva multa usando patrones de diseño
   * @param {Object} _fineData - Datos de la multa
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async createFineSV(_fineData, _officerId) {
    try {
      // Validar que la infracción existe
      const INFRACTION_EXISTS = await INFRACTION_MODEL.findById(_fineData.infractionId).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-SFINE001', _error).database();
      });

      if (!INFRACTION_EXISTS) {
        throw new CmmErrorClass(__filename, 'CPNB-SFINE002', 'Infracción no encontrada').frontend();
      }

      // Generar números únicos usando Repository
      const FINE_NUMBER = await fineRepository.generateFineNumber();
      const INFRACTION_REFERENCE = await fineRepository.generateInfractionReference();

      // Calcular el monto basado en las unidades tributarias
      const CALCULATED_AMOUNT = INFRACTION_EXISTS.taxUnits * TAX_UNIT_VALUE;

      // Usar Factory para crear datos de la multa
      const FINE_DATA = FineFactory.createStandardFine({
        ..._fineData,
        fineNumber: FINE_NUMBER,
        infractionReference: INFRACTION_REFERENCE,
        infractionId: INFRACTION_EXISTS._id,
        officerId: _officerId,
        infractionAmount: CALCULATED_AMOUNT,
        infractionUT: INFRACTION_EXISTS.taxUnits
      });

      // Crear multa usando Repository
      const FINE_RESULT = await fineRepository.create(FINE_DATA);

      // Obtener datos completos para el correo usando Repository
      const FINE_WITH_POPULATE = await fineRepository.findById(FINE_RESULT._id, {
        infraction: 'code name description article severity taxUnits',
        officer: 'firstName lastName idCard badgeNumber'
      });

      // Usar Factory para crear datos de correo
      const MAIL_DATA = FineFactory.createMailData(
        FINE_WITH_POPULATE,
        FINE_WITH_POPULATE.infraction,
        FINE_WITH_POPULATE.officer
      );

      // Formatear fechas para el correo
      const FORMATTED_MAIL_DATA = {
        ...MAIL_DATA,
        date: formatDateSV(MAIL_DATA.date),
        paymentDeadline: formatDateSV(MAIL_DATA.paymentDeadline),
        reconsiderationDeadline: formatDateSV(MAIL_DATA.reconsiderationDeadline)
      };

      // Enviar correo
      await sendFineMailSV([FINE_WITH_POPULATE.driver.email], FORMATTED_MAIL_DATA).catch(_error => {
        console.log('Error enviando correo:', _error);
        // No lanzar error, solo logear
      });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE008', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener multas con filtros usando Repository
   * @param {Object} _filters - Filtros de búsqueda
   * @param {Number} _page - Página actual
   * @param {Number} _limit - Límite por página
   * @returns {Promise} Promise with the response
   */
  async getFinesSV(_filters, _page, _limit) {
    try {
      // Usar Factory para crear filtros
      const SEARCH_FILTERS = FineFactory.createSearchFilters(_filters);

      // Usar Repository para obtener multas
      const RESULT = await fineRepository.findByFilters(
        SEARCH_FILTERS,
        _page,
        _limit,
        {
          infraction: 'code name description article severity taxUnits',
          officer: 'firstName lastName idCard badgeNumber'
        }
      );

      return RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE011', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener multa por ID usando Repository
   * @param {String} _id - ID de la multa
   * @returns {Promise} Promise with the response
   */
  async getFineByIdSV(_id) {
    try {
      const FINE_RESULT = await fineRepository.findById(_id, {
        infraction: 'code name description article severity taxUnits',
        officer: 'firstName lastName idCard badgeNumber'
      });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE014', _error).server()
        : _error;
    }
  },

  /**
   * @description Actualizar multa usando Repository
   * @param {String} _id - ID de la multa
   * @param {Object} _updateData - Datos a actualizar
   * @param {String} _officerId - ID del oficial
   * @returns {Promise} Promise with the response
   */
  async updateFineSV(_id, _updateData, _officerId) {
    try {
      // Verificar que la multa existe y tiene permisos
      const FINE_EXISTS = await fineRepository.findById(_id);

      // Solo se puede actualizar si es borrador o si es el mismo oficial
      if (
        FINE_EXISTS.status !== 'DRAFT' &&
        FINE_EXISTS.officer.toString() !== _officerId
      ) {
        throw new CmmErrorClass(
          __filename,
          'CPNB-SFINE017',
          'No tiene permisos para actualizar esta multa'
        ).frontend();
      }

      // Usar Factory para crear datos de actualización
      const UPDATE_DATA = FineFactory.createUpdateData(_updateData);

      // Usar Repository para actualizar
      const FINE_RESULT = await fineRepository.update(_id, UPDATE_DATA, {
        infraction: 'code name description article severity taxUnits',
        officer: 'firstName lastName idCard badgeNumber'
      });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE019', _error).server()
        : _error;
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
      const FINE_EXISTS = await FINE_MODEL.findById(_id).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-SFINE020', _error).database();
      });

      if (!FINE_EXISTS) {
        throw new CmmErrorClass(
          __filename,
          'CPNB-SFINE021',
          'Multa no encontrada'
        ).frontend();
      }

      if (FINE_EXISTS.status !== 'DRAFT') {
        throw new CmmErrorClass(
          __filename,
          'CPNB-SFINE022',
          'Solo se pueden enviar multas en estado borrador'
        ).frontend();
      }

      if (FINE_EXISTS.officer.toString() !== _officerId) {
        throw new CmmErrorClass(
          __filename,
          'CPNB-SFINE023',
          'No tiene permisos para enviar esta multa'
        ).frontend();
      }

      const FINE_RESULT = await FINE_MODEL.findByIdAndUpdate(
        _id,
        {
          status: 'SENT',
          sentAt: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('infraction', 'code name description article severity taxUnits')
        .populate('officer', 'firstName lastName idCard badgeNumber')
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'CPNB-SFINE024', _error).database();
        });

      // Preparar variables para la plantilla de email
      const EMAIL_VARIABLES = {
        fineId: FINE_RESULT.fineNumber,
        date: formatDateSV(FINE_RESULT.infractionDate),
        offense: FINE_RESULT.infraction.name,
        article: FINE_RESULT.infraction.article,
        plate: FINE_RESULT.vehicle.plate,
        model: `${FINE_RESULT.vehicle.brand} ${FINE_RESULT.vehicle.model} ${FINE_RESULT.vehicle.year}`,
        color: FINE_RESULT.vehicle.color,
        amount: `Bs. ${FINE_RESULT.infractionAmount.toLocaleString('es-VE')}`,
        officer: `${FINE_RESULT.officer.firstName} ${FINE_RESULT.officer.lastName}`,
        officerId: FINE_RESULT.officer.idCard,
        paymentDeadline: formatDateSV(
          new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
        ), // 15 días
        reconsiderationDeadline: formatDateSV(
          new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        ) // 5 días
      };

      await sendFineMailSV([FINE_RESULT.driver.email], MAIL_DATA);

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE025', _error).server()
        : _error;
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
      const FINE_EXISTS = await FINE_MODEL.findById(_id).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-SFINE026', _error).database();
      });

      if (!FINE_EXISTS) throw new CmmErrorClass(__filename, 'CPNB-SFINE027', 'Multa no encontrada').frontend(); 
       
      if (FINE_EXISTS.status === 'CANCELLED') throw new CmmErrorClass(__filename, 'CPNB-SFINE028', 'La multa ya está anulada').frontend();   

      if (FINE_EXISTS.status === 'PAID') throw new CmmErrorClass(__filename, 'CPNB-SFINE029', 'No se puede anular una multa ya pagada').frontend(); 

      if (FINE_EXISTS.status === 'RECONSIDERATION') throw new CmmErrorClass(__filename, 'CPNB-SFINE030', 'No se puede anular una multa en proceso de reconsideración').frontend(); 

      if (FINE_EXISTS.status === 'SENT') throw new CmmErrorClass(__filename, 'CPNB-SFINE031', 'No se puede anular una multa ya enviada').frontend(); 

      if (FINE_EXISTS.status === 'PAID') { throw new CmmErrorClass(__filename, 'CPNB-SFINE032', 'No se puede anular una multa ya pagada').frontend(); 
      }

      const FINE_RESULT = await FINE_MODEL.findByIdAndUpdate(
        _id,
        {
          status: 'CANCELLED',
          cancellationReason: _reason,
          cancelledAt: new Date(),
          cancelledBy: _officerId,
          updatedAt: new Date()
        },
        { new: true }
      )
        .populate('infraction', 'code name description article severity taxUnits')
        .populate('officer', 'firstName lastName idCard badgeNumber')
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'CPNB-SFINE030', _error).database();
        });

      return FINE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE031', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener estadísticas de multas usando Repository
   * @param {Object} _filters - Filtros de búsqueda
   * @returns {Promise} Promise with the response
   */
  async getFinesStatisticsSV(_filters) {
    try {
      // Usar Factory para crear filtros
      const SEARCH_FILTERS = FineFactory.createSearchFilters(_filters);

      // Usar Repository para obtener estadísticas
      const STATISTICS_RESULT = await fineRepository.getStatistics(SEARCH_FILTERS);

      return STATISTICS_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SFINE033', _error).server()
        : _error;
    }
  }
};
