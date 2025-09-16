'use strict';

/**
 * @description Clase para manejo de respuestas HTTP del sistema CMM
 */
class CmmHttpRespClass {
  constructor(req, res) {
    this.req = req;
    this.res = res;
  }

  /**
   * @description Enviar respuesta exitosa
   * @param {string} message - Mensaje de respuesta
   * @param {any} data - Datos de respuesta
   * @param {string} code - Código de respuesta
   * @returns {Object} Respuesta HTTP
   */
  send(message, data = null, code = 'SUCCESS') {
    const response = {
      success: true,
      message: message,
      code: code,
      timestamp: new Date(),
      data: data
    };

    return this.res.status(200).json(response);
  }

  /**
   * @description Enviar respuesta de error
   * @param {Object} error - Objeto de error
   * @returns {Object} Respuesta HTTP de error
   */
  sendError(error) {
    const statusCode = this.getStatusCode(error);
    const response = {
      success: false,
      message: error.message || 'Error interno del servidor',
      code: error.errorCode || 'INTERNAL_ERROR',
      timestamp: error.timestamp || new Date(),
      data: error.data || null
    };

    return this.res.status(statusCode).json(response);
  }

  /**
   * @description Obtener respuesta core
   * @returns {Object} Instancia de respuesta core
   */
  core() {
    return {
      send: (message, data = null, code = 'SUCCESS') => {
        const response = {
          success: true,
          message: message,
          code: code,
          timestamp: new Date(),
          data: data
        };

        return this.res.status(200).json(response);
      },
      sendError: (error) => {
        const statusCode = this.getStatusCode(error);
        const response = {
          success: false,
          message: error.message || 'Error interno del servidor',
          code: error.errorCode || 'INTERNAL_ERROR',
          timestamp: error.timestamp || new Date(),
          data: error.data || null
        };

        return this.res.status(statusCode).json(response);
      }
    };
  }

  /**
   * @description Obtener código de estado HTTP basado en el error
   * @param {Object} error - Objeto de error
   * @returns {number} Código de estado HTTP
   */
  getStatusCode(error) {
    if (error.errorCode) {
      if (error.errorCode.includes('VALIDATION')) return 400;
      if (error.errorCode.includes('AUTH')) return 401;
      if (error.errorCode.includes('FORBIDDEN')) return 403;
      if (error.errorCode.includes('NOT_FOUND')) return 404;
      if (error.errorCode.includes('CONFLICT')) return 409;
    }
    return 500;
  }
}

module.exports = { CmmHttpRespClass };
