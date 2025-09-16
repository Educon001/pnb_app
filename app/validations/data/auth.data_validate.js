'use strict';

const { CmmErrorClass, CmmHttpRespClass, CmmExpressValClass } = require('../../utils');

/**
 * @description Validaciones de datos para autenticación
 */
const authDataValidation = async (_req, _res, _next) => {
  const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
  try {
    // Format validation
    const CHECK_ERRORS = new CmmExpressValClass(_req).byFormatValidate();
    if (!CHECK_ERRORS.isEmpty()) {
      throw new CmmErrorClass(__filename, 'AUTH002', CHECK_ERRORS.values()).returnValidate();
    }
    
    // Extract data
    const { username, password } = _req.body;
    
    // Business validation logic
    if (username && username.includes(' ')) {
      throw new CmmErrorClass(__filename, 'AUTH003', 'El nombre de usuario no puede contener espacios').frontend();
    }

    // Validar formato de contraseña
    // if (password && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    //   throw new CmmErrorClass(__filename, 'AUTH004', 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número').frontend();
    // }
    
    // Set validated data in request
    _req.CC = _req.CC || {};
    _req.CC.VALIDATED_DATA = { username, password };
    
    return _next();
  } catch (_error) {
    return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH005', _error).server() : _error);
  }
};

module.exports = { authDataValidation };
