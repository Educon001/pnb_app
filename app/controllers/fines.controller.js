'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { createFineSV, getFinesSV, getFineByIdSV, updateFineSV, sendFineSV, cancelFineSV, getFinesStatisticsSV, getDashboardSummarySV } = require('../services/fines.service');

module.exports = {
  /**
   * @description Crear nueva multa
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  createFineCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const FINE_RESULT = await createFineSV(_req.body, _req.police._id).catch((_error) => {
        console.log(_error);
        throw new CmmErrorClass(__filename, 'FINEE001').parseCatch(_error);
      });

      return CC_RESPONSE.send('Multa creada exitosamente', FINE_RESULT, 'FINES001');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE002', _error).server() : _error);
    }
  },

  /**
   * @description Obtener multas con filtros
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getFinesCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { status, officer, dateFrom, dateTo, severity, driverId, vehiclePlate, page = 1, limit = 10 } = _req.query;

      const FILTERS = {
        status: status,
          officer: officer,
        dateFrom: dateFrom,
        dateTo: dateTo,
        severity: severity,
        driverId: driverId,
        vehiclePlate: vehiclePlate
      };

      // Si no es admin o supervisor, solo puede ver sus propias multas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const RESULT = await getFinesSV(FILTERS, parseInt(page), parseInt(limit)).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE002').parseCatch(_error);
      });

      return CC_RESPONSE.send('Multas obtenidas exitosamente', RESULT, 'FINES002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE002', _error).server() : _error);
    }
  },

  /**
   * @description Obtener multa por ID
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getFineByIdCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const FINE_RESULT = await getFineByIdSV(id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE003').parseCatch(_error);
      });

      // Verificar permisos (solo el funcionario que creó la multa o un supervisor puede verla)
      if (FINE_RESULT.officer._id.toString() !== _req.police._id.toString()) {
        if (!_req.police.roles.includes('supervisor') && !_req.police.roles.includes('admin')) {
          throw new CmmErrorClass(__filename, 'FINEE004', 'No tiene permisos para ver esta multa').frontend();
        }
      }

      return CC_RESPONSE.send('Multa obtenida exitosamente', FINE_RESULT, 'FINES003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE003', _error).server() : _error);
    }
  },

  /**
   * @description Actualizar multa
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  updateFineCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const UPDATE_DATA = _req.body;

      const FINE_RESULT = await updateFineSV(id, UPDATE_DATA, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Multa actualizada exitosamente', FINE_RESULT, 'FINES004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE005', _error).server() : _error);
    }
  },

  /**
   * @description Enviar multa
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  sendFineCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const FINE_RESULT = await sendFineSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE006').parseCatch(_error);
      });

      return CC_RESPONSE.send('Multa enviada exitosamente', FINE_RESULT, 'FINES005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE006', _error).server() : _error);
    }
  },

  /**
   * @description Anular multa
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  cancelFineCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const { reason } = _req.body;

      if (!reason) {
        throw new CmmErrorClass(__filename, 'FINEE007', 'El motivo de anulación es obligatorio').returnValidate();
      }

      const FINE_RESULT = await cancelFineSV(id, reason, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE008').parseCatch(_error);
      });

      return CC_RESPONSE.send('Multa anulada exitosamente', FINE_RESULT, 'FINES006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE008', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de multas
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getFinesStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: _dateFrom,
        dateTo: _dateTo,
        officer: _officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getFinesStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE009').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas obtenidas exitosamente', STATISTICS_RESULT, 'FINES007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE009', _error).server() : _error);
    }
  },

  /**
   * @description Obtener resumen de multas para dashboard
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDashboardSummaryCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const FILTERS = {};

      // Si no es admin o supervisor, solo puede ver sus propias multas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getFinesStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE010').parseCatch(_error);
      });

      // Obtener multas recientes
      const RECENT_FINES_RESULT = await getFinesSV(FILTERS, 1, 5).catch((_error) => {
        throw new CmmErrorClass(__filename, 'FINEE011').parseCatch(_error);
      });

      return CC_RESPONSE.send('Resumen del dashboard obtenido exitosamente', {
        statistics: STATISTICS_RESULT,
        recent_fines: RECENT_FINES_RESULT.fines
      }, 'FINES008');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINEE010', _error).server() : _error);
    }
  }
};
