'use strict';

/* Utils */
const Router = require('express').Router();

/* Middlewares */
const { verifyTokenMID } = require('../middlewares/auth.middleware');
const { CMM_AUTH_KEY_MID, CMM_CONFIG_MID } = require('../middlewares/cmm.middleware');
const { authFormatValidation } = require('../validations/format/auth.format_validate');
const { authDataValidation } = require('../validations/data/auth.data_validate');

/* Controllers */
const { 
  loginCON, 
  logoutCON, 
  getProfileCON, 
  updateProfileCON, 
  changePasswordCON, 
  renewTokenCON, 
  verifyTokenCON 
} = require('../controllers/auth.controller');

/**
 * @version        :2.0.0
 * @description    :Iniciar sesión en el sistema
 * @method         :POST
 * @type           :BODY
 * @param {String} username - Nombre de usuario
 * @param {String} password - Contraseña
 * @returns {Object} - Respuesta con el token y datos del policía
 */
Router.post('/v1/login', CMM_AUTH_KEY_MID('AUTH_LOGIN', false), authFormatValidation(), authDataValidation, CMM_CONFIG_MID(['AUTH_CONFIG']), loginCON);

/**
 * @version        :2.0.0
 * @description    :Cerrar sesión del sistema
 * @method         :POST
 * @type           :HEADER
 * @header         :Authorization - Token JWT
 * @returns {Object} - Respuesta con el resultado
 */
Router.post('/v1/logout', CMM_AUTH_KEY_MID('AUTH_LOGOUT'), verifyTokenMID, CMM_CONFIG_MID(['AUTH_CONFIG']), logoutCON);

/**
 * @version        :2.0.0
 * @description    :Obtener perfil del policía autenticado
 * @method         :GET
 * @type           :HEADER
 * @header         :Authorization - Token JWT
 * @returns {Object} - Respuesta con el perfil del policía
 */
Router.get('/v1/profile', CMM_AUTH_KEY_MID('AUTH_PROFILE'), verifyTokenMID, CMM_CONFIG_MID(['AUTH_CONFIG']), getProfileCON);

/**
 * @version        :2.0.0
 * @description    :Actualizar perfil del policía autenticado
 * @method         :PUT
 * @type           :BODY
 * @header         :Authorization - Token JWT
 * @param {String} [firstName] - Nombres del policía
 * @param {String} [lastName] - Apellidos del policía
 * @param {String} [email] - Email del policía
 * @param {String} [phone] - Teléfono del policía
 * @param {String} [address] - Dirección del policía
 * @returns {Object} - Respuesta con el perfil actualizado
 */
Router.put('/v1/profile', CMM_AUTH_KEY_MID('AUTH_UPDATE_PROFILE'), verifyTokenMID, CMM_CONFIG_MID(['AUTH_CONFIG']), updateProfileCON);

/**
 * @version        :2.0.0
 * @description    :Cambiar contraseña del policía
 * @method         :POST
 * @type           :BODY
 * @header         :Authorization - Token JWT
 * @param {String} currentPassword - Contraseña actual
 * @param {String} newPassword - Nueva contraseña
 * @returns {Object} - Respuesta con el resultado
 */
Router.post('/v1/change-password', CMM_AUTH_KEY_MID('AUTH_CHANGE_PASSWORD'), verifyTokenMID, CMM_CONFIG_MID(['AUTH_CONFIG']), changePasswordCON);

/**
 * @version        :2.0.0
 * @description    :Renovar token de autenticación
 * @method         :POST
 * @type           :HEADER
 * @header         :Authorization - Token JWT
 * @returns {Object} - Respuesta con el nuevo token
 */
Router.post('/v1/renew-token', CMM_AUTH_KEY_MID('AUTH_RENEW_TOKEN'), verifyTokenMID, CMM_CONFIG_MID(['AUTH_CONFIG']), renewTokenCON);

/**
 * @version        :2.0.0
 * @description    :Verificar validez del token
 * @method         :GET
 * @type           :HEADER
 * @header         :Authorization - Token JWT
 * @returns {Object} - Respuesta con el estado del token
 */
Router.get('/v1/verify-token', CMM_AUTH_KEY_MID('AUTH_VERIFY_TOKEN'), CMM_CONFIG_MID(['AUTH_CONFIG']), verifyTokenCON);

module.exports = Router;