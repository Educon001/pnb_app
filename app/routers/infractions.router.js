'use strict';

const express = require('express');
const { verifyTokenMID, verifyInfractionsPermissionMID } = require('../middlewares/auth.middleware');
const { 
  createInfractionCON, 
  getInfractionsCON, 
  getInfractionByIdCON, 
  updateInfractionCON, 
  deleteInfractionCON, 
  getInfractionsBySeverityCON, 
  getInfractionsByVehicleTypeCON, 
  getInfractionsStatisticsCON, 
  searchInfractionsCON 
} = require('../controllers/infractions.controller');

const Router = express.Router();

/**
 * @tag           :INFRACTIONS.CREATE
 * @route         :/infractions
 * @description   :Crear nueva infracción
 * @method        :POST
 * @type          :BODY
 * @param {String} code - Código de la infracción
 * @param {String} name - Nombre de la infracción
 * @param {String} description - Descripción de la infracción
 * @param {String} article - Artículo de la ley
 * @param {String} severity - Gravedad de la infracción
 * @param {String} vehicleType - Tipo de vehículo
 * @param {Number} taxUnits - Unidades tributarias
 * @param {Number} bolivarValue - Valor en bolívares
 * @param {Number} [licensePoints=0] - Puntos de licencia
 * @param {Boolean} [requiresPhoto=false] - Requiere foto
 * @param {Boolean} [requiresEvidence=false] - Requiere evidencia
 * @returns {Object} - Respuesta con la infracción creada
 */
Router.post('/', verifyTokenMID, verifyInfractionsPermissionMID, createInfractionCON);

/**
 * @tag           :INFRACTIONS.GET_ALL
 * @route         :/infractions
 * @description   :Obtener infracciones con filtros
 * @method        :GET
 * @type          :QUERY
 * @param {Boolean} [active] - Estado activo
 * @param {String} [severity] - Gravedad de la infracción
 * @param {String} [vehicleType] - Tipo de vehículo
 * @param {String} [search] - Término de búsqueda
 * @param {Number} [page=1] - Página actual
 * @param {Number} [limit=10] - Límite por página
 * @returns {Object} - Respuesta con las infracciones
 */
Router.get('/', verifyTokenMID, getInfractionsCON);

/**
 * @tag           :INFRACTIONS.GET_BY_ID
 * @route         :/infractions/:id
 * @description   :Obtener infracción por ID
 * @method        :GET
 * @type          :PARAMS
 * @param {String} id - ID de la infracción
 * @returns {Object} - Respuesta con la infracción
 */
Router.get('/:id', verifyTokenMID, getInfractionByIdCON);

/**
 * @tag           :INFRACTIONS.UPDATE
 * @route         :/infractions/:id
 * @description   :Actualizar infracción
 * @method        :PUT
 * @type          :BODY
 * @param {String} id - ID de la infracción
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} - Respuesta con la infracción actualizada
 */
Router.put('/:id', verifyTokenMID, verifyInfractionsPermissionMID, updateInfractionCON);

/**
 * @tag           :INFRACTIONS.DELETE
 * @route         :/infractions/:id
 * @description   :Eliminar infracción
 * @method        :DELETE
 * @type          :PARAMS
 * @param {String} id - ID de la infracción
 * @returns {Object} - Respuesta con el resultado
 */
Router.delete('/:id', verifyTokenMID, verifyInfractionsPermissionMID, deleteInfractionCON);

/**
 * @tag           :INFRACTIONS.GET_BY_SEVERITY
 * @route         :/infractions/severity/:severity
 * @description   :Obtener infracciones por gravedad
 * @method        :GET
 * @type          :PARAMS
 * @param {String} severity - Gravedad de la infracción
 * @returns {Object} - Respuesta con las infracciones
 */
Router.get('/severity/:severity', verifyTokenMID, getInfractionsBySeverityCON);

/**
 * @tag           :INFRACTIONS.GET_BY_VEHICLE_TYPE
 * @route         :/infractions/vehicle-type/:type
 * @description   :Obtener infracciones por tipo de vehículo
 * @method        :GET
 * @type          :PARAMS
 * @param {String} type - Tipo de vehículo
 * @returns {Object} - Respuesta con las infracciones
 */
Router.get('/vehicle-type/:type', verifyTokenMID, getInfractionsByVehicleTypeCON);

/**
 * @tag           :INFRACTIONS.STATISTICS
 * @route         :/infractions/statistics
 * @description   :Obtener estadísticas de infracciones
 * @method        :GET
 * @type          :QUERY
 * @returns {Object} - Respuesta con las estadísticas
 */
Router.get('/statistics', verifyTokenMID, getInfractionsStatisticsCON);

/**
 * @tag           :INFRACTIONS.SEARCH
 * @route         :/infractions/search
 * @description   :Buscar infracciones
 * @method        :GET
 * @type          :QUERY
 * @param {String} term - Término de búsqueda
 * @returns {Object} - Respuesta con las infracciones encontradas
 */
Router.get('/search', verifyTokenMID, searchInfractionsCON);

module.exports = Router;
