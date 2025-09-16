'use strict';

const { CmmErrorClass, CmmHttpRespClass } = require('../utils');

/* Services */
const { loginSV, logoutSV, getProfileSV, updateProfileSV, changePasswordSV, renewTokenSV, verifyTokenSV } = require('../services/auth.service');

module.exports = {
  /**
   * @description Iniciar sesión
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  loginCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { username, password } = _req.body;

      // Validaciones básicas
      if (!username || !password) {
        throw new CmmErrorClass(__filename, 'AUTH001', 'Username y password son obligatorios').returnValidate();
      }

      const LOGIN_RESULT = await loginSV(username, password).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH002').parseCatch(_error);
      });

      return CC_RESPONSE.send('Sesión iniciada exitosamente', LOGIN_RESULT, 'AUTH001');
    } catch (_error) {
      console.log(_error);
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH002', _error).server() : _error);
    }
  },

  /**
   * @description Cerrar sesión
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  logoutCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const TOKEN = _req.header('Authorization')?.replace('Bearer ', '');
      const LOGOUT_RESULT = await logoutSV(_req.police._id, TOKEN).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH003').parseCatch(_error);
      });

      return CC_RESPONSE.send(LOGOUT_RESULT.message, null, 'AUTH002');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH003', _error).server() : _error);
    }
  },

  /**
   * @description Obtener perfil del policía autenticado
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  getProfileCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const PROFILE_RESULT = await getProfileSV(_req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH004').parseCatch(_error);
      });

      return CC_RESPONSE.send('Perfil obtenido exitosamente', PROFILE_RESULT, 'AUTH003');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH004', _error).server() : _error);
    }
  },

  /**
   * @description Actualizar perfil del policía autenticado
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  updateProfileCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { firstName, lastName, email, phone, address } = _req.body;
      
      const UPDATE_DATA = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        phone: phone,
        address: address
      };

      const PROFILE_RESULT = await updateProfileSV(_req.police._id, UPDATE_DATA).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH005').parseCatch(_error);
      });

      return CC_RESPONSE.send('Perfil actualizado exitosamente', PROFILE_RESULT, 'AUTH004');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH005', _error).server() : _error);
    }
  },

  /**
   * @description Cambiar contraseña
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  changePasswordCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const { currentPassword, newPassword } = _req.body;

      if (!currentPassword || !newPassword) {
        throw new CmmErrorClass(__filename, 'AUTH006', 'Contraseña actual y nueva son obligatorias').returnValidate();
      }

      if (newPassword.length < 6) {
        throw new CmmErrorClass(__filename, 'AUTH007', 'La nueva contraseña debe tener al menos 6 caracteres').returnValidate();
      }

      const RESULT = await changePasswordSV(_req.police._id, currentPassword, newPassword).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH008').parseCatch(_error);
      });

      return CC_RESPONSE.send(RESULT.message, null, 'AUTH005');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH008', _error).server() : _error);
    }
  },

  /**
   * @description Renovar token
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  renewTokenCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      const RENEW_RESULT = await renewTokenSV(_req.police._id).catch((_error) => {
        throw new CmmErrorClass(__filename, 'AUTH009').parseCatch(_error);
      });

      return CC_RESPONSE.send('Token renovado exitosamente', RENEW_RESULT, 'AUTH006');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH009', _error).server() : _error);
    }
  },

  /**
   * @description Verificar token
   * @param {Object} _req - Request object
   * @param {Object} _res - Response object
   * @returns {Promise} Promise with the response
   */
  verifyTokenCON: async (_req, _res) => {
    const CC_RESPONSE = new CmmHttpRespClass(_req, _res);
    try {
      return CC_RESPONSE.send('Token válido', {
        police: _req.police
      }, 'AUTH007');
    } catch (_error) {
      return CC_RESPONSE.sendError(!_error.errorType ? new CmmErrorClass(__filename, 'AUTH010', _error).server() : _error);
    }
  }
};