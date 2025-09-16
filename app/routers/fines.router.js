'use strict';

/* Utils */
const Router = require('express').Router();

/* Middlewares */
const { verifyTokenMID, verifyFinesPermissionMID } = require('../middlewares/auth.middleware');
const { CMM_AUTH_KEY_MID, CMM_CONFIG_MID } = require('../middlewares/cmm.middleware');

/* Format Validations */
const { 
  createFineFVAL,
  getFinesFVAL,
  updateFineFVAL
} = require('../validations/format/fines.format_validate');

/* Data Validations */
const { 
  createFineDVAL,
  getFinesDVAL,
  updateFineDVAL
} = require('../validations/data/fines.data_validate');

/* Controllers */
const { 
  createFineCON, 
  getFinesCON, 
  getFineByIdCON, 
  updateFineCON, 
  sendFineCON, 
  cancelFineCON, 
  getFinesStatisticsCON, 
  getDashboardSummaryCON 
} = require('../controllers/fines.controller');

/**
 * @version        :2.0.0
 * @description    :Crear nueva multa con todos los datos
 * @method         :POST
 * @type           :BODY
 * @param {String} location - Ubicación de la infracción
 * @param {String} address - Dirección específica
 * @param {String} [coordinates] - Coordenadas GPS (lat,lng)
 * @param {String} [notes] - Notas adicionales
 * @param {String} driverIdCard - Cédula del conductor
 * @param {String} driverFirstName - Nombres del conductor
 * @param {String} driverLastName - Apellidos del conductor
 * @param {String} [driverPhone] - Teléfono del conductor
 * @param {String} [driverEmail] - Email del conductor
 * @param {String} [driverAddress] - Dirección del conductor
 * @param {Date} [driverLicenseExpiry] - Fecha de vencimiento de la licencia
 * @param {String} vehiclePlate - Placa del vehículo
 * @param {String} vehicleType - Tipo de vehículo
 * @param {String} vehicleBrand - Marca del vehículo
 * @param {String} vehicleModel - Modelo del vehículo
 * @param {String} vehicleColor - Color del vehículo
 * @param {String} vehicleYear - Año del vehículo
 * @param {String} [vehicleVin] - VIN del vehículo
 * @param {String} infractionId - ID de la infracción
 * @param {String} description - Descripción de la infracción
 * @param {Number} amount - Monto de la multa
 * @param {Array} [evidence] - Evidencias de la infracción
 * @param {Array} [witnesses] - Testigos de la infracción
 * @returns {Object} - Respuesta con la multa creada
 */
Router.post('/v1/create', CMM_AUTH_KEY_MID('FINES_CREATE'), verifyTokenMID, verifyFinesPermissionMID, createFineFVAL(), createFineDVAL, CMM_CONFIG_MID(['FINES_CONFIG']), createFineCON);

/**
 * @version        :2.0.0
 * @description    :Listar multas con filtros
 * @method         :GET
 * @type           :QUERY
 * @param {String} [status] - Estado de la multa
 * @param {String} [officerId] - ID del oficial
 * @param {Date} [startDate] - Fecha desde
 * @param {Date} [endDate] - Fecha hasta
 * @param {Number} [page] - Página actual
 * @param {Number} [limit] - Límite por página
 * @returns {Object} - Respuesta con las multas
 */
Router.get('/v1/list', CMM_AUTH_KEY_MID('FINES_LIST'), verifyTokenMID, getFinesFVAL(), getFinesDVAL, CMM_CONFIG_MID(['FINES_CONFIG']), getFinesCON);

/**
 * @version        :2.0.0
 * @description    :Obtener multa por ID
 * @method         :GET
 * @type           :PARAMS
 * @param {String} id - ID de la multa
 * @returns {Object} - Respuesta con la multa
 */
Router.get('/v1/:id', CMM_AUTH_KEY_MID('FINES_GET'), verifyTokenMID, CMM_CONFIG_MID(['FINES_CONFIG']), getFineByIdCON);

/**
 * @version        :2.0.0
 * @description    :Actualizar multa
 * @method         :PUT
 * @type           :BODY
 * @param {String} id - ID de la multa
 * @param {String} [status] - Estado de la multa
 * @param {String} [notes] - Notas adicionales
 * @param {String} [description] - Descripción actualizada
 * @returns {Object} - Respuesta con la multa actualizada
 */
Router.put('/v1/:id', CMM_AUTH_KEY_MID('FINES_UPDATE'), verifyTokenMID, verifyFinesPermissionMID, updateFineFVAL(), updateFineDVAL, CMM_CONFIG_MID(['FINES_CONFIG']), updateFineCON);

/**
 * @version        :2.0.0
 * @description    :Enviar multa al ciudadano
 * @method         :POST
 * @type           :PARAMS
 * @param {String} id - ID de la multa
 * @returns {Object} - Respuesta con la multa enviada
 */
Router.post('/v1/:id/send', CMM_AUTH_KEY_MID('FINES_SEND'), verifyTokenMID, verifyFinesPermissionMID, CMM_CONFIG_MID(['FINES_CONFIG']), sendFineCON);

/**
 * @version        :2.0.0
 * @description    :Cancelar multa
 * @method         :POST
 * @type           :BODY
 * @param {String} id - ID de la multa
 * @param {String} reason - Motivo de cancelación
 * @returns {Object} - Respuesta con la multa cancelada
 */
Router.post('/v1/:id/cancel', CMM_AUTH_KEY_MID('FINES_CANCEL'), verifyTokenMID, verifyFinesPermissionMID, CMM_CONFIG_MID(['FINES_CONFIG']), cancelFineCON);

/**
 * @version        :2.0.0
 * @description    :Generar PDF de la multa
 * @method         :POST
 * @type           :PARAMS
 * @param {String} id - ID de la multa
 * @returns {Object} - Respuesta con el PDF generado
 */
Router.post('/v1/:id/generate-pdf', CMM_AUTH_KEY_MID('FINES_PDF'), verifyTokenMID, verifyFinesPermissionMID, CMM_CONFIG_MID(['FINES_CONFIG']), createFineCON);

/**
 * @version        :2.0.0
 * @description    :Enviar notificación por email
 * @method         :POST
 * @type           :PARAMS
 * @param {String} id - ID de la multa
 * @returns {Object} - Respuesta con la notificación enviada
 */
Router.post('/v1/:id/send-notification', CMM_AUTH_KEY_MID('FINES_NOTIFY'), verifyTokenMID, verifyFinesPermissionMID, CMM_CONFIG_MID(['FINES_CONFIG']), createFineCON);

/**
 * @version        :2.0.0
 * @description    :Obtener estadísticas de multas
 * @method         :GET
 * @type           :QUERY
 * @param {Date} [startDate] - Fecha desde
 * @param {Date} [endDate] - Fecha hasta
 * @param {String} [officerId] - ID del oficial
 * @returns {Object} - Respuesta con las estadísticas
 */
Router.get('/v1/statistics', CMM_AUTH_KEY_MID('FINES_STATS'), verifyTokenMID, CMM_CONFIG_MID(['FINES_CONFIG']), getFinesStatisticsCON);

/**
 * @version        :2.0.0
 * @description    :Obtener resumen para dashboard
 * @method         :GET
 * @type           :QUERY
 * @returns {Object} - Respuesta con el resumen del dashboard
 */
Router.get('/v1/dashboard', CMM_AUTH_KEY_MID('FINES_DASHBOARD'), verifyTokenMID, CMM_CONFIG_MID(['FINES_CONFIG']), getDashboardSummaryCON);

module.exports = Router;