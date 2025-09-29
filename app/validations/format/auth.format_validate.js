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

module.exports = {
  /**
   * @description Validación de formato para login
   * @returns {Array} Array de validaciones
   */
  authFormatValidation() {
    try {
      return [
        CmmStringParam('username', 'body', { min: 3, max: 50 }, true, 'UPPER'),
        CmmStringParam('password', 'body', { min: 6, max: 100 }, true)
      ];
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VAUTHE001', _error).server() : _error;
    }
  },

  /**
   * @description Validación de formato para actualizar perfil
   * @returns {Array} Array de validaciones
   */
  updateProfileFormatValidation() {
    try {
      return [
        CmmStringParam('firstName', 'body', { min: 2, max: 50 }, false, 'UPPER'),
        CmmStringParam('lastName', 'body', { min: 2, max: 50 }, false, 'UPPER'),
        CmmStringParam('email', 'body', { min: 5, max: 100 }, false, 'LOWER'),
        CmmStringParam('phone', 'body', { min: 10, max: 15 }, false),
        CmmStringParam('address', 'body', { min: 5, max: 200 }, false)
      ];
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VAUTHE002', _error).server() : _error;
    }
  },

  /**
   * @description Validación de formato para cambiar contraseña
   * @returns {Array} Array de validaciones
   */
  changePasswordFormatValidation() {
    try {
      return [
        CmmStringParam('currentPassword', 'body', { min: 6, max: 100 }, true),
        CmmStringParam('newPassword', 'body', { min: 6, max: 100 }, true)
      ];
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-VAUTHE003', _error).server() : _error;
    }
  }
};
