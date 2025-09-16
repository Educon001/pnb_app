'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { createInfractionSV, getInfractionsSV, getInfractionByIdSV, updateInfractionSV, deleteInfractionSV, getInfractionsBySeveritySV, getInfractionsByVehicleTypeSV, getInfractionsStatisticsSV, searchInfractionsSV } = require('../services/infractions.service');

module.exports = {
  /**
   * @description Crear nueva infracción
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  createInfractionCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { code, name, description, article, severity, vehicleType, taxUnits, bolivarValue, licensePoints, requiresPhoto, requiresEvidence } = _req.body;

      // Validaciones básicas
      if (!code || !name || !description || !article || !severity) {
        throw new CmmErrorClass(__filename, 'INFRACTION001', 'Código, nombre, descripción, artículo y gravedad son obligatorios').returnValidate();
      }

      if (!taxUnits || !bolivarValue) {
        throw new CmmErrorClass(__filename, 'INFRACTION002', 'Unidades tributarias y valor en bolívares son obligatorios').returnValidate();
      }

      const INFRACTION_RESULT = await createInfractionSV(_req.body, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION003').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracción creada exitosamente', INFRACTION_RESULT, 'INFRACTION001');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION003', _error).server() : _error);
    }
  },

  /**
   * @description Obtener infracciones con filtros
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getInfractionsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { active, severity, vehicleType, search, page = 1, limit = 10 } = _req.query;

      const FILTERS = {
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        severity: severity,
        vehicleType: vehicleType,
        search: search
      };

      const RESULT = await getInfractionsSV(FILTERS, parseInt(page), parseInt(limit)).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION004').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracciones obtenidas exitosamente', RESULT, 'INFRACTION002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION004', _error).server() : _error);
    }
  },

  /**
   * @description Obtener infracción por ID
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getInfractionByIdCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const INFRACTION_RESULT = await getInfractionByIdSV(id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracción obtenida exitosamente', INFRACTION_RESULT, 'INFRACTION003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION005', _error).server() : _error);
    }
  },

  /**
   * @description Actualizar infracción
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  updateInfractionCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const UPDATE_DATA = _req.body;

      const INFRACTION_RESULT = await updateInfractionSV(id, UPDATE_DATA, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION006').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracción actualizada exitosamente', INFRACTION_RESULT, 'INFRACTION004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION006', _error).server() : _error);
    }
  },

  /**
   * @description Eliminar infracción
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  deleteInfractionCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const RESULT = await deleteInfractionSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION007').parseCatch(_error);
      });

      return CC_RESPONSE.send(RESULT.message, null, 'INFRACTION005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION007', _error).server() : _error);
    }
  },

  /**
   * @description Obtener infracciones por gravedad
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getInfractionsBySeverityCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { severity } = _req.params;
      const INFRACTIONS_RESULT = await getInfractionsBySeveritySV(severity).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION008').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracciones obtenidas exitosamente', INFRACTIONS_RESULT, 'INFRACTION006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION008', _error).server() : _error);
    }
  },

  /**
   * @description Obtener infracciones por tipo de vehículo
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getInfractionsByVehicleTypeCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { type } = _req.params;
      const INFRACTIONS_RESULT = await getInfractionsByVehicleTypeSV(type).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION009').parseCatch(_error);
      });

      return CC_RESPONSE.send('Infracciones obtenidas exitosamente', INFRACTIONS_RESULT, 'INFRACTION007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION009', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de infracciones
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getInfractionsStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const STATISTICS_RESULT = await getInfractionsStatisticsSV().catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION010').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas obtenidas exitosamente', STATISTICS_RESULT, 'INFRACTION008');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION010', _error).server() : _error);
    }
  },

  /**
   * @description Buscar infracciones
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  searchInfractionsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { term } = _req.query;

      if (!term || term.length < 2) {
        throw new CmmErrorClass(__filename, 'INFRACTION011', 'El término de búsqueda debe tener al menos 2 caracteres').returnValidate();
      }

      const INFRACTIONS_RESULT = await searchInfractionsSV(term).catch((_error) => {
        throw new CmmErrorClass(__filename, 'INFRACTION012').parseCatch(_error);
      });

      return CC_RESPONSE.send('Búsqueda completada exitosamente', INFRACTIONS_RESULT, 'INFRACTION009');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'INFRACTION012', _error).server() : _error);
    }
  }
};
