'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Police = require('../models/police.model');
const Infraction = require('../models/infraction.model');
const Fine = require('../models/fine.model');
const TaxUnit = require('../models/tax-unit.model');
const EmailTemplate = require('../models/email-template.model');

// Datos de ejemplo
const policeData = [
  {
    firstName: 'Juan',
    lastName: 'Rodriguez',
    idCard: '12345678',
    badgeNumber: 'PNB001',
    rank: 'OFICIAL',
    department: 'TRÁNSITO TERRESTRE',
    username: 'jrodriguez',
    password: '123456',
    email: 'jrodriguez@pnb.gob.ve',
    phone: '04121234567',
    address: 'Caracas, Venezuela',
    roles: ['ADMIN'],
    active: true
  },
  {
    firstName: 'María',
    lastName: 'González',
    idCard: '87654321',
    badgeNumber: 'PNB002',
    rank: 'SARGENTO',
    department: 'TRÁNSITO TERRESTRE',
    username: 'mgonzalez',
    password: '123456',
    email: 'mgonzalez@pnb.gob.ve',
    phone: '04129876543',
    address: 'Valencia, Venezuela',
    roles: ['SUPERVISOR'],
    active: true
  },
  {
    firstName: 'Pedro Antonio',
    lastName: 'Pérez',
    idCard: '11223344',
    badgeNumber: 'PNB003',
    rank: 'OFICIAL',
    department: 'TRÁNSITO TERRESTRE',
    username: 'pperez',
    password: '123456',
    email: 'pperez@pnb.gob.ve',
    phone: '04125556677',
    address: 'Maracay, Venezuela',
    roles: ['OFICIAL'],
    active: true
  }
];

