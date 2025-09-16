'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { createVehicleSV, getVehiclesSV, getVehicleByIdSV, getVehicleByPlateSV, updateVehicleSV, reportStolenSV, removeStolenReportSV, deleteVehicleSV, getVehiclesStatisticsSV, searchVehiclesSV, checkStolenSV, getStolenVehiclesSV } = require('../services/vehicles.service');

module.exports = {
  /**
   * @description Crear nuevo vehículo
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  createVehicleCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { plate, serialNumber, engineNumber, brand, model, year, color, vehicleType, displacement, fuel, transmission, owner, birthDate } = _req.body;

      // Validaciones básicas
      if (!plate || !brand || !model || !year || !color || !vehicleType) {
        throw new CmmErrorClass(__filename, 'VEHICLEE001', 'Placa, marca, modelo, año, color y tipo de vehículo son obligatorios').returnValidate();
      }

      if (!owner?.firstName || !owner?.lastName || !owner?.idCard || !owner?.address) {
        throw new CmmErrorClass(__filename, 'VEHICLEE002', 'Datos del propietario (nombres, apellidos, cédula y dirección) son obligatorios').returnValidate();
      }

      const VEHICLE_RESULT = await createVehicleSV(_req.body, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE003').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículo creado exitosamente', VEHICLE_RESULT, 'VEHICLES001');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE003', _error).server() : _error);
    }
  },

  /**
   * @description Obtener vehículos con filtros
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getVehiclesCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { active, stolen, vehicleType, brand, search, page = 1, limit = 10 } = _req.query;

      const FILTERS = {
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        stolen: stolen === 'true' ? true : stolen === 'false' ? false : undefined,
        vehicleType: vehicleType,
        brand: brand,
        search: search
      };

      const RESULT = await getVehiclesSV(FILTERS, parseInt(page), parseInt(limit)).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE004').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículos obtenidos exitosamente', RESULT, 'VEHICLES002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE004', _error).server() : _error);
    }
  },

  /**
   * @description Obtener vehículo por ID
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getVehicleByIdCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const VEHICLE_RESULT = await getVehicleByIdSV(id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículo obtenido exitosamente', VEHICLE_RESULT, 'VEHICLES003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE005', _error).server() : _error);
    }
  },

  /**
   * @description Obtener vehículo por placa
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getVehicleByPlateCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { plate } = _req.params;
      const VEHICLE_RESULT = await getVehicleByPlateSV(plate).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE006').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículo obtenido exitosamente', VEHICLE_RESULT, 'VEHICLES004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE006', _error).server() : _error);
    }
  },

  /**
   * @description Actualizar vehículo
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  updateVehicleCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const UPDATE_DATA = _req.body;

      const VEHICLE_RESULT = await updateVehicleSV(id, UPDATE_DATA, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE007').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículo actualizado exitosamente', VEHICLE_RESULT, 'VEHICLES005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE007', _error).server() : _error);
    }
  },

  /**
   * @description Reportar vehículo como robado
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  reportStolenCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const { reportNumber } = _req.body;

      if (!reportNumber) {
        throw new CmmErrorClass(__filename, 'VEHICLEE008', 'El número de denuncia es obligatorio').returnValidate();
      }

      const VEHICLE_RESULT = await reportStolenSV(id, { reportNumber: reportNumber }, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE009').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículo reportado como robado exitosamente', VEHICLE_RESULT, 'VEHICLES006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE009', _error).server() : _error);
    }
  },

  /**
   * @description Quitar reporte de robo
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  removeStolenReportCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const VEHICLE_RESULT = await removeStolenReportSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE010').parseCatch(_error);
      });

      return CC_RESPONSE.send('Reporte de robo quitado exitosamente', VEHICLE_RESULT, 'VEHICLES007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE010', _error).server() : _error);
    }
  },

  /**
   * @description Eliminar vehículo
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  deleteVehicleCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const RESULT = await deleteVehicleSV(id, _req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE011').parseCatch(_error);
      });

      return CC_RESPONSE.send(RESULT.message, null, 'VEHICLES008');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE011', _error).server() : _error);
    }
  },

  /**
   * @description Obtener estadísticas de vehículos
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getVehiclesStatisticsCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const STATISTICS_RESULT = await getVehiclesStatisticsSV().catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE012').parseCatch(_error);
      });

      return CC_RESPONSE.send('Estadísticas obtenidas exitosamente', STATISTICS_RESULT, 'VEHICLES009');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE012', _error).server() : _error);
    }
  },

  /**
   * @description Buscar vehículos
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  searchVehiclesCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { term } = _req.query;

      if (!term || term.length < 2) {
        throw new CmmErrorClass(__filename, 'VEHICLEE013', 'El término de búsqueda debe tener al menos 2 caracteres').returnValidate();
      }

      const VEHICLES_RESULT = await searchVehiclesSV(term).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE014').parseCatch(_error);
      });

      return CC_RESPONSE.send('Búsqueda completada exitosamente', VEHICLES_RESULT, 'VEHICLES010');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE014', _error).server() : _error);
    }
  },

  /**
   * @description Verificar si vehículo está reportado como robado
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  checkStolenCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { id } = _req.params;
      const STOLEN_RESULT = await checkStolenSV(id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE015').parseCatch(_error);
      });

      return CC_RESPONSE.send('Verificación completada exitosamente', { stolen: STOLEN_RESULT }, 'VEHICLES011');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE015', _error).server() : _error);
    }
  },

  /**
   * @description Obtener vehículos robados
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getStolenVehiclesCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { page = 1, limit = 10 } = _req.query;
      const RESULT = await getStolenVehiclesSV(parseInt(page), parseInt(limit)).catch((_error) => {
        throw new CmmErrorClass(__filename, 'VEHICLEE016').parseCatch(_error);
      });

      return CC_RESPONSE.send('Vehículos robados obtenidos exitosamente', RESULT, 'VEHICLES012');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'VEHICLEE016', _error).server() : _error);
    }
  }
};
