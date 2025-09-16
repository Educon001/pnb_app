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
      location, infractionDate, infractionTime, notes,
      driverIdCard, driverFirstName, driverLastName, driverPhone, driverEmail, driverAddress, driverLicenseExpiry,
      vehiclePlate, vehicleType, vehicleBrand, vehicleModel, vehicleColor, vehicleYear, vehicleVin,
      infractionId, description, amount, evidence, witnesses
    } = _req.body;
    
    // Business validation logic
    
    // Validaciones de ubicación
    if (location && typeof location === 'object') {
      if (!location.address) {
        throw new CmmErrorClass(__filename, 'FINES002', 'La dirección es obligatoria').frontend();
      }
      
      if (location.coordinates) {
        const { latitude, longitude } = location.coordinates;
        if (latitude && (latitude < -90 || latitude > 90)) {
          throw new CmmErrorClass(__filename, 'FINES003', 'Latitud debe estar entre -90 y 90').frontend();
        }
        if (longitude && (longitude < -180 || longitude > 180)) {
          throw new CmmErrorClass(__filename, 'FINES004', 'Longitud debe estar entre -180 y 180').frontend();
        }
      }
    }
    
    // Validaciones de fecha y hora
    if (infractionDate && !/^\d{4}-\d{2}-\d{2}$/.test(infractionDate)) {
      throw new CmmErrorClass(__filename, 'FINES005', 'Formato de fecha inválido. Use: YYYY-MM-DD').frontend();
    }
    
    if (infractionTime && !/^\d{2}:\d{2}$/.test(infractionTime)) {
      throw new CmmErrorClass(__filename, 'FINES006', 'Formato de hora inválido. Use: HH:MM').frontend();
    }
    
    // Validaciones de conductor
    if (driverIdCard && !/^[0-9]+$/.test(driverIdCard)) {
      throw new CmmErrorClass(__filename, 'FINES007', 'La cédula debe contener solo números').frontend();
    }

    if (driverPhone && !/^[0-9+\-\s()]+$/.test(driverPhone)) {
      throw new CmmErrorClass(__filename, 'FINES008', 'Formato de teléfono inválido').frontend();
    }

    if (driverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(driverEmail)) {
      throw new CmmErrorClass(__filename, 'FINES009', 'Formato de email inválido').frontend();
    }

    // Validación de licencia - permitir fechas futuras
    if (driverLicenseExpiry && new Date(driverLicenseExpiry) < new Date('1900-01-01')) {
      throw new CmmErrorClass(__filename, 'FINES010', 'La fecha de vencimiento de la licencia no es válida').frontend();
    }
    
    // Validaciones de vehículo
    if (vehicleYear && (parseInt(vehicleYear) < 1900 || parseInt(vehicleYear) > new Date().getFullYear() + 1)) {
      throw new CmmErrorClass(__filename, 'FINES011', 'Año del vehículo inválido').frontend();
    }

    if (vehicleVin && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vehicleVin)) {
      throw new CmmErrorClass(__filename, 'FINES012', 'VIN del vehículo inválido').frontend();
    }

    const validVehicleTypes = ['AUTO', 'MOTO', 'CAMION', 'BUS', 'PICKUP', 'VAN'];
    if (vehicleType && !validVehicleTypes.includes(vehicleType.toUpperCase())) {
      throw new CmmErrorClass(__filename, 'FINES013', 'Tipo de vehículo no válido').frontend();
    }
    
    // Validaciones de multa
    if (amount && (parseFloat(amount) <= 0 || parseFloat(amount) > 1000000)) {
      throw new CmmErrorClass(__filename, 'FINES014', 'El monto debe estar entre 1 y 1,000,000').frontend();
    }

    // Validaciones de evidencias
    if (evidence && Array.isArray(evidence)) {
      if (evidence.length > 5) {
        throw new CmmErrorClass(__filename, 'FINES015', 'Máximo 5 evidencias permitidas').frontend();
      }
      
      // Validar que cada evidencia tenga la estructura correcta
      evidence.forEach((ev, index) => {
        if (typeof ev === 'string') {
          // Si es string, convertir a objeto con URL
          evidence[index] = { type: 'PHOTO', url: ev, description: 'Evidencia' };
        } else if (typeof ev === 'object' && ev.url) {
          // Si es objeto, validar que tenga URL
          if (!ev.type) ev.type = 'PHOTO';
          if (!ev.description) ev.description = 'Evidencia';
        } else {
          throw new CmmErrorClass(__filename, 'FINES016', `Evidencia ${index + 1} debe tener URL válida`).frontend();
        }
      });
    }
    
    // Validaciones de testigos
    if (witnesses && Array.isArray(witnesses)) {
      if (witnesses.length > 3) {
        throw new CmmErrorClass(__filename, 'FINES017', 'Máximo 3 testigos permitidos').frontend();
      }
      
      // Validar que cada testigo tenga la estructura correcta
      witnesses.forEach((wit, index) => {
        if (typeof wit === 'string') {
          // Si es string, convertir a objeto con nombre
          witnesses[index] = { name: wit, idCard: '', phone: '' };
        } else if (typeof wit === 'object' && wit.name) {
          // Si es objeto, validar que tenga nombre
          if (!wit.idCard) wit.idCard = '';
          if (!wit.phone) wit.phone = '';
        } else {
          throw new CmmErrorClass(__filename, 'FINES018', `Testigo ${index + 1} debe tener nombre válido`).frontend();
        }
      });
    }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { 
      location, infractionDate, infractionTime, notes,
      driverIdCard, driverFirstName, driverLastName, driverPhone, driverEmail, driverAddress, driverLicenseExpiry,
      vehiclePlate, vehicleType, vehicleBrand, vehicleModel, vehicleColor, vehicleYear, vehicleVin,
      infractionId, description, amount, evidence, witnesses
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
