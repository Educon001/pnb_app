'use strict';

const { CmmErrorClass } = require('../../utils');
const { CmmStringParam, CmmStringPasswordParam } = require('./params/util.param');

/**
 * @description Validaciones de formato para autenticación
 */
const authFormatValidation = () => {
  try {
    return [
      CmmStringParam('username', 'body', { min: 3, max: 50 }, true, 'LOWER'),
      CmmStringPasswordParam('password', 'body', { min: 6, max: 50 }, true)
    ];
  } catch (_error) {
    throw !_error.errorType ? new CmmErrorClass(__filename, 'AUTH001', _error).server() : _error;
  }
};

module.exports = { authFormatValidation };
