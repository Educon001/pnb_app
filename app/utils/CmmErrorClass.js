'use strict';

/**
 * @description Clase para manejo de errores del sistema CMM
 */
class CmmErrorClass {
  constructor(filename, errorCode, errorData = null) {
    this.filename = filename;
    this.errorCode = errorCode;
    this.errorData = errorData;
    this.errorType = 'CMM_ERROR';
    this.timestamp = new Date();
  }

  /**
   * @description Crear error del servidor
   * @returns {Object} Error del servidor
   */
  server() {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: 'Error interno del servidor',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData
    };
  }

  /**
   * @description Crear error de base de datos
   * @returns {Object} Error de base de datos
   */
  database() {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: 'Error de base de datos',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData
    };
  }

  /**
   * @description Crear error de API
   * @returns {Object} Error de API
   */
  api() {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: 'Error de API',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData
    };
  }

  /**
   * @description Crear error de frontend
   * @returns {Object} Error de frontend
   */
  frontend() {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: 'Error de frontend',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData
    };
  }

  /**
   * @description Crear error de validación
   * @param {boolean} blocking - Si el error es bloqueante
   * @returns {Object} Error de validación
   */
  returnValidate(blocking = true) {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: 'Error de validación',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData,
      blocking: blocking
    };
  }

  /**
   * @description Parsear error capturado
   * @param {Error} error - Error capturado
   * @returns {Object} Error parseado
   */
  parseCatch(error) {
    return {
      errorType: this.errorType,
      errorCode: this.errorCode,
      message: error.message || 'Error capturado',
      filename: this.filename,
      timestamp: this.timestamp,
      data: this.errorData,
      originalError: error
    };
  }
}

module.exports = { CmmErrorClass };
