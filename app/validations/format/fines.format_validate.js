'use strict';

const { CmmErrorClass } = require('../../utils');
const { 
  CmmStringParam, 
  CmmObjectParam, 
  CmmObjectIdParam, 
  CmmArrayParam, 
  CmmPrimaryKeyParam,
  CmmDateParam,
  CmmNumericParam
} = require('./params/util.param');

/**
 * @description Validaciones de formato para crear multa completa
 */
const createFineFVAL = () => {
  try {
    return [
      // Ubicación
      // CmmObjectParam('location', 'body', true),
      // CmmStringParam('infractionDate', 'body', { min: 10, max: 10 }, true),
      // CmmStringParam('infractionTime', 'body', { min: 5, max: 5 }, true),
      
      // // Conductor
      // CmmStringParam('driverIdCard', 'body', { min: 6, max: 15 }, true),
      // CmmStringParam('driverFirstName', 'body', { min: 2, max: 50 }, true),
      // CmmStringParam('driverLastName', 'body', { min: 2, max: 50 }, true),
      // CmmStringParam('driverPhone', 'body', { min: 10, max: 15 }, false),
      // CmmStringParam('driverEmail', 'body', { min: 6, max: 100 }, false),
      // CmmStringParam('driverAddress', 'body', { min: 10, max: 500 }, false),
      
      // // Vehículo
      // CmmStringParam('vehiclePlate', 'body', { min: 6, max: 10 }, true, 'UPPER'),
      // CmmStringParam('vehicleType', 'body', { min: 3, max: 50 }, true),
      // CmmStringParam('vehicleBrand', 'body', { min: 2, max: 50 }, true),
      // CmmStringParam('vehicleModel', 'body', { min: 2, max: 50 }, true),
      // CmmStringParam('vehicleColor', 'body', { min: 2, max: 30 }, true),
      // CmmStringParam('vehicleYear', 'body', { min: 4, max: 4 }, true),
      
      // // Infracción y multa
      // CmmStringParam('description', 'body', { min: 10, max: 1000 }, true)
    ];
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'FINES001', _error).server() : _error;
  }
};

/**
 * @description Validaciones de formato para listar multas
 */
const getFinesFVAL = () => {
  try {
    return [
      CmmStringParam('status', 'query', { min: 3, max: 20 }, false, 'UPPER'),
      CmmStringParam('officerId', 'query', { min: 1, max: 50 }, false),
      CmmDateParam('startDate', 'query', false),
      CmmDateParam('endDate', 'query', false),
      CmmPrimaryKeyParam('page', 'query', false),
      CmmPrimaryKeyParam('limit', 'query', false)
    ];
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'FINES005', _error).server() : _error;
  }
};

/**
 * @description Validaciones de formato para actualizar multa
 */
const updateFineFVAL = () => {
  try {
    return [
      CmmObjectIdParam('id', 'params', true),
      CmmStringParam('status', 'body', { min: 3, max: 20 }, false, 'UPPER'),
      CmmStringParam('notes', 'body', { min: 0, max: 500 }, false),
      CmmStringParam('description', 'body', { min: 10, max: 1000 }, false)
    ];
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'FINES006', _error).server() : _error;
  }
};

module.exports = {
  createFineFVAL,
  getFinesFVAL,
  updateFineFVAL
};
