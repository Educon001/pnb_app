'use strict';

const { CmmErrorClass } = require('./CmmErrorClass');

/**
 * @description Convertir fecha de formato DD/MM/YYYY a objeto Date
 * @param {String} _dateString - Fecha en formato DD/MM/YYYY
 * @returns {Date} Objeto Date válido
 */
const parseDateSV = (_dateString) => {
  if (!_dateString || typeof _dateString !== 'string') {
    throw new CmmErrorClass(__filename, 'DATE001', 'Fecha no válida').frontend();
  }

  // Validar formato DD/MM/YYYY
  const DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const MATCH = _dateString.match(DATE_REGEX);
  
  if (!MATCH) {
    throw new CmmErrorClass(__filename, 'DATE002', 'Formato de fecha inválido. Use DD/MM/YYYY').frontend();
  }

  const [, day, month, year] = MATCH;
  const DAY_NUM = parseInt(day, 10);
  const MONTH_NUM = parseInt(month, 10);
  const YEAR_NUM = parseInt(year, 10);

  // Validar rangos
  if (DAY_NUM < 1 || DAY_NUM > 31) {
    throw new CmmErrorClass(__filename, 'DATE003', 'Día inválido').frontend();
  }
  if (MONTH_NUM < 1 || MONTH_NUM > 12) {
    throw new CmmErrorClass(__filename, 'DATE004', 'Mes inválido').frontend();
  }
  if (YEAR_NUM < 1900 || YEAR_NUM > 2100) {
    throw new CmmErrorClass(__filename, 'DATE005', 'Año inválido').frontend();
  }

  // Crear objeto Date (mes - 1 porque Date usa índice base 0)
  const DATE_OBJECT = new Date(YEAR_NUM, MONTH_NUM - 1, DAY_NUM);
  
  // Validar que la fecha es válida (por ejemplo, 31/02/2025 no es válida)
  if (DATE_OBJECT.getDate() !== DAY_NUM || 
      DATE_OBJECT.getMonth() !== MONTH_NUM - 1 || 
      DATE_OBJECT.getFullYear() !== YEAR_NUM) {
    throw new CmmErrorClass(__filename, 'DATE006', 'Fecha no válida').frontend();
  }

  return DATE_OBJECT;
};

/**
 * @description Formatear fecha a formato DD/MM/YYYY
 * @param {Date} _date - Fecha a formatear
 * @returns {String} Fecha formateada
 */
const formatDateSV = (_date) => {
  if (!_date || !(_date instanceof Date) || isNaN(_date.getTime())) {
    throw new CmmErrorClass(__filename, 'DATE007', 'Fecha no válida para formatear').frontend();
  }

  const DAY = String(_date.getDate()).padStart(2, '0');
  const MONTH = String(_date.getMonth() + 1).padStart(2, '0');
  const YEAR = _date.getFullYear();
  return `${DAY}/${MONTH}/${YEAR}`;
};

/**
 * @description Validar si una fecha está en el rango válido
 * @param {Date} _date - Fecha a validar
 * @param {Date} _minDate - Fecha mínima (opcional)
 * @param {Date} _maxDate - Fecha máxima (opcional)
 * @returns {Boolean} True si la fecha está en el rango válido
 */
const validateDateRangeSV = (_date, _minDate = null, _maxDate = null) => {
  if (!_date || !(_date instanceof Date) || isNaN(_date.getTime())) {
    return false;
  }

  if (_minDate && _date < _minDate) {
    return false;
  }

  if (_maxDate && _date > _maxDate) {
    return false;
  }

  return true;
};

/**
 * @description Obtener fecha actual en formato DD/MM/YYYY
 * @returns {String} Fecha actual formateada
 */
const getCurrentDateSV = () => {
  return formatDateSV(new Date());
};

/**
 * @description Obtener fecha de hace N días en formato DD/MM/YYYY
 * @param {Number} _days - Número de días a restar
 * @returns {String} Fecha formateada
 */
const getDateDaysAgoSV = (_days) => {
  const DATE = new Date();
  DATE.setDate(DATE.getDate() - _days);
  return formatDateSV(DATE);
};

/**
 * @description Obtener fecha de dentro de N días en formato DD/MM/YYYY
 * @param {Number} _days - Número de días a sumar
 * @returns {String} Fecha formateada
 */
const getDateDaysFromNowSV = (_days) => {
  const DATE = new Date();
  DATE.setDate(DATE.getDate() + _days);
  return formatDateSV(DATE);
};

module.exports = {
  parseDateSV,
  formatDateSV,
  validateDateRangeSV,
  getCurrentDateSV,
  getDateDaysAgoSV,
  getDateDaysFromNowSV
};
