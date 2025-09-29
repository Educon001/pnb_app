'use strict';

const { CmmErrorClass, CmmHttpRespClass, CmmExpressValClass } = require('../../utils');
const { parseFlexibleDateSV } = require('../../utils/date.utils');

/**
 * @description Validaciones de datos para crear multa completa
 */
const createFineDVAL = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    // Format validation
    const CHECK_ERRORS = new CmmExpressValClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE001', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data from the new structure
    const { 
      infractionId,
      location, 
      infractionDate, 
      infractionTime,
      driverFirstName, 
      driverLastName, 
      driver, 
      driverPhone, 
      driverEmail, 
      driverAddress,
      driverLicenseGrade,
      isOtherOwner,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerAddress,
      ownerIdCard,
      ownerLicenseGrade,
      vehiclePlate, 
      vehicleType, 
      vehicleBrand, 
      vehicleModel, 
      vehicleColor, 
      vehicleYear,
      evidence,
      notes
    } = _req.body;
    
    // Business validation logic
    if (!infractionId) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE002', 'El ID de la infracción es obligatorio').frontend();
    }

    if (!location || !location.address) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE003', 'La ubicación es obligatoria').frontend();
    }

    if (!driverFirstName || !driverLastName || !driver) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE004', 'Los datos del conductor son obligatorios').frontend();
    }

    if (!vehiclePlate || !vehicleType || !vehicleBrand || !vehicleModel || !vehicleYear || !vehicleColor) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE005', 'Los datos del vehículo son obligatorios').frontend();
    }

    if (isOtherOwner && (!ownerFirstName || !ownerLastName || !ownerIdCard)) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE006', 'Si el propietario es diferente, sus datos son obligatorios').frontend();
    }

    // Procesar fecha y extraer hora si viene en formato ISO 8601
    let processedDateString = infractionDate;
    let processedDateObject = null;
    let processedTime = infractionTime;

    try {
      const PARSED_DATE = parseFlexibleDateSV(infractionDate);
      processedDateString = PARSED_DATE.dateString; // DD/MM/YYYY
      processedDateObject = PARSED_DATE.date; // Date object
      // Si viene en ISO y no se proporcionó hora manualmente, usar la hora del ISO
      if (PARSED_DATE.timeString && !infractionTime) {
        processedTime = PARSED_DATE.timeString; // HH:MM
      }
    } catch (_dateError) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE007', 'Formato de fecha inválido. Use ISO 8601 (2025-09-29T19:18:37.521Z) o DD/MM/YYYY').frontend();
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { 
      infractionId,
      location, 
      infractionDate: processedDateObject, 
      infractionTime: processedTime,
      driverFirstName, 
      driverLastName, 
      driver, 
      driverPhone, 
      driverEmail, 
      driverAddress,
      driverLicenseGrade,
      isOtherOwner,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerAddress,
      ownerIdCard,
      ownerLicenseGrade,
      vehiclePlate, 
      vehicleType, 
      vehicleBrand, 
      vehicleModel, 
      vehicleColor, 
      vehicleYear,
      evidence,
      notes
    };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VFINE012', _error).server() : _error);
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
      throw new CmmErrorClass(__filename, 'CPNB-VFINE019', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { status, officerId, startDate, endDate, page, limit } = _req.query;
    
    // Business validation logic
    const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'PAID', 'CANCELLED', 'APPEALED'];
    if (status && !validStatuses.includes(status)) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE020', 'Estado de multa no válido').frontend();
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE021', 'La fecha de inicio no puede ser mayor a la fecha de fin').frontend();
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { status, officerId, startDate, endDate, page, limit };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VFINE022', _error).server() : _error);
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
      throw new CmmErrorClass(__filename, 'CPNB-VFINE023', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { id } = _req.params;
    const { status, notes, description } = _req.body;
    
    // Business validation logic
    const validStatuses = ['DRAFT', 'PENDING', 'SENT', 'PAID', 'CANCELLED', 'APPEALED'];
    if (status && !validStatuses.includes(status)) {
      throw new CmmErrorClass(__filename, 'CPNB-VFINE024', 'Estado de multa no válido').frontend();
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { id, status, notes, description };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VFINE025', _error).server() : _error);
  }
};

module.exports = {
  createFineDVAL,
  getFinesDVAL,
  updateFineDVAL
};
