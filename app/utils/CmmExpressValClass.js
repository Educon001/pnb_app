'use strict';

const { validationResult } = require('express-validator');

/**
 * @description Clase para manejo de validaciones Express
 */
class CmmExpressValClass {
  constructor(req) {
    this.req = req;
  }

  /**
   * @description Validar formato de parámetros
   * @returns {Object} Resultado de la validación
   */
  byFormatValidate() {
    const errors = validationResult(this.req);
    return {
      isEmpty: () => errors.isEmpty(),
      values: () => errors.array()
    };
  }
}

module.exports = { CmmExpressValClass };
