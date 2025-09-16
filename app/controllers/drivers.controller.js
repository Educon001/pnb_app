'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { createDriverSV, getDriversSV, getDriverByIdSV, getDriverByIdCardSV, updateDriverSV, suspendDriverSV, reactivateDriverSV, deleteDriverSV, getDriversStatisticsSV, searchDriversSV, checkExpiredLicenseSV } = require('../services/drivers.service');

module.exports = {
  /**
   * @description Crear nuevo conductor
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  createDriverCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { firstName, lastName, idCard, licenseNumber, licenseGrade, licenseIssueDate, licenseExpiryDate, phone, email, address, birthDate, nationality, gender } = _req.body;

      // Validaciones básicas
      if (!firstName || !lastName || !idCard || !licenseNumber || !licenseGrade) {
        throw new CmmErrorClass(__filename, 'DRIVERE001', 'Nombres, apellidos, cédula, número de licencia y grado son obligatorios').returnValidate();
      }

      if (!licenseIssueDate || !licenseExpiryDate) {
        throw new CmmErrorClass(__filename, 'DRIVERE002', 'Fechas de emisión y vencimiento de licencia son obligatorias').returnValidate();
      }

      if (!address || !birthDate || !gender) {
        throw new CmmErrorClass(__filename, 'DRIVERE003', 'Dirección, fecha de nacimiento y sexo son obligatorios').returnValidate();
      }

      const DRIVER_RESULT = await createDriverSV(_req.body, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE004').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor creado exitosamente', DRIVER_RESULT, 'DRIVERS001');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE004', _error).server() : _error);
    }
  },

  /**
   * @description Obtener conductores con filtros
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDriversCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { active, suspended, licenseGrade, search, page = 1, limit = 10 } = _req.query;

      const FILTERS = {
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        suspended: suspended === 'true' ? true : suspended === 'false' ? false : undefined,
        licenseGrade: _licenseGrade,
        search: _search
      };

      const RESULT = await getDriversSV(FILTERS, parseInt(page), parseInt(limit)).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductores obtenidos exitosamente', RESULT, 'DRIVERS002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE005', _error).server() : _error);
    }
  },

  /**
   * @description Obtener conductor por ID
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDriverByIdCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const DRIVER_RESULT = await getDriverByIdSV(_id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE006').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor obtenido exitosamente', DRIVER_RESULT, 'DRIVERS003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE006', _error).server() : _error);
    }
  },

  /**
   * @description Obtener conductor por cédula
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDriverByIdCardCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { idCard } = _req.params;
      const DRIVER_RESULT = await getDriverByIdCardSV(idCard).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE007').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor obtenido exitosamente', DRIVER_RESULT, 'DRIVERS004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE007', _error).server() : _error);
    }
  },

  /**
   * @description Actualizar conductor
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  updateDriverCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const UPDATE_DATA = _req.body;

      const DRIVER_RESULT = await updateDriverSV(id, UPDATE_DATA, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE008').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor actualizado exitosamente', DRIVER_RESULT, 'DRIVERS005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE008', _error).server() : _error);
    }
  },

  /**
   * @description Suspender conductor
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  suspendDriverCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const { reason } = _req.body;

      if (!reason) {
        throw new CmmErrorClass(__filename, 'DRIVERE009', 'El motivo de suspensión es obligatorio').returnValidate();
      }

      const DRIVER_RESULT = await suspendDriverSV(id, reason, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE010').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor suspendido exitosamente', DRIVER_RESULT, 'DRIVERS006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE010', _error).server() : _error);
    }
  },

  /**
   * @description Reactivar conductor
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  reactivateDriverCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const DRIVER_RESULT = await reactivateDriverSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE011').parseCatch(_error);
      });

      return CC_RESPONSE.send('Conductor reactivado exitosamente', DRIVER_RESULT, 'DRIVERS007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE011', _error).server() : _error);
    }
  },

  /**
   * @description Eliminar conductor
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  deleteDriverCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const RESULT = await deleteDriverSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE012').parseCatch(_error);
      });

      return CC_RESPONSE.send(RESULT.message, null, 'DRIVERS008');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE012', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de conductores
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getDriversStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const STATISTICS_RESULT = await getDriversStatisticsSV().catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE013').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas obtenidas exitosamente', STATISTICS_RESULT, 'DRIVERS009');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE013', _error).server() : _error);
    }
  },

  /**
   * @description Buscar conductores
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  searchDriversCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { term } = _req.query;

      if (!term || term.length < 2) {
        throw new CmmErrorClass(__filename, 'DRIVERE014', 'El término de búsqueda debe tener al menos 2 caracteres').returnValidate();
      }

      const DRIVERS_RESULT = await searchDriversSV(term).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE015').parseCatch(_error);
      });

      return CC_RESPONSE.send('Búsqueda completada exitosamente', DRIVERS_RESULT, 'DRIVERS010');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE015', _error).server() : _error);
    }
  },

  /**
   * @description Verificar licencia vencida
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  checkExpiredLicenseCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const EXPIRED_RESULT = await checkExpiredLicenseSV(id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'DRIVERE016').parseCatch(_error);
      });

      return CC_RESPONSE.send('Verificación completada exitosamente', { license_expired: EXPIRED_RESULT }, 'DRIVERS011');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'DRIVERE016', _error).server() : _error);
    }
  }
};
