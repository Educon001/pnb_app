'use strict';

/* Utils */
const Express = require('express-validator');
const ObjectId = require('mongoose').Types.ObjectId;
const { CmmErrorClass } = require('../../../utils');

// Constantes de regex
const REGEX = {
  NATURAL_NUMBERS: /^[0-9]+$/,
  REAL_NUMBERS: /^[0-9]+(\.[0-9]+)?$/,
  ONLY_NUMBER: /^[0-9]+$/,
  NICKNAME: /^[a-z0-9_]+$/,
  ETH_ADDRESS: /^0x[a-fA-F0-9]{40}$/
};

// Helper function para obtener el validador correcto
const getValidator = (_location) => {
  return _location === 'params' ? Express.param : Express[_location];
};

/**
 * @description Validar todos primary key
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmPrimaryKeyParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .matches(REGEX.NATURAL_NUMBERS)
      .withMessage('Solo se permiten números naturales')
      .isLength({ min: 1, max: 19 })
      .withMessage('La longitud debe estar entre 1 y 19 caracteres');
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM004', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro tipo string
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Object} [_length] - longitud del valor del parámetro
 * @param {Boolean} [_required] - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 * @param {String} [_format] - formato del string (default = null) UPPER, LOWER
 * @param {Object} [_regex] - Objeto regex para validar el string
 * @param {String} [_regex.value] - Expresión regular
 * @param {String} [_regex.message] - Mensaje de error
 */
exports.CmmStringParam = (_tag = '', _location = '', _length = { min: 3, max: 100 }, _required = true, _format = null, _regex = undefined) => {
  try {
    let VALIDATION = getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isString()
      .withMessage('Debe ser un string')
      .customSanitizer((_value) => {
        try {
          if (_format === 'UPPER') {
            _value = String(_value).toUpperCase().trim();
          }
          if (_format === 'LOWER') {
            _value = String(_value).toLowerCase().trim();
          }

          if (_value && typeof _value === 'string') {
            _value = _value.replace(/['`']/g, '');
          }

          return _value;
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM013', _error).server() : _error;
        }
      });

    if (_regex && _regex?.value && _regex?.message) {
      VALIDATION = VALIDATION.matches(_regex.value).withMessage(_regex.message);
    }

    VALIDATION = VALIDATION.isLength(_length).withMessage(`La longitud debe estar entre ${_length.min} y ${_length.max} caracteres`);

    return VALIDATION;
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM015', _error).server() : _error;
  }
};

/**
 * @description Validar que el parámetro sea un array
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmArrayParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isArray({ min: 1 })
      .withMessage('Debe ser un array con al menos un elemento');
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM032', _error).server() : _error;
  }
};

/**
 * @description Validar que el parámetro sea un Booleano
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmBooleanParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .custom((_value) => {
        try {
          if (String(_value) == 0 || String(_value) == 1) {
            throw new Error('Debe ser un valor booleano válido');
          }
          return true;
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM065', _error).server() : _error;
        }
      })
      .isBoolean({ loose: false })
      .withMessage('Debe ser un valor booleano')
      .toBoolean({ strict: true });
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM039', _error).server() : _error;
  }
};

/**
 * @description Validar que el parámetro sea un objeto
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmObjectParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .custom((_value, { req: _req }) => {
        try {
          if (typeof _value != 'object') {
            throw new Error('Debe ser un objeto');
          }
          return _value;
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM063', _error).server() : _error;
        }
      });
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM064', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro tipo ObjectId
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmObjectIdParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isString()
      .withMessage('Debe ser un string')
      .isLength({ min: 24, max: 24 })
      .withMessage('Debe tener exactamente 24 caracteres')
      .custom((_value, { req: _req }) => {
        try {
          if (ObjectId.isValid(_value) && new ObjectId(_value).toString() === _value) {
            return _value;
          } else {
            throw new Error('Debe ser un ObjectId válido');
          }
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM071', _error).server() : _error;
        }
      });
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM072', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro tipo email
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 * @param {String} _format - formato del string (default = null) UPPER, LOWER
 */
exports.CmmEmailParam = (_tag = '', _location = '', _required = true, _format = null) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isLength({ min: 6, max: 254 })
      .withMessage('La longitud debe estar entre 6 y 254 caracteres')
      .isEmail()
      .withMessage('Debe ser un email válido')
      .customSanitizer((_value) => {
        try {
          if (_value && typeof _value === 'string') {
            if (_format === 'UPPER') {
              _value = String(_value).toUpperCase().trim();
            }
            if (_format === 'LOWER') {
              _value = String(_value).toLowerCase().trim();
            }
            return _value;
          }
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM012', _error).server() : _error;
        }
      });
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM043', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro tipo numérico
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Object} _length - longitud del valor del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmNumericParam = (_tag = '', _location = '', _length = { min: 3, max: 20 }, _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .matches(REGEX.ONLY_NUMBER)
      .withMessage('Solo se permiten números')
      .isLength(_length)
      .withMessage(`La longitud debe estar entre ${_length.min} y ${_length.max} caracteres`);
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM036', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro tipo fecha
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmDateParam = (_tag = '', _location = '', _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isDate()
      .withMessage('Debe ser una fecha válida')
      .isAfter('1900-01-01')
      .withMessage('La fecha debe ser posterior a 1900-01-01')
      .custom((_value) => {
        try {
          // Permitir fechas futuras para licencias y otros casos especiales
          if (new Date(_value) < new Date('1900-01-01')) {
            throw new Error('La fecha debe ser posterior a 1900-01-01');
          } else {
            return true;
          }
        } catch (_error) {
          throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM073', _error).server() : _error;
        }
      });
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM029', _error).server() : _error;
  }
};

/**
 * @description Validar un parámetro contraseña string
 * @param {String} _tag - parametro del request
 * @param {String} _location - ubicación del parámetro
 * @param {Object} _length - longitud del valor del parámetro
 * @param {Boolean} _required - parámetro para indicar si el parámetro es obligatorio u opcional (default = true)
 */
exports.CmmStringPasswordParam = (_tag = '', _location = '', _length = { min: 3, max: 20 }, _required = true) => {
  try {
    return getValidator(_location)(_tag)
      .if((_value, { req: _req }) => {
        return _value === undefined && _required === false ? false : true;
      })
      .not()
      .isEmpty()
      .withMessage('El campo es requerido')
      .isString()
      .withMessage('Debe ser un string')
      .isLength(_length)
      .withMessage(`La longitud debe estar entre ${_length.min} y ${_length.max} caracteres`);
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-UPARAM020', _error).server() : _error;
  }
};