const infractionsData = [
  // GRAVES - Art. 169
  {
    code: 'ART169001',
    name: 'CONDUCIR SIN LICENCIA',
    description: 'Conducir sin licencia',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169002',
    name: 'NO OBEDECER SEÑALES DE SEMÁFORO',
    description: 'No obedecer señales de semáforo',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169003',
    name: 'NO APROBAR LA REVISIÓN TÉCNICA DEL VEHÍCULO',
    description: 'No aprobar la revisión técnica del vehículo',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169004',
    name: 'EXCEDER EL LÍMITE DE VELOCIDAD',
    description: 'Exceder el límite de velocidad',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169005',
    name: 'PROVEER DATOS FALSOS AL REGISTRO DE VEHÍCULOS Y CONDUCTORES',
    description: 'Proveer datos falsos al registro de vehículos y conductores',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169006',
    name: 'SOBREPASAR EL TIEMPO MÁXIMO PERMITIDO DE CONDUCCIÓN',
    description: 'Sobrepasar el tiempo máximo permitido de conducción para transporte público o de carga',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169007',
    name: 'NEGLIGENCIA QUE PONGA EN PELIGRO LA SEGURIDAD VIAL',
    description: 'Negligencia que ponga en peligro la seguridad vial',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169008',
    name: 'CIRCULAR POR CANALES NO PERMITIDOS',
    description: 'Circular por canales no permitidos para determinados vehículos (públicos, privados o de carga)',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // MENOS GRAVES - Art. 170
  {
    code: 'ART170001',
    name: 'TRANSITAR CAMBIANDO DE CARRIL FRECUENTEMENTE',
    description: 'Transitar cambiando de carril frecuentemente de forma imprudente',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170002',
    name: 'CIRCULAR ENTRE CANALES O PARALELAMENTE A OTRO VEHÍCULO',
    description: 'Circular entre canales o paralelamente a otro vehículo en movimiento a más de 60 km/h',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170003',
    name: 'TRANSPORTAR MÁS PERSONAS DE LAS PERMITIDAS',
    description: 'Transportar más personas de las permitidas',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170004',
    name: 'CAMBIAR FRECUENTEMENTE DE CANAL DE FORMA IMPRUDENTE',
    description: 'Cambiar frecuentemente de canal o pasar al centro/izquierda/derecha de la vía de forma imprudente',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170005',
    name: 'LLEVAR CARGA PESADA SIN CONDICIONES ADECUADAS',
    description: 'Llevar carga pesada sin condiciones adecuadas',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170006',
    name: 'ESTACIONAR O CIRCULAR EN ZONAS PEATONALES',
    description: 'Estacionar o circular en zonas peatonales o contravías',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170007',
    name: 'NO USAR CASCOS O PROTECCIÓN CUANDO CORRESPONDE',
    description: 'No usar cascos o protección cuando corresponde',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'MOTORCYCLE',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // LEVES - Art. 171
  {
    code: 'ART171001',
    name: 'LICENCIA VENCIDA O NO PORTARLA',
    description: 'Licencia vencida, título profesional vencido o no portarlos cuando lo requieran',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },
  {
    code: 'ART171002',
    name: 'CERTIFICADO MÉDICO VENCIDO O NO PORTARLO',
    description: 'Certificado médico de salud vencido o no portarlo cuando lo exijan',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },
  {
    code: 'ART171003',
    name: 'OTRAS INFRACCIONES GENERALES DE CIRCULACIÓN',
    description: 'Otras infracciones generales de circulación de vehículos y peatones que no tengan una sanción específica expresamente establecida',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },

  // MUY GRAVES - Art. 173 y 174
  {
    code: 'ART173001',
    name: 'COMPETICIONES DE VELOCIDAD EN VÍAS PÚBLICAS',
    description: 'Para quienes realicen competiciones de velocidad ("piques") en vías públicas',
    article: 'ART. 173',
    severity: 'VERY_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 100,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART174001',
    name: 'EXCESO DE VELOCIDAD MUY GRAVE',
    description: 'Exceso de velocidad',
    article: 'ART. 174',
    severity: 'VERY_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 100,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // EXCESO DE CARGA - Art. 175
  {
    code: 'ART175001',
    name: 'EXCESO DE CARGA HASTA 10 TONELADAS',
    description: 'Exceso de carga hasta 10 toneladas (10 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175002',
    name: 'EXCESO DE CARGA DE MÁS DE 10 HASTA 20 TONELADAS',
    description: 'Exceso de carga de más de 10 hasta 20 toneladas (20 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 20,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175003',
    name: 'EXCESO DE CARGA DE MÁS DE 20 HASTA 30 TONELADAS',
    description: 'Exceso de carga de más de 20 hasta 30 toneladas (30 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 30,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175004',
    name: 'EXCESO DE CARGA DE MÁS DE 30 HASTA 40 TONELADAS',
    description: 'Exceso de carga de más de 30 hasta 40 toneladas (40 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 40,
    requiresPhoto: true,
    requiresEvidence: true
  }
];

// Datos de ejemplo para unidades tributarias
const taxUnitsData = [
  {
    name: 'UNIDAD TRIBUTARIA VIGENTE 2025',
    code: 'UT_2025',
    value: 60,
    currency: 'VES',
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2025-12-31'),
    active: true,
    description: 'Unidad tributaria vigente para el año 2025',
    source: 'GACETA OFICIAL',
    sourceNumber: 'GACETA_2025_001',
    sourceDate: new Date('2025-01-01'),
    applicableTo: ['ALL'],
    version: 1
  },
  {
    name: 'UNIDAD TRIBUTARIA INFRACCIONES LEVES',
    code: 'UT_LIGHT_2025',
    value: 30,
    currency: 'VES',
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2025-12-31'),
    active: true,
    description: 'Unidad tributaria reducida para infracciones leves',
    source: 'GACETA OFICIAL',
    sourceNumber: 'GACETA_2025_001',
    sourceDate: new Date('2025-01-01'),
    applicableTo: ['LIGHT'],
    version: 1
  },
  {
    name: 'UNIDAD TRIBUTARIA INFRACCIONES GRAVES',
    code: 'UT_SERIOUS_2025',
    value: 120,
    currency: 'VES',
    effectiveDate: new Date('2025-01-01'),
    expiryDate: new Date('2025-12-31'),
    active: true,
    description: 'Unidad tributaria aumentada para infracciones graves',
    source: 'GACETA OFICIAL',
    sourceNumber: 'GACETA_2025_001',
    sourceDate: new Date('2025-01-01'),
    applicableTo: ['SERIOUS', 'VERY_SERIOUS'],
    version: 1
  }
];

// Datos de ejemplo para plantillas de email
const emailTemplatesData = [
  {
    name: 'NOTIFICACIÓN DE MULTA',
    code: 'FINE_NOTIFICATION',
    tag: 'FINE_NOTIFICATION_HTML',
    category: 'FINE',
    description: 'Plantilla HTML completa para notificar multas a conductores',
    active: true,
    functionalConfig: {
      fields: [
        {
          name: 'fineId',
          description: 'Número de la multa',
          required: true,
          type: 'STRING'
        },
        {
          name: 'date',
          description: 'Fecha de la infracción',
          required: true,
          type: 'DATE'
        },
        {
          name: 'offense',
          description: 'Tipo de infracción',
          required: true,
          type: 'STRING'
        },
        {
          name: 'amount',
          description: 'Monto de la multa',
          required: true,
          type: 'STRING'
        },
        {
          name: 'officer',
          description: 'Nombre del oficial',
          required: true,
          type: 'STRING'
        }
      ],
      allowedTransports: ['EMAIL']
    },
    designConfig: {
      transports: {
        EMAIL: {
          subject: 'Notificación de Infracción de Tránsito',
          content: `Estimado/a conductor/a,

Se le informa que se ha generado una multa con el número {{fineId}} por la siguiente infracción:

- Fecha: {{date}}
- Infracción: {{offense}}
- Monto: {{amount}}
- Oficial: {{officer}}

Tiene 15 días hábiles para realizar el pago de la multa.

Para más información, puede contactar a la Policía Nacional Bolivariana.

Atentamente,
Policía Nacional Bolivariana`,
          htmlContent: `
            <!DOCTYPE html>
            <html lang="es">
              <head>
                <meta charset="UTF-8" />
                <title>Notificación de Infracción</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    background: #f9f9f9;
                  }
                  .card {
                    width: 370px;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fff;
                    overflow: hidden;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                    padding: 18px;
                    margin: 24px auto;
                  }
                  .header {
                    background: #004a9f;
                    color: #fff;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                  }
                  .header img {
                    width: 50px;
                    margin-right: 10px;
                  }
                  .header h2 {
                    font-size: 16px;
                    margin: 0;
                    font-weight: bold;
                  }
                  .header p {
                    margin: 0;
                    font-size: 14px;
                  }
                  .content-row table {
                    width: 100%;
                    border-collapse: separate;
                    table-layout: fixed;
                  }
                  .content-row td.label {
                    width: 35%;
                    text-align: left;
                    vertical-align: middle;
                    padding-right: 8px;
                    font-weight: bold;
                  }
                  .content-row td.value {
                    width: 65%;
                    text-align: right;
                    vertical-align: middle;
                    word-break: break-word;
                  }
                  .content-row tr {
                    height: 36px;
                  }
                  .multa-fecha {
                    margin-left: 0;
                    padding: 0;
                    margin-bottom: 0;
                  }
                  .multa-label {
                    font-size: 18px;
                    font-weight: bold;
                  }
                  .multa-value {
                    font-size: 18px;
                    font-weight: bold;
                    margin-left: 4px;
                  }
                  .fecha-value {
                    margin-left: 4px;
                  }
                  .footer {
                    display: block;
                    text-align: center;
                    padding: 10px 16px;
                    border-top: 1px solid #ddd;
                    margin-top: 18px;
                  }
                  .footer-btn {
                    background: #004a9f;
                    color: #fff;
                    border: none;
                    border-radius: 6px;
                    padding: 8px 18px;
                    font-size: 15px;
                    font-weight: bold;
                    text-decoration: none;
                    cursor: pointer;
                    transition: background 0.2s;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                    display: inline-block;
                  }
                  .footer-btn:hover {
                    background: #003370;
                  }
                </style>
              </head>
              <body>
                <div class="card">
                  <!-- Encabezado -->
                  <div class="header" style="margin: -18px; margin-bottom: 0; border-top-left-radius: 8px; border-top-right-radius: 8px">
                    <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB" />
                    <div>
                      <h2>POLICÍA NACIONAL BOLIVARIANA</h2>
                      <p>Notificación de Infracción de Tránsito</p>
                    </div>
                  </div>

                  <!-- Contenido -->
                  <div class="content">
                    <p class="multa-fecha"><span class="multa-label">Multa </span><span class="multa-value">{{fineId}}</span></p>
                    <p class="multa-fecha"><span class="label-fecha">Fecha: </span><span class="fecha-value">{{date}}</span></p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 32px 8px 0; width: 100%" />
                    <div class="content-row">
                      <table style="width: 100%; border-collapse: collapse">
                        <tr>
                          <td class="label">Infracción</td>
                          <td class="value" style="text-align: right">{{offense}}, Art. {{article}}</td>
                        </tr>
                        <tr>
                          <td class="label">Vehículo</td>
                          <td class="value" style="text-align: right">{{plate}} - {{model}} - {{color}}</td>
                        </tr>
                        <tr>
                          <td class="label">Monto</td>
                          <td class="value" style="text-align: right">{{amount}}</td>
                        </tr>
                        <tr>
                          <td class="label">Funcionario</td>
                          <td class="value" style="text-align: right">{{officer}}<br />C.I.: {{officerId}}</td>
                        </tr>
                        <tr>
                          <td class="label">Plazo de pago</td>
                          <td class="value" style="text-align: right">{{paymentDeadline}}</td>
                        </tr>
                        <tr>
                          <td class="label">Derecho a Reconsideración</td>
                          <td class="value" style="text-align: right">{{reconsiderationDeadline}}</td>
                        </tr>
                      </table>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div class="footer">
                      <a href="{{paymentGatewayUrl}}" class="footer-btn">REALIZAR PAGO</a>
                  </div>
                </div>
              </body>
            </html>
          `,
          active: true
        }
      }
    },
    emailConfig: {
      from: 'multas@pnb.gob.ve',
      replyTo: 'multas@pnb.gob.ve',
      priority: 'NORMAL'
    },
    availableVariables: [
      {
        name: 'fineId',
        description: 'Número de la multa',
        type: 'STRING',
        example: 'M-202501-0001'
      },
      {
        name: 'date',
        description: 'Fecha de la infracción',
        type: 'DATE',
        example: '29/09/2025'
      },
      {
        name: 'offense',
        description: 'Tipo de infracción',
        type: 'STRING',
        example: 'Conducir sin licencia'
      },
      {
        name: 'amount',
        description: 'Monto de la multa',
        type: 'STRING',
        example: 'Bs. 600,00'
      },
      {
        name: 'officer',
        description: 'Nombre del oficial',
        type: 'STRING',
        example: 'Juan Rodriguez'
      }
    ],
    sendConfig: {
      immediate: true,
      delay: 0,
      retryAttempts: 3,
      retryDelay: 5
    },
    layout: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Notificación de Infracción</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              background: #f9f9f9;
            }
            .card {
              width: 370px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #fff;
              overflow: hidden;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              padding: 18px;
              margin: 24px auto;
            }
            .header {
              background: #004a9f;
              color: #fff;
              padding: 12px 16px;
              display: flex;
              align-items: center;
            }
            .header img {
              width: 50px;
              margin-right: 10px;
            }
            .header h2 {
              font-size: 16px;
              margin: 0;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 14px;
            }
            .content-row table {
              width: 100%;
              border-collapse: separate;
              table-layout: fixed;
            }
            .content-row td.label {
              width: 35%;
              text-align: left;
              vertical-align: middle;
              padding-right: 8px;
              font-weight: bold;
            }
            .content-row td.value {
              width: 65%;
              text-align: right;
              vertical-align: middle;
              word-break: break-word;
            }
            .content-row tr {
              height: 36px;
            }
            .multa-fecha {
              margin-left: 0;
              padding: 0;
              margin-bottom: 0;
            }
            .multa-label {
              font-size: 18px;
              font-weight: bold;
            }
            .multa-value {
              font-size: 18px;
              font-weight: bold;
              margin-left: 4px;
            }
            .fecha-value {
              margin-left: 4px;
            }
            .footer {
              display: block;
              text-align: center;
              padding: 10px 16px;
              border-top: 1px solid #ddd;
              margin-top: 18px;
            }
            .footer-btn {
              background: #004a9f;
              color: #fff;
              border: none;
              border-radius: 6px;
              padding: 8px 18px;
              font-size: 15px;
              font-weight: bold;
              text-decoration: none;
              cursor: pointer;
              transition: background 0.2s;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08);
              display: inline-block;
            }
            .footer-btn:hover {
              background: #003370;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <!-- Encabezado -->
            <div class="header" style="margin: -18px; margin-bottom: 0; border-top-left-radius: 8px; border-top-right-radius: 8px">
              <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB" />
              <div>
                <h2>POLICÍA NACIONAL BOLIVARIANA</h2>
                <p>Notificación de Infracción de Tránsito</p>
              </div>
            </div>

            <!-- Contenido -->
            <div class="content">
              {{> partial}}
            </div>

            <!-- Footer -->
            <div class="footer">
                <a href="{{paymentGatewayUrl}}" class="footer-btn">REALIZAR PAGO</a>
            </div>
          </div>
        </body>
      </html>
    `,
    version: 1,
    usageCount: 0
  },
  {
    name: 'RECORDATORIO DE PAGO',
    code: 'PAYMENT_REMINDER',
    tag: 'PAYMENT_REMINDER_HTML',
    category: 'REMINDER',
    description: 'Plantilla para recordar el pago de multas',
    active: true,
    functionalConfig: {
      fields: [
        {
          name: 'fineId',
          description: 'Número de la multa',
          required: true,
          type: 'STRING'
        },
        {
          name: 'amount',
          description: 'Monto de la multa',
          required: true,
          type: 'STRING'
        },
        {
          name: 'paymentDeadline',
          description: 'Fecha límite de pago',
          required: true,
          type: 'DATE'
        }
      ],
      allowedTransports: ['EMAIL']
    },
    designConfig: {
      transports: {
        EMAIL: {
          subject: 'Recordatorio de Pago - Multa {{fineId}}',
          content: `Estimado/a conductor/a,

Este es un recordatorio de que tiene una multa pendiente de pago:

- Número de multa: {{fineId}}
- Monto: {{amount}}
- Fecha límite de pago: {{paymentDeadline}}

Por favor, realice el pago antes de la fecha límite para evitar recargos adicionales.

Atentamente,
Policía Nacional Bolivariana`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff9800;">Recordatorio de Pago</h2>
              <p>Estimado/a conductor/a,</p>
              <p>Este es un recordatorio de que tiene una multa pendiente de pago:</p>
              <ul>
                <li><strong>Número de multa:</strong> {{fineId}}</li>
                <li><strong>Monto:</strong> {{amount}}</li>
                <li><strong>Fecha límite de pago:</strong> {{paymentDeadline}}</li>
              </ul>
              <p style="color: #ff9800; font-weight: bold;">Por favor, realice el pago antes de la fecha límite para evitar recargos adicionales.</p>
              <hr>
              <p><em>Atentamente,<br>Policía Nacional Bolivariana</em></p>
            </div>
          `,
          active: true
        }
      }
    },
    emailConfig: {
      from: 'multas@pnb.gob.ve',
      replyTo: 'multas@pnb.gob.ve',
      priority: 'NORMAL'
    },
    availableVariables: [
      {
        name: 'fineId',
        description: 'Número de la multa',
        type: 'STRING',
        example: 'M-202501-0001'
      },
      {
        name: 'amount',
        description: 'Monto de la multa',
        type: 'STRING',
        example: 'Bs. 600,00'
      },
      {
        name: 'paymentDeadline',
        description: 'Fecha límite de pago',
        type: 'DATE',
        example: '15/10/2025'
      }
    ],
    sendConfig: {
      immediate: false,
      delay: 1440, // 24 horas
      retryAttempts: 2,
      retryDelay: 60
    },
    layout: `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Recordatorio de Pago</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              background: #f9f9f9;
            }
            .card {
              width: 370px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #fff;
              overflow: hidden;
              box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
              padding: 18px;
              margin: 24px auto;
            }
            .header {
              background: #ff9800;
              color: #fff;
              padding: 12px 16px;
              display: flex;
              align-items: center;
            }
            .header img {
              width: 50px;
              margin-right: 10px;
            }
            .header h2 {
              font-size: 16px;
              margin: 0;
              font-weight: bold;
            }
            .header p {
              margin: 0;
              font-size: 14px;
            }
            .content {
              padding: 20px 0;
            }
            .footer {
              display: block;
              text-align: center;
              padding: 10px 16px;
              border-top: 1px solid #ddd;
              margin-top: 18px;
            }
            .footer-btn {
              background: #ff9800;
              color: #fff;
              border: none;
              border-radius: 6px;
              padding: 8px 18px;
              font-size: 15px;
              font-weight: bold;
              text-decoration: none;
              cursor: pointer;
              transition: background 0.2s;
              box-shadow: 0 1px 3px rgba(0,0,0,0.08);
              display: inline-block;
            }
            .footer-btn:hover {
              background: #f57c00;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <!-- Encabezado -->
            <div class="header" style="margin: -18px; margin-bottom: 0; border-top-left-radius: 8px; border-top-right-radius: 8px">
              <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB" />
              <div>
                <h2>POLICÍA NACIONAL BOLIVARIANA</h2>
                <p>Recordatorio de Pago</p>
              </div>
            </div>

            <!-- Contenido -->
            <div class="content">
              {{> partial}}
            </div>

            <!-- Footer -->
            <div class="footer">
                <a href="{{paymentGatewayUrl}}" class="footer-btn">REALIZAR PAGO</a>
            </div>
          </div>
        </body>
      </html>
    `,
    version: 1,
    usageCount: 0
  }
];

