'use strict';

const { CmmErrorClass } = require('../utils');
const sgMail = require('@sendgrid/mail');
const Handlebars = require('handlebars');

// Configurar API Key de SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  /**
   * @function      :sendFineMailSV
   * @version       :1.0.0
   * @description   :Envía un correo con la notificación de multa usando SendGrid API.
   * @param {Array} _emails - Array de correos a enviar.
   * @param {Object} _data - Data para el correo.
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendFineMailSV(_emails, _data) {
    try {
      if (!_emails) {
        throw new CmmErrorClass(__filename, 'SENDGRID001', 'Error, parámetro "_emails" es requerido').server();
      }
      if (!_data) {
        throw new CmmErrorClass(__filename, 'SENDGRID002', 'Error, parámetro "_data" es requerido').server();
      }

      // Generar HTML del correo
      const HTML_BODY = await module.exports._generateHtmlSV(_data);

      // Configurar el mensaje
      const MSG = {
        to: _emails,
        from: {
          email: 'soycarlosluis862@gmail.com', // Email verificado en SendGrid
          name: 'Policía Nacional Bolivariana'
        },
        subject: 'Notificación de Infracción de Tránsito',
        html: HTML_BODY,
        // Configuración adicional para tracking
        trackingSettings: {
          clickTracking: {
            enable: true,
            enableText: false
          },
          openTracking: {
            enable: true
          }
        }
      };

      console.log('[SENDGRID API] Iniciando envío de correo:', {
        emails: _emails,
        subject: MSG.subject,
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
      });

      // Enviar correo usando SendGrid API
      const RESPONSE = await sgMail.send(MSG);
      
      console.log('[SENDGRID API] ✅ Correo enviado exitosamente:', {
        statusCode: RESPONSE[0].statusCode,
        messageId: RESPONSE[0].headers['x-message-id']
      });

      return {
        success: true,
        emails: _emails,
        messageId: RESPONSE[0].headers['x-message-id'],
        statusCode: RESPONSE[0].statusCode,
        data: RESPONSE[0]
      };

    } catch (_error) {
      console.error('[SENDGRID API] ❌ Error enviando correo:', _error);
      
      // Manejo específico de errores de SendGrid
      let errorMessage = 'Error al enviar correo con SendGrid';
      let errorCode = 'SENDGRID003';
      
      if (_error.response) {
        const { statusCode, body } = _error.response;
        errorMessage = `SendGrid API Error: ${statusCode} - ${body?.errors?.[0]?.message || 'Error desconocido'}`;
        errorCode = 'SENDGRID004';
      }
      
      throw new CmmErrorClass(__filename, errorCode, {
        originalError: _error,
        message: errorMessage,
        response: _error.response
      }).server();
    }
  },

  /**
   * @private
   * @version        :1.0.0
   * @description    :Genera el HTML del correo usando Handlebars
   * @param {Object} _data - data a compilar
   * @returns {String} - html generado
   */
  async _generateHtmlSV(_data = {}) {
    try {
      if (!_data) {
        throw new CmmErrorClass(__filename, 'SENDGRID005', 'Error, parámetro "_data" es requerido').server();
      }

      const LAYOUT = `
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
      `;

      const PARTIAL = `
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
      `;

      const LAYOUT_COMPILED = Handlebars.compile(LAYOUT);
      const PARTIAL_COMPILED = Handlebars.compile(PARTIAL);

      Handlebars.registerPartial('partial', PARTIAL_COMPILED);
      return LAYOUT_COMPILED(_data);

    } catch (_error) {
      throw new CmmErrorClass(__filename, 'SENDGRID006', _error).server();
    }
  }
};
