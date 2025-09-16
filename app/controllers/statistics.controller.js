'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { getGeneralStatisticsSV, getStatisticsByPeriodSV, getPerformanceStatisticsSV, getMostCommonInfractionsSV, getMostFrequentLocationsSV, getMostFinedVehiclesSV, getDashboardSummarySV, getStatisticsByStatusSV, getRevenueStatisticsSV } = require('../services/statistics.service');

module.exports = {
  /**
   * @description Obtener estadísticas generales
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getGeneralStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = police._id;
      }

      const STATISTICS_RESULT = await getGeneralStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE001').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas generales obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS001');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE001', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas por período
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getStatisticsByPeriodCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getStatisticsByPeriodSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE002').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas por período obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE002', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de rendimiento
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getPerformanceStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo
      };

      const STATISTICS_RESULT = await getPerformanceStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE003').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas de rendimiento obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE003', _error).server() : _error);
    }
  },

  /**
   * @description Obtener infracciones más comunes
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getMostCommonInfractionsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getMostCommonInfractionsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE004').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracciones más comunes obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE004', _error).server() : _error);
    }
  },

  /**
   * @description Obtener ubicaciones más frecuentes
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getMostFrequentLocationsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getMostFrequentLocationsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Ubicaciones más frecuentes obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE005', _error).server() : _error);
    }
  },

  /**
   * @description Obtener vehículos más multados
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getMostFinedVehiclesCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getMostFinedVehiclesSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE006').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículos más multados obtenidos exitosamente', STATISTICS_RESULT, 'STATISTICSS006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE006', _error).server() : _error);
    }
  },

  /**
   * @description Obtener resumen para dashboard
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDashboardSummaryCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      const OFFICER_ID = (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) 
        ? _req.police._id 
        : null;

      const SUMMARY_RESULT = await getDashboardSummarySV(OFFICER_ID).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE007').parseCatch(_error);
      });

      return CC_RESPONSE.send('Resumen del dashboard obtenido exitosamente', SUMMARY_RESULT, 'STATISTICSS007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE007', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de multas por estado
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getStatisticsByStatusCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getGeneralStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE008').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas por estado obtenidas exitosamente', {
        by_status: STATISTICS_RESULT.by_severity,
        total_fines: STATISTICS_RESULT.fines.total,
        total_revenue: STATISTICS_RESULT.fines.total_revenue
      }, 'STATISTICSS008');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE008', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de recaudación
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getRevenueStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { dateFrom, dateTo, officer } = _req.query;

      const FILTERS = {
        dateFrom: dateFrom,
        dateTo: dateTo,
        officer: officer
      };

      // Si no es admin o supervisor, solo puede ver sus propias estadísticas
      if (!_req.police.roles.includes('admin') && !_req.police.roles.includes('supervisor')) {
        FILTERS.officer = _req.police._id;
      }

      const STATISTICS_RESULT = await getRevenueStatisticsSV(FILTERS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'STATISTICSE009').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas de recaudación obtenidas exitosamente', STATISTICS_RESULT, 'STATISTICSS009');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'STATISTICSE009', _error).server() : _error);
    }
  }
};