// Datos de ejemplo para multas con estructura embebida
const sampleFinesData = [
  {
    fineNumber: 'M-202412-0001',
    infractionReference: 'M-202412-0001',
    infractionDate: new Date(),
    infractionTime: '14:30',
    location: {
      address: 'Av. Principal, Caracas',
      coordinates: { latitude: 10.4806, longitude: -66.9036 }
    },
    driver: {
      firstName: 'Carlos Alberto',
      lastName: 'Martínez',
      idDocumentType: 'V',
      documentNumber: '12345678',
      licenseGrade: '3',
      license: '123456789',
      address: 'Av. Principal, Caracas',
      email: 'cmartinez@email.com',
      phone: '04121234567'
    },
    owner: {
      firstName: 'Carlos Alberto',
      lastName: 'Martínez',
      idDocumentType: 'V',
      documentNumber: '12345678',
      licenseGrade: '3',
      license: '123456789',
      address: 'Av. Principal, Caracas',
      email: 'cmartinez@email.com'
    },
    vehicle: {
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: '2018',
      color: 'Blanco',
      type: 'Carro'
    },
    evidence: [
      {
        type: 'PHOTO',
        url: 'evidencia1.jpg',
        description: 'Foto del vehículo sin licencia'
      }
    ],
    infractionAmount: 600,
    infractionUT: 10,
    isOtherOwner: false,
    notes: 'Conducir sin licencia en zona escolar'
  },
  {
    fineNumber: 'M-202412-0002',
    infractionReference: 'M-202412-0002',
    infractionDate: new Date(),
    infractionTime: '16:45',
    location: {
      address: 'Calle 5, Valencia',
      coordinates: { latitude: 10.1621, longitude: -68.0077 }
    },
    driver: {
      firstName: 'Ana María',
      lastName: 'López',
      idDocumentType: 'V',
      documentNumber: '87654321',
      licenseGrade: '2',
      license: '987654321',
      address: 'Calle 5, Valencia',
      email: 'alopez@email.com',
      phone: '04129876543'
    },
    owner: {
      firstName: 'Ana María',
      lastName: 'López',
      idDocumentType: 'V',
      documentNumber: '87654321',
      licenseGrade: '2',
      license: '987654321',
      address: 'Calle 5, Valencia',
      email: 'alopez@email.com'
    },
    vehicle: {
      plate: 'XYZ-7890',
      brand: 'Honda',
      model: 'Civic',
      year: '2020',
      color: 'Azul',
      type: 'Carro'
    },
    evidence: [
      {
        type: 'PHOTO',
        url: 'evidencia2.jpg',
        description: 'Foto del semáforo en rojo'
      }
    ],
    infractionAmount: 600,
    infractionUT: 10,
    isOtherOwner: false,
    notes: 'Desobedecer semáforo en rojo'
  }
];

