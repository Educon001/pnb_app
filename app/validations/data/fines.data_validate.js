'use strict';

const { CmmErrorClass, CmmHttpRespClass, CmmExpressValClass } = require('../../utils');

/**
 * @description Validaciones de datos para crear multa completa
 */
const createFineDVAL = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    // Format validation
    const CHECK_ERRORS = new CmmExpressValClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) {
      throw new CmmErrorClass(__filename, 'FINES001', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { 
      location, infractionDate, infractionTime,
      driverIdCard, driverFirstName, driverLastName, driverPhone, driverEmail, driverAddress,
      vehiclePlate, vehicleType, vehicleBrand, vehicleModel, vehicleColor, vehicleYear,
      description
    } = _req.body;
    
    // Business validation logic
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { 
      location, infractionDate, infractionTime,
      driverIdCard, driverFirstName, driverLastName, driverPhone, driverEmail, driverAddress,
      vehiclePlate, vehicleType, vehicleBrand, vehicleModel, vehicleColor, vehicleYear,
      description
    };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINES012', _error).server() : _error);
  }
};

/**
 * @description Validaciones de datos para listar multas
 */
const getFinesDVAL = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    // Format validation
    const CHECK_ERRORS = new CmmExpressValClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) {
      throw new CmmErrorClass(__filename, 'FINES019', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { status, officerId, startDate, endDate, page, limit } = _req.query;
    
    // Business validation logic
    const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'PAID', 'CANCELLED', 'APPEALED'];
    if (status && !validStatuses.includes(status)) {
      throw new CmmErrorClass(__filename, 'FINES020', 'Estado de multa no válido').frontend();
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new CmmErrorClass(__filename, 'FINES021', 'La fecha de inicio no puede ser mayor a la fecha de fin').frontend();
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { status, officerId, startDate, endDate, page, limit };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINES022', _error).server() : _error);
  }
};

/**
 * @description Validaciones de datos para actualizar multa
 */
const updateFineDVAL = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    // Format validation
    const CHECK_ERRORS = new CmmExpressValClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) {
      throw new CmmErrorClass(__filename, 'FINES023', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { id } = _req.params;
    const { status, notes, description } = _req.body;
    
    // Business validation logic
    const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'PAID', 'CANCELLED', 'APPEALED'];
    if (status && !validStatuses.includes(status)) {
      throw new CmmErrorClass(__filename, 'FINES024', 'Estado de multa no válido').frontend();
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { id, status, notes, description };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'FINES025', _error).server() : _error);
  }
};

module.exports = {
  createFineDVAL,
  getFinesDVAL,
  updateFineDVAL
};
