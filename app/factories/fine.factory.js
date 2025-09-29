'use strict';

const { CmmErrorClass } = require('../utils');

/**
 * @description Factory para crear diferentes tipos de multas
 * Implementa el patrón Factory para simplificar la creación de objetos complejos
 */
class FineFactory {
  /**
   * @description Crear multa estándar
   * @param {Object} _data - Datos de la multa
   * @returns {Object} Datos de la multa estándar
   */
  static createStandardFine(_data) {
    return {
      fineNumber: _data.fineNumber,
      infractionReference: _data.infractionReference,
      infraction: _data.infractionId,
      officer: _data.officerId,
      status: 'DRAFT',
      infractionDate: new Date(_data.infractionDate),
      infractionTime: _data.infractionTime,
      location: {
        address: _data.location.address,
        coordinates: _data.location.coordinates || {}
      },
      driver: {
        firstName: _data.driverFirstName.toUpperCase(),
        lastName: _data.driverLastName.toUpperCase(),
        idDocumentType: 'V',
        documentNumber: _data.driver.toUpperCase(),
        licenseGrade: _data.driverLicenseGrade,
        license: _data.driverLicense || null,
        address: _data.driverAddress,
        email: _data.driverEmail?.toLowerCase(),
        phone: _data.driverPhone
      },
      owner: _data.isOtherOwner ? {
        firstName: _data.ownerFirstName.toUpperCase(),
        lastName: _data.ownerLastName.toUpperCase(),
        idDocumentType: 'V',
        documentNumber: _data.ownerIdCard.toUpperCase(),
        licenseGrade: _data.ownerLicenseGrade,
        license: _data.ownerLicense || null,
        address: _data.ownerAddress,
        email: _data.ownerEmail?.toLowerCase()
      } : {
        firstName: _data.driverFirstName.toUpperCase(),
        lastName: _data.driverLastName.toUpperCase(),
        idDocumentType: 'V',
        documentNumber: _data.driver.toUpperCase(),
        licenseGrade: _data.driverLicenseGrade,
        license: _data.driverLicense || null,
        address: _data.driverAddress,
        email: _data.driverEmail?.toLowerCase()
      },
      vehicle: {
        plate: _data.vehiclePlate.toUpperCase(),
        brand: _data.vehicleBrand.toUpperCase(),
        model: _data.vehicleModel.toUpperCase(),
        year: _data.vehicleYear.toString(),
        color: _data.vehicleColor.toUpperCase(),
        type: _data.vehicleType.toUpperCase()
      },
      evidence: FineFactory.createEvidenceArray(_data.evidence),
      infractionAmount: _data.infractionAmount,
      infractionUT: _data.infractionUT,
      isOtherOwner: _data.isOtherOwner || false,
      notes: _data.notes || null
    };
  }

  /**
   * @description Crear multa de emergencia (con datos mínimos)
   * @param {Object} _data - Datos mínimos de la multa
   * @returns {Object} Datos de la multa de emergencia
   */
  static createEmergencyFine(_data) {
    return {
      fineNumber: _data.fineNumber,
      infractionReference: _data.infractionReference,
      infraction: _data.infractionId,
      officer: _data.officerId,
      status: 'DRAFT',
      infractionDate: new Date(),
      infractionTime: new Date().toTimeString().slice(0, 5),
      location: {
        address: _data.location?.address || 'Ubicación no especificada',
        coordinates: _data.location?.coordinates || {}
      },
      driver: {
        firstName: _data.driverFirstName?.toUpperCase() || 'NO ESPECIFICADO',
        lastName: _data.driverLastName?.toUpperCase() || 'NO ESPECIFICADO',
        idDocumentType: 'V',
        documentNumber: _data.driver?.toUpperCase() || '00000000',
        licenseGrade: _data.driverLicenseGrade || 'NO ESPECIFICADO',
        license: null,
        address: _data.driverAddress || 'No especificada',
        email: _data.driverEmail?.toLowerCase(),
        phone: _data.driverPhone
      },
      owner: {
        firstName: _data.driverFirstName?.toUpperCase() || 'NO ESPECIFICADO',
        lastName: _data.driverLastName?.toUpperCase() || 'NO ESPECIFICADO',
        idDocumentType: 'V',
        documentNumber: _data.driver?.toUpperCase() || '00000000',
        licenseGrade: _data.driverLicenseGrade || 'NO ESPECIFICADO',
        license: null,
        address: _data.driverAddress || 'No especificada',
        email: _data.driverEmail?.toLowerCase()
      },
      vehicle: {
        plate: _data.vehiclePlate?.toUpperCase() || 'NO ESPECIFICADA',
        brand: _data.vehicleBrand?.toUpperCase() || 'NO ESPECIFICADA',
        model: _data.vehicleModel?.toUpperCase() || 'NO ESPECIFICADO',
        year: _data.vehicleYear?.toString() || '0000',
        color: _data.vehicleColor?.toUpperCase() || 'NO ESPECIFICADO',
        type: _data.vehicleType?.toUpperCase() || 'NO ESPECIFICADO'
      },
      evidence: FineFactory.createEvidenceArray(_data.evidence),
      infractionAmount: _data.infractionAmount || 0,
      infractionUT: _data.infractionUT || 0,
      isOtherOwner: false,
      notes: _data.notes || 'Multa de emergencia - datos mínimos'
    };
  }