// Función para poblar la base de datos
async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pnb_multas');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Police.deleteMany({});
    await Infraction.deleteMany({});
    await Fine.deleteMany({});
    await TaxUnit.deleteMany({});
    await EmailTemplate.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // Encriptar contraseñas de los policías
    const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const policeDataWithHashedPasswords = await Promise.all(
      policeData.map(async (police) => {
        const hashedPassword = await bcrypt.hash(police.password, SALT_ROUNDS);
        return {
          ...police,
          password: hashedPassword
        };
      })
    );

    // Crear policías
    const createdPolice = await Police.insertMany(policeDataWithHashedPasswords);
    console.log(`✅ ${createdPolice.length} policías creados`);

    // Crear infracciones
    const createdInfractions = await Infraction.insertMany(
      infractionsData.map(infraction => ({
        ...infraction,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdInfractions.length} infracciones creadas`);

    // Crear unidades tributarias
    const createdTaxUnits = await TaxUnit.insertMany(
      taxUnitsData.map(taxUnit => ({
        ...taxUnit,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdTaxUnits.length} unidades tributarias creadas`);

    // Crear plantillas de email
    const createdEmailTemplates = await EmailTemplate.insertMany(
      emailTemplatesData.map(template => ({
        ...template,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdEmailTemplates.length} plantillas de email creadas`);

    // Crear multas de ejemplo con estructura embebida
    const finesWithReferences = sampleFinesData.map((fine, index) => ({
      ...fine,
      infraction: createdInfractions[index % createdInfractions.length]._id,
      officer: createdPolice[index % createdPolice.length]._id,
      fineStatus: 'DRAFT',
      createdBy: createdPolice[0]._id
    }));

    const createdFines = await Fine.insertMany(finesWithReferences);
    console.log(`✅ ${createdFines.length} multas creadas`);

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Admin: jrodriguez / 123456');
    console.log('👤 Supervisor: mgonzalez / 123456');
    console.log('👤 Oficial: pperez / 123456');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
