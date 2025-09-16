'use strict';

const express = require('express');
const { verifyTokenMID, verifyFinesPermissionMID } = require('../middlewares/auth.middleware');
const { 
  createDriverCON, 
  getDriversCON, 
  getDriverByIdCON, 
  getDriverByIdCardCON, 
  updateDriverCON, 
  suspendDriverCON, 
  reactivateDriverCON, 
  deleteDriverCON, 
  getDriversStatisticsCON, 
  searchDriversCON, 
  checkExpiredLicenseCON 
} = require('../controllers/drivers.controller');

const Router = express.Router();

/**
 * @tag           :DRIVERS.CREATE
 * @route         :/drivers
 * @description   :Crear nuevo conductor
 * @method        :POST
 * @type          :BODY
 * @param {String} firstName - Nombres del conductor
 * @param {String} lastName - Apellidos del conductor
 * @param {String} idCard - Cédula del conductor
 * @param {String} licenseNumber - Número de licencia
 * @param {String} licenseGrade - Grado de licencia
 * @param {Date} licenseIssueDate - Fecha de emisión de licencia
 * @param {Date} licenseExpiryDate - Fecha de vencimiento de licencia
 * @param {String} [phone] - Teléfono del conductor
 * @param {String} [email] - Email del conductor
 * @param {String} address - Dirección del conductor
 * @param {Date} birthDate - Fecha de nacimiento
 * @param {String} nationality - Nacionalidad
 * @param {String} gender - Sexo del conductor
 * @returns {Object} - Respuesta con el conductor creado
 */
Router.post('/', verifyTokenMID, verifyFinesPermissionMID, createDriverCON);

/**
 * @tag           :DRIVERS.GET_ALL
 * @route         :/drivers
 * @description   :Obtener conductores con filtros
 * @method        :GET
 * @type          :QUERY
 * @param {Boolean} [active] - Estado activo
 * @param {Boolean} [suspended] - Estado suspendido
 * @param {String} [licenseGrade] - Grado de licencia
 * @param {String} [search] - Término de búsqueda
 * @param {Number} [page=1] - Página actual
 * @param {Number} [limit=10] - Límite por página
 * @returns {Object} - Respuesta con los conductores
 */
Router.get('/', verifyTokenMID, getDriversCON);

/**
 * @tag           :DRIVERS.GET_BY_ID
 * @route         :/drivers/:id
 * @description   :Obtener conductor por ID
 * @method        :GET
 * @type          :PARAMS
 * @param {String} id - ID del conductor
 * @returns {Object} - Respuesta con el conductor
 */
Router.get('/:id', verifyTokenMID, getDriverByIdCON);

/**
 * @tag           :DRIVERS.GET_BY_ID_CARD
 * @route         :/drivers/id-card/:idCard
 * @description   :Obtener conductor por cédula
 * @method        :GET
 * @type          :PARAMS
 * @param {String} idCard - Cédula del conductor
 * @returns {Object} - Respuesta con el conductor
 */
Router.get('/id-card/:idCard', verifyTokenMID, getDriverByIdCardCON);

/**
 * @tag           :DRIVERS.UPDATE
 * @route         :/drivers/:id
 * @description   :Actualizar conductor
 * @method        :PUT
 * @type          :BODY
 * @param {String} id - ID del conductor
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} - Respuesta con el conductor actualizado
 */
Router.put('/:id', verifyTokenMID, verifyFinesPermissionMID, updateDriverCON);

/**
 * @tag           :DRIVERS.SUSPEND
 * @route         :/drivers/:id/suspend
 * @description   :Suspender conductor
 * @method        :POST
 * @type          :BODY
 * @param {String} id - ID del conductor
 * @param {String} reason - Motivo de suspensión
 * @returns {Object} - Respuesta con el conductor suspendido
 */
Router.post('/:id/suspend', verifyTokenMID, verifyFinesPermissionMID, suspendDriverCON);

/**
 * @tag           :DRIVERS.REACTIVATE
 * @route         :/drivers/:id/reactivate
 * @description   :Reactivar conductor
 * @method        :POST
 * @type          :PARAMS
 * @param {String} id - ID del conductor
 * @returns {Object} - Respuesta con el conductor reactivado
 */
Router.post('/:id/reactivate', verifyTokenMID, verifyFinesPermissionMID, reactivateDriverCON);

/**
 * @tag           :DRIVERS.DELETE
 * @route         :/drivers/:id
 * @description   :Eliminar conductor
 * @method        :DELETE
 * @type          :PARAMS
 * @param {String} id - ID del conductor
 * @returns {Object} - Respuesta con el resultado
 */
Router.delete('/:id', verifyTokenMID, verifyFinesPermissionMID, deleteDriverCON);

/**
 * @tag           :DRIVERS.STATISTICS
 * @route         :/drivers/statistics
 * @description   :Obtener estadísticas de conductores
 * @method        :GET
 * @type          :QUERY
 * @returns {Object} - Respuesta con las estadísticas
 */
Router.get('/statistics', verifyTokenMID, getDriversStatisticsCON);

/**
 * @tag           :DRIVERS.SEARCH
 * @route         :/drivers/search
 * @description   :Buscar conductores
 * @method        :GET
 * @type          :QUERY
 * @param {String} term - Término de búsqueda
 * @returns {Object} - Respuesta con los conductores encontrados
 */
Router.get('/search', verifyTokenMID, searchDriversCON);

/**
 * @tag           :DRIVERS.CHECK_LICENSE
 * @route         :/drivers/:id/check-license
 * @description   :Verificar licencia vencida
 * @method        :GET
 * @type          :PARAMS
 * @param {String} id - ID del conductor
 * @returns {Object} - Respuesta con el estado de la licencia
 */
Router.get('/:id/check-license', verifyTokenMID, checkExpiredLicenseCON);

module.exports = Router;