  /**
   * @description Crear array de evidencias
   * @param {Array} _evidenceData - Datos de evidencias
   * @returns {Array} Array de evidencias procesadas
   */
  static createEvidenceArray(_evidenceData) {
    if (!_evidenceData || !Array.isArray(_evidenceData)) {
      return [];
    }

    return _evidenceData.map(evidence => {
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
  }

  /**
   * @description Crear datos de correo para notificación
   * @param {Object} _fineData - Datos de la multa
   * @param {Object} _infractionData - Datos de la infracción
   * @param {Object} _officerData - Datos del oficial
   * @returns {Object} Datos de correo formateados
   */
  static createMailData(_fineData, _infractionData, _officerData) {
    return {
      fineId: _fineData.fineNumber,
      date: _fineData.infractionDate,
      offense: _infractionData.name,
      article: _infractionData.article,
      plate: _fineData.vehicle.plate,
      model: `${_fineData.vehicle.brand} ${_fineData.vehicle.model} ${_fineData.vehicle.year}`,
      color: _fineData.vehicle.color,
      amount: `Bs. ${_fineData.infractionAmount?.toLocaleString('es-VE') || '0'}`,
      officer: `${_officerData.firstName} ${_officerData.lastName}`,
      officerId: _officerData.idCard,
      paymentDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 días
      reconsiderationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
      paymentGatewayUrl: 'https://sandbox-payments.pagochinchin.com/68c9dcbe91bcba6abf5c2e49/aHR0cHM6Ly93Ny5wbmd3aW5nLmNvbS9wbmdzLzg2Ni81NC9wbmctdHJhbnNwYXJlbnQtZW1vamktc2FkbmVzcy1lbW90aWNvbi1zbWlsZXktc2FkLWVtb2ppLWNyeWluZy1pbW9qaS1mYWNlLXN0aWNrZXItZGVza3RvcC13YWxscGFwZXItdGh1bWJuYWlsLnBuZw%3D%3D'
    };
  }

  /**
   * @description Crear filtros de búsqueda
   * @param {Object} _queryParams - Parámetros de consulta
   * @returns {Object} Filtros formateados
   */
  static createSearchFilters(_queryParams) {
    const filters = {};

    if (_queryParams.status) filters.status = _queryParams.status;
    if (_queryParams.officer) filters.officer = _queryParams.officer;
    if (_queryParams.driverId) filters.driverId = _queryParams.driverId;
    if (_queryParams.vehiclePlate) filters.vehiclePlate = _queryParams.vehiclePlate;
    if (_queryParams.dateFrom) filters.dateFrom = _queryParams.dateFrom;
    if (_queryParams.dateTo) filters.dateTo = _queryParams.dateTo;

    return filters;
  }

  /**
   * @description Crear datos de actualización de multa
   * @param {Object} _updateData - Datos a actualizar
   * @returns {Object} Datos de actualización formateados
   */
  static createUpdateData(_updateData) {
    const updateFields = {
      updatedAt: new Date()
    };

    // Solo incluir campos que están presentes en los datos de actualización
    if (_updateData.status) updateFields.status = _updateData.status;
    if (_updateData.notes !== undefined) updateFields.notes = _updateData.notes;
    if (_updateData.sentAt) updateFields.sentAt = _updateData.sentAt;
    if (_updateData.paidAt) updateFields.paidAt = _updateData.paidAt;
    if (_updateData.cancelledAt) updateFields.cancelledAt = _updateData.cancelledAt;
    if (_updateData.cancellationReason) updateFields.cancellationReason = _updateData.cancellationReason;
    if (_updateData.cancelledBy) updateFields.cancelledBy = _updateData.cancelledBy;
    if (_updateData.paymentMethod) updateFields.paymentMethod = _updateData.paymentMethod;
    if (_updateData.paymentReference) updateFields.paymentReference = _updateData.paymentReference;

    return updateFields;
  }
}

module.exports = FineFactory;
