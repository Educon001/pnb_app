'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { verifyTokenSV } = require('../services/auth.service');

/**
 * @description Middleware para verificar el token JWT
 * @param {Object} _req - Request object
 * @param {Object} _res - Response object
 * @param {Function} _next - Next function
 * @returns {Promise} Promise with the response
 */
const verifyTokenMID = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    const TOKEN = _req.header('Authorization')?.replace('Bearer ', '');
    
    if (!TOKEN) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE001', 'Token de acceso requerido').frontend();
    }

    const POLICE_RESULT = await verifyTokenSV(TOKEN).catch((_error) => {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE002').parseCatch(_error);
    });

    _req.police = POLICE_RESULT;
    _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE003', _error).server() : _error);
  }
};

/**
 * @description Middleware para verificar roles específicos
 * @param {Array} _roles - Roles permitidos
 * @returns {Function} Middleware function
 */
const verifyRoleMID = (..._roles) => {
  return (_req, _res, _next) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      if (!_req.police) {
        throw new CmmErrorClass(__filename, 'CPNB-MAUTHE004', 'Token de acceso requerido').frontend();
      }

      const HAS_ROLE = _req.police.roles.some(role => _roles.includes(role));
      
      if (!HAS_ROLE) {
        throw new CmmErrorClass(__filename, 'CPNB-MAUTHE005', 'No tiene permisos para acceder a este recurso').frontend();
      }

      _next();
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE006', _error).server() : _error);
    }
  };
};

/**
 * @description Middleware para verificar si el policía puede crear multas
 * @param {Object} _req - Request object
 * @param {Object} _res - Response object
 * @param {Function} _next - Next function
 * @returns {Promise} Promise with the response
 */
const verifyFinesPermissionMID = (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    if (!_req.police) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE007', 'Token de acceso requerido').frontend();
    }

    const ALLOWED_ROLES = ['OFFICER', 'SUPERVISOR', 'ADMIN'];
    const HAS_PERMISSION = _req.police.roles.some(role => ALLOWED_ROLES.includes(role));
    
    if (!HAS_PERMISSION) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE008', 'No tiene permisos para gestionar multas').frontend();
    }

    _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE009', _error).server() : _error);
  }
};

/**
 * @description Middleware para verificar si el policía puede ver estadísticas
 * @param {Object} _req - Request object
 * @param {Object} _res - Response object
 * @param {Function} _next - Next function
 * @returns {Promise} Promise with the response
 */
const verifyStatisticsPermissionMID = (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    if (!_req.police) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE010', 'Token de acceso requerido').frontend();
    }

    const ALLOWED_ROLES = ['SUPERVISOR', 'ADMIN'];
    const HAS_PERMISSION = _req.police.roles.some(role => ALLOWED_ROLES.includes(role));
    
    if (!HAS_PERMISSION) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE011', 'No tiene permisos para ver estadísticas').frontend();
    }

    _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE012', _error).server() : _error);
  }
};

/**
 * @description Middleware para verificar si el policía puede gestionar usuarios
 * @param {Object} _req - Request object
 * @param {Object} _res - Response object
 * @param {Function} _next - Next function
 * @returns {Promise} Promise with the response
 */
const verifyUsersPermissionMID = (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    if (!_req.police) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE013', 'Token de acceso requerido').frontend();
    }

    const ALLOWED_ROLES = ['ADMIN'];
    const HAS_PERMISSION = _req.police.roles.some(role => ALLOWED_ROLES.includes(role));
    
    if (!HAS_PERMISSION) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE014', 'No tiene permisos para gestionar usuarios').frontend();
    }

    _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE015', _error).server() : _error);
  }
};

/**
 * @description Middleware para verificar si el policía puede gestionar infracciones
 * @param {Object} _req - Request object
 * @param {Object} _res - Response object
 * @param {Function} _next - Next function
 * @returns {Promise} Promise with the response
 */
const verifyInfractionsPermissionMID = (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    if (!_req.police) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE016', 'Token de acceso requerido').frontend();
    }

    const ALLOWED_ROLES = ['ADMIN', 'SUPERVISOR'];
    const HAS_PERMISSION = _req.police.roles.some(role => ALLOWED_ROLES.includes(role));
    
    if (!HAS_PERMISSION) {
      throw new CmmErrorClass(__filename, 'CPNB-MAUTHE017', 'No tiene permisos para gestionar infracciones').frontend();
    }

    _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'CPNB-MAUTHE018', _error).server() : _error);
  }
};

module.exports = {
  verifyTokenMID,
  verifyRoleMID,
  verifyFinesPermissionMID,
  verifyStatisticsPermissionMID,
  verifyUsersPermissionMID,
  verifyInfractionsPermissionMID
};