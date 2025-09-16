'use strict';

const express = require('express');
const { verifyTokenMID, verifyFinesPermissionMID } = require('../middlewares/auth.middleware');
const { 
  createVehicleCON, 
  getVehiclesCON, 
  getVehicleByIdCON, 
  getVehicleByPlateCON, 
  updateVehicleCON, 
  reportStolenCON, 
  removeStolenReportCON, 
  deleteVehicleCON, 
  getVehiclesStatisticsCON, 
  searchVehiclesCON, 
  checkStolenCON, 
  getStolenVehiclesCON 
} = require('../controllers/vehicles.controller');

const Router = express.Router();

/**
 * @tag           :VEHICLES.CREATE
 * @route         :/vehicles
 * @description   :Crear nuevo vehículo
 * @method        :POST
 * @type          :BODY
 * @param {String} plate - Placa del vehículo
 * @param {String} [serialNumber] - Número serial del vehículo
 * @param {String} [engineNumber] - Número de motor del vehículo
 * @param {String} brand - Marca del vehículo
 * @param {String} model - Modelo del vehículo
 * @param {Number} year - Año del vehículo
 * @param {String} color - Color del vehículo
 * @param {String} vehicleType - Tipo de vehículo
 * @param {Number} [displacement] - Cilindrada del motor
 * @param {String} [fuel] - Tipo de combustible
 * @param {String} [transmission] - Tipo de transmisión
 * @param {Object} owner - Datos del propietario
 * @returns {Object} - Respuesta con el vehículo creado
 */
Router.post('/', verifyTokenMID, verifyFinesPermissionMID, createVehicleCON);

/**
 * @tag           :VEHICLES.GET_ALL
 * @route         :/vehicles
 * @description   :Obtener vehículos con filtros
 * @method        :GET
 * @type          :QUERY
 * @param {Boolean} [active] - Estado activo
 * @param {Boolean} [stolen] - Estado robado
 * @param {String} [vehicleType] - Tipo de vehículo
 * @param {String} [brand] - Marca del vehículo
 * @param {String} [search] - Término de búsqueda
 * @param {Number} [page=1] - Página actual
 * @param {Number} [limit=10] - Límite por página
 * @returns {Object} - Respuesta con los vehículos
 */
Router.get('/', verifyTokenMID, getVehiclesCON);

/**
 * @tag           :VEHICLES.GET_BY_ID
 * @route         :/vehicles/:id
 * @description   :Obtener vehículo por ID
 * @method        :GET
 * @type          :PARAMS
 * @param {String} id - ID del vehículo
 * @returns {Object} - Respuesta con el vehículo
 */
Router.get('/:id', verifyTokenMID, getVehicleByIdCON);

/**
 * @tag           :VEHICLES.GET_BY_PLATE
 * @route         :/vehicles/plate/:plate
 * @description   :Obtener vehículo por placa
 * @method        :GET
 * @type          :PARAMS
 * @param {String} plate - Placa del vehículo
 * @returns {Object} - Respuesta con el vehículo
 */
Router.get('/plate/:plate', verifyTokenMID, getVehicleByPlateCON);

/**
 * @tag           :VEHICLES.UPDATE
 * @route         :/vehicles/:id
 * @description   :Actualizar vehículo
 * @method        :PUT
 * @type          :BODY
 * @param {String} id - ID del vehículo
 * @param {Object} updateData - Datos a actualizar
 * @returns {Object} - Respuesta con el vehículo actualizado
 */
Router.put('/:id', verifyTokenMID, verifyFinesPermissionMID, updateVehicleCON);

/**
 * @tag           :VEHICLES.REPORT_STOLEN
 * @route         :/vehicles/:id/report-stolen
 * @description   :Reportar vehículo como robado
 * @method        :POST
 * @type          :BODY
 * @param {String} id - ID del vehículo
 * @param {String} reportNumber - Número de denuncia
 * @returns {Object} - Respuesta con el vehículo reportado
 */
Router.post('/:id/report-stolen', verifyTokenMID, verifyFinesPermissionMID, reportStolenCON);

/**
 * @tag           :VEHICLES.REMOVE_STOLEN_REPORT
 * @route         :/vehicles/:id/remove-stolen-report
 * @description   :Quitar reporte de robo
 * @method        :POST
 * @type          :PARAMS
 * @param {String} id - ID del vehículo
 * @returns {Object} - Respuesta con el vehículo actualizado
 */
Router.post('/:id/remove-stolen-report', verifyTokenMID, verifyFinesPermissionMID, removeStolenReportCON);

/**
 * @tag           :VEHICLES.DELETE
 * @route         :/vehicles/:id
 * @description   :Eliminar vehículo
 * @method        :DELETE
 * @type          :PARAMS
 * @param {String} id - ID del vehículo
 * @returns {Object} - Respuesta con el resultado
 */
Router.delete('/:id', verifyTokenMID, verifyFinesPermissionMID, deleteVehicleCON);

/**
 * @tag           :VEHICLES.STATISTICS
 * @route         :/vehicles/statistics
 * @description   :Obtener estadísticas de vehículos
 * @method        :GET
 * @type          :QUERY
 * @returns {Object} - Respuesta con las estadísticas
 */
Router.get('/statistics', verifyTokenMID, getVehiclesStatisticsCON);

/**
 * @tag           :VEHICLES.SEARCH
 * @route         :/vehicles/search
 * @description   :Buscar vehículos
 * @method        :GET
 * @type          :QUERY
 * @param {String} term - Término de búsqueda
 * @returns {Object} - Respuesta con los vehículos encontrados
 */
Router.get('/search', verifyTokenMID, searchVehiclesCON);

/**
 * @tag           :VEHICLES.CHECK_STOLEN
 * @route         :/vehicles/:id/check-stolen
 * @description   :Verificar si vehículo está reportado como robado
 * @method        :GET
 * @type          :PARAMS
 * @param {String} id - ID del vehículo
 * @returns {Object} - Respuesta con el estado del vehículo
 */
Router.get('/:id/check-stolen', verifyTokenMID, checkStolenCON);

/**
 * @tag           :VEHICLES.GET_STOLEN
 * @route         :/vehicles/stolen
 * @description   :Obtener vehículos robados
 * @method        :GET
 * @type          :QUERY
 * @param {Number} [page=1] - Página actual
 * @param {Number} [limit=10] - Límite por página
 * @returns {Object} - Respuesta con los vehículos robados
 */
Router.get('/stolen', verifyTokenMID, getStolenVehiclesCON);

module.exports = Router;
