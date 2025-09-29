'use strict';

const { CmmErrorClass } = require('../utils');

/**
 * @description Builder para construir objetos Fine complejos paso a paso
 * Implementa el patrón Builder para facilitar la construcción de multas con estructura embebida
 */
class FineBuilder {
  constructor() {
    this.reset();
  }

  /**
   * @description Resetear el builder para una nueva construcción
   * @returns {FineBuilder} Instancia del builder
   */
  reset() {
    this._fineData = {
      status: 'DRAFT',
      isOtherOwner: false,
      evidence: []
    };
    return this;
  }

  /**
   * @description Establecer información básica de la multa
   * @param {String} _fineNumber - Número de la multa
   * @param {String} _infractionReference - Referencia de la infracción
   * @param {String} _infractionId - ID de la infracción
   * @param {String} _officerId - ID del oficial
   * @returns {FineBuilder} Instancia del builder
   */
  setBasicInfo(_fineNumber, _infractionReference, _infractionId, _officerId) {
    this._fineData.fineNumber = _fineNumber;
    this._fineData.infractionReference = _infractionReference;
    this._fineData.infraction = _infractionId;
    this._fineData.officer = _officerId;
    return this;
  }

  /**
   * @description Establecer fecha y hora de la infracción
   * @param {Date|String} _infractionDate - Fecha de la infracción
   * @param {String} _infractionTime - Hora de la infracción
   * @returns {FineBuilder} Instancia del builder
   */
  setInfractionDateTime(_infractionDate, _infractionTime) {
    this._fineData.infractionDate = new Date(_infractionDate);
    this._fineData.infractionTime = _infractionTime;
    return this;
  }

  /**
   * @description Establecer ubicación de la infracción
   * @param {Object} _location - Datos de ubicación
   * @param {String} _location.address - Dirección
   * @param {Object} _location.coordinates - Coordenadas
   * @returns {FineBuilder} Instancia del builder
   */
  setLocation(_location) {
    if (!_location || !_location.address) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE001', 'La ubicación es obligatoria').frontend();
    }

    this._fineData.location = {
      address: _location.address,
      coordinates: _location.coordinates || {}
    };
    return this;
  }

  /**
   * @description Establecer datos del conductor
   * @param {Object} _driverData - Datos del conductor
   * @returns {FineBuilder} Instancia del builder
   */
  setDriver(_driverData) {
    if (!_driverData || !_driverData.firstName || !_driverData.lastName || !_driverData.documentNumber) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE002', 'Los datos del conductor son obligatorios').frontend();
    }

    this._fineData.driver = {
      firstName: _driverData.firstName.toUpperCase(),
      lastName: _driverData.lastName.toUpperCase(),
      idDocumentType: _driverData.idDocumentType || 'V',
      documentNumber: _driverData.documentNumber.toUpperCase(),
      licenseGrade: _driverData.licenseGrade,
      license: _driverData.license || null,
      address: _driverData.address,
      email: _driverData.email?.toLowerCase(),
      phone: _driverData.phone
    };
    return this;
  }

  /**
   * @description Establecer datos del propietario
   * @param {Object} _ownerData - Datos del propietario
   * @param {Boolean} _isOtherOwner - Si el propietario es diferente al conductor
   * @returns {FineBuilder} Instancia del builder
   */
  setOwner(_ownerData, _isOtherOwner = false) {
    this._fineData.isOtherOwner = _isOtherOwner;

    if (_isOtherOwner) {
      if (!_ownerData || !_ownerData.firstName || !_ownerData.lastName || !_ownerData.documentNumber) {
        throw new CmmErrorClass(__filename, 'CPNB-BFINE003', 'Los datos del propietario son obligatorios cuando es diferente al conductor').frontend();
      }

      this._fineData.owner = {
        firstName: _ownerData.firstName.toUpperCase(),
        lastName: _ownerData.lastName.toUpperCase(),
        idDocumentType: _ownerData.idDocumentType || 'V',
        documentNumber: _ownerData.documentNumber.toUpperCase(),
        licenseGrade: _ownerData.licenseGrade,
        license: _ownerData.license || null,
        address: _ownerData.address,
        email: _ownerData.email?.toLowerCase()
      };
    } else {
      // Si no es otro propietario, usar los datos del conductor
      this._fineData.owner = {
        firstName: this._fineData.driver.firstName,
        lastName: this._fineData.driver.lastName,
        idDocumentType: this._fineData.driver.idDocumentType,
        documentNumber: this._fineData.driver.documentNumber,
        licenseGrade: this._fineData.driver.licenseGrade,
        license: this._fineData.driver.license,
        address: this._fineData.driver.address,
        email: this._fineData.driver.email
      };
    }
    return this;
  }

  /**
   * @description Establecer datos del vehículo
   * @param {Object} _vehicleData - Datos del vehículo
   * @returns {FineBuilder} Instancia del builder
   */
  setVehicle(_vehicleData) {
    if (!_vehicleData || !_vehicleData.plate || !_vehicleData.brand || !_vehicleData.model || !_vehicleData.year || !_vehicleData.color) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE004', 'Los datos del vehículo son obligatorios').frontend();
    }

    this._fineData.vehicle = {
      plate: _vehicleData.plate.toUpperCase(),
      brand: _vehicleData.brand.toUpperCase(),
      model: _vehicleData.model.toUpperCase(),
      year: _vehicleData.year.toString(),
      color: _vehicleData.color.toUpperCase(),
      type: _vehicleData.type.toUpperCase()
    };
    return this;
  }

  /**
   * @description Establecer evidencias
   * @param {Array} _evidenceData - Array de evidencias
   * @returns {FineBuilder} Instancia del builder
   */
  setEvidence(_evidenceData) {
    if (!_evidenceData || !Array.isArray(_evidenceData)) {
      this._fineData.evidence = [];
      return this;
    }

    this._fineData.evidence = _evidenceData.map(evidence => {
      if (typeof evidence === 'string') {
        return {
          type: 'PHOTO',
          url: evidence,
          description: 'Evidencia fotográfica'
        };
      }
      return {
        type: evidence.type || 'PHOTO',
        url: evidence.url,
        description: evidence.description || 'Evidencia'
      };
    });
    return this;
  }

  /**
   * @description Establecer montos de la multa
   * @param {Number} _infractionAmount - Monto en bolívares
   * @param {Number} _infractionUT - Unidades tributarias
   * @returns {FineBuilder} Instancia del builder
   */
  setAmounts(_infractionAmount, _infractionUT) {
    this._fineData.infractionAmount = _infractionAmount;
    this._fineData.infractionUT = _infractionUT;
    return this;
  }

  /**
   * @description Establecer notas adicionales
   * @param {String} _notes - Notas de la multa
   * @returns {FineBuilder} Instancia del builder
   */
  setNotes(_notes) {
    this._fineData.notes = _notes || null;
    return this;
  }

  /**
   * @description Establecer estado de la multa
   * @param {String} _status - Estado de la multa
   * @returns {FineBuilder} Instancia del builder
   */
  setStatus(_status) {
    const validStatuses = ['DRAFT', 'SENT', 'PAID', 'CANCELLED'];
    if (!validStatuses.includes(_status)) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE005', 'Estado de multa no válido').frontend();
    }
    this._fineData.status = _status;
    return this;
  }

  /**
   * @description Construir el objeto Fine final
   * @returns {Object} Objeto Fine construido
   */
  build() {
    // Validar que se han establecido los campos obligatorios
    this._validateRequiredFields();
    
    // Agregar timestamps
    this._fineData.createdAt = new Date();
    this._fineData.updatedAt = new Date();
    
    return { ...this._fineData };
  }

  /**
   * @description Validar campos obligatorios
   * @private
   */
  _validateRequiredFields() {
    const requiredFields = [
      'fineNumber', 'infractionReference', 'infraction', 'officer',
      'infractionDate', 'location', 'driver', 'vehicle'
    ];

    for (const field of requiredFields) {
      if (!this._fineData[field]) {
        throw new CmmErrorClass(__filename, 'CPNB-BFINE006', `Campo obligatorio faltante: ${field}`).frontend();
      }
    }

    // Validar estructura de ubicación
    if (!this._fineData.location.address) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE007', 'La dirección de la ubicación es obligatoria').frontend();
    }

    // Validar estructura del conductor
    if (!this._fineData.driver.firstName || !this._fineData.driver.lastName || !this._fineData.driver.documentNumber) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE008', 'Los datos básicos del conductor son obligatorios').frontend();
    }

    // Validar estructura del vehículo
    if (!this._fineData.vehicle.plate || !this._fineData.vehicle.brand || !this._fineData.vehicle.model) {
      throw new CmmErrorClass(__filename, 'CPNB-BFINE009', 'Los datos básicos del vehículo son obligatorios').frontend();
    }
  }
}

module.exports = FineBuilder;
