'use strict';

const express = require('express');
const { verifyTokenMID, verifyStatisticsPermissionMID } = require('../middlewares/auth.middleware');
const { 
  getGeneralStatisticsCON, 
  getStatisticsByPeriodCON, 
  getPerformanceStatisticsCON, 
  getMostCommonInfractionsCON, 
  getMostFrequentLocationsCON, 
  getMostFinedVehiclesCON, 
  getDashboardSummaryCON, 
  getStatisticsByStatusCON, 
  getRevenueStatisticsCON 
} = require('../controllers/statistics.controller');

const Router = express.Router();

/**
 * @tag           :STATISTICS.GENERAL
 * @route         :/statistics/general
 * @description   :Obtener estadísticas generales
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las estadísticas generales
 */
Router.get('/general', verifyTokenMID, verifyStatisticsPermissionMID, getGeneralStatisticsCON);

/**
 * @tag           :STATISTICS.BY_PERIOD
 * @route         :/statistics/by-period
 * @description   :Obtener estadísticas por período
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las estadísticas por período
 */
Router.get('/by-period', verifyTokenMID, verifyStatisticsPermissionMID, getStatisticsByPeriodCON);

/**
 * @tag           :STATISTICS.PERFORMANCE
 * @route         :/statistics/performance
 * @description   :Obtener estadísticas de rendimiento
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @returns {Object} - Respuesta con las estadísticas de rendimiento
 */
Router.get('/performance', verifyTokenMID, verifyStatisticsPermissionMID, getPerformanceStatisticsCON);

/**
 * @tag           :STATISTICS.MOST_COMMON_INFRACTIONS
 * @route         :/statistics/most-common-infractions
 * @description   :Obtener infracciones más comunes
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las infracciones más comunes
 */
Router.get('/most-common-infractions', verifyTokenMID, verifyStatisticsPermissionMID, getMostCommonInfractionsCON);

/**
 * @tag           :STATISTICS.MOST_FREQUENT_LOCATIONS
 * @route         :/statistics/most-frequent-locations
 * @description   :Obtener ubicaciones más frecuentes
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las ubicaciones más frecuentes
 */
Router.get('/most-frequent-locations', verifyTokenMID, verifyStatisticsPermissionMID, getMostFrequentLocationsCON);

/**
 * @tag           :STATISTICS.MOST_FINED_VEHICLES
 * @route         :/statistics/most-fined-vehicles
 * @description   :Obtener vehículos más multados
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con los vehículos más multados
 */
Router.get('/most-fined-vehicles', verifyTokenMID, verifyStatisticsPermissionMID, getMostFinedVehiclesCON);

/**
 * @tag           :STATISTICS.DASHBOARD
 * @route         :/statistics/dashboard
 * @description   :Obtener resumen para dashboard
 * @method        :GET
 * @type          :QUERY
 * @returns {Object} - Respuesta con el resumen del dashboard
 */
Router.get('/dashboard', verifyTokenMID, getDashboardSummaryCON);

/**
 * @tag           :STATISTICS.BY_STATUS
 * @route         :/statistics/by-status
 * @description   :Obtener estadísticas de multas por estado
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las estadísticas por estado
 */
Router.get('/by-status', verifyTokenMID, verifyStatisticsPermissionMID, getStatisticsByStatusCON);

/**
 * @tag           :STATISTICS.REVENUE
 * @route         :/statistics/revenue
 * @description   :Obtener estadísticas de recaudación
 * @method        :GET
 * @type          :QUERY
 * @param {Date} [dateFrom] - Fecha desde
 * @param {Date} [dateTo] - Fecha hasta
 * @param {String} [officer] - ID del oficial
 * @returns {Object} - Respuesta con las estadísticas de recaudación
 */
Router.get('/revenue', verifyTokenMID, verifyStatisticsPermissionMID, getRevenueStatisticsCON);

module.exports = Router;
