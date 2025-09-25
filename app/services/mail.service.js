'use strict';

const { CmmErrorClass, CmmSendMailSV } = require('../utils');
const { MailerSend } = require('mailersend');
const Handlebars = require('handlebars');

module.exports = {
  /**
   * @function      :sendFineMailSV
   * @version       :1.0.0
   * @description   :Envía un correo con la notificación de multa.
   * @param {Array} _emails - Array de correos a enviar.
   * @param {Object} _data - Data para el correo.
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendFineMailSV(_emails, _data) {
    try {
      // Validaciones
      if (!_emails)
        throw new CmmErrorClass(
          __filename,
          'SMAILE002',
          'Error, parámetro "_emails"'
        ).server();
      if (!_data)
        throw new CmmErrorClass(
          __filename,
          'SMAILE003',
          'Error, parámetro "_data"'
        ).server();

      // Plantillas HTML (compartidas entre producción y desarrollo)
      const LAYOUT_TEMPLATE = `
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

      const PARTIAL_TEMPLATE = `
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

      // Usar MailerSend API en producción, Gmail SMTP en desarrollo
      if (process.env.NODE_ENV === 'production') {
        console.log('[MAIL SERVICE] Usando MailerSend API para producción...');
        
        // Validar que la API key esté configurada
        const MAILERSEND_API_KEY = process.env.MAILERSEND_API_KEY;
        if (!MAILERSEND_API_KEY) {
          throw new CmmErrorClass(
            __filename,
            'SMAILE010',
            'MAILERSEND_API_KEY no está configurada en las variables de entorno'
          ).server();
        }
        
        // Configurar MailerSend API
        const mailerSend = new MailerSend({
          apiKey: MAILERSEND_API_KEY,
        });

        // Generar HTML del correo
        const HTML_BODY = await module.exports._generateHtmlSV(
          LAYOUT_TEMPLATE,
          PARTIAL_TEMPLATE,
          _data
        );

        // Configurar el mensaje usando MailerSend API
        const sentFrom = {
          email: 'MS_airQux@test-3m5jgrokmkdgdpyo.mlsender.net',
          name: 'Policía Nacional Bolivariana'
        };

        const recipients = _emails.map(email => ({
          email: email
        }));

        const emailParams = {
          from: sentFrom,
          to: recipients,
          subject: 'Notificación de Infracción de Tránsito',
          html: HTML_BODY,
          text: 'Notificación de Infracción de Tránsito - Consulte el contenido HTML para más detalles.'
        };

        // Enviar correo usando MailerSend API
        const response = await mailerSend.email.send(emailParams).catch((_error) => {
          console.error('[MAILERSEND API] ❌ Error enviando correo:', _error);
          
          // Manejo específico de errores de autenticación
          if (_error.response && _error.response.status === 401) {
            throw new CmmErrorClass(
              __filename,
              'SMAILE011',
              'Error de autenticación con MailerSend API. Verifique que la API key sea válida y tenga los permisos correctos.'
            ).server();
          }
          
          // Manejo de otros errores de API
          if (_error.response) {
            const { status, data } = _error.response;
            throw new CmmErrorClass(
              __filename,
              'SMAILE012',
              `Error de MailerSend API: ${status} - ${data?.message || 'Error desconocido'}`
            ).server();
          }
          
          // Error general
          throw new CmmErrorClass(
            __filename,
            'SMAILE013',
            `Error al enviar correo: ${_error.message}`
          ).server();
        });
        
        console.log('[MAILERSEND API] ✅ Correo enviado exitosamente:', {
          messageId: response.headers['x-message-id'],
          statusCode: response.status
        });

        return {
          success: true,
          emails: _emails,
          messageId: response.headers['x-message-id'],
          statusCode: response.status,
          data: response.data
        };
      }

      // Configuración SMTP para desarrollo
      const CREDENTIALS = {
        credentials: {
          // Gmail para desarrollo
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          username: 'chinchinqa@gmail.com',
          password: 'vuwcorcheflndmyj'
        },
        subject: 'Notificación de Infracción de Tránsito',
        LAYOUT: LAYOUT_TEMPLATE,
        PARTIAL: PARTIAL_TEMPLATE
      };

      const BODY = await module.exports._generateHtmlSV(
        CREDENTIALS.LAYOUT,
        CREDENTIALS.PARTIAL,
        _data
      );
      console.log('[MAIL SERVICE] Usando Gmail SMTP para desarrollo...');
      return await CmmSendMailSV(
        _emails,
        CREDENTIALS.subject,
        BODY,
        CREDENTIALS.credentials
      ).catch(_error => {
        throw new CmmErrorClass(__filename, 'SMAILE004', _error).server();
      });
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'SMAILE005', _error).server()
        : _error;
    }
  },

  /**
   * @private
   * @version        :1.0.0
   * @description    :metodo para generar el html a base de un layout y un partial con sus datos
   * @param {String} _layout - string de layout
   * @param {String} _partial - string de partial
   * @param {Object} _data - data a copilar
   * @returns {String} - html generado
   */
  async _generateHtmlSV(_layout, _partial, _data = {}) {
    try {
      if (!_layout)
        throw new CmmErrorClass(
          __filename,
          'SMAILE006',
          'Error, parámetro "_layout"'
        ).server();
      if (!_partial)
        throw new CmmErrorClass(
          __filename,
          'SMAILE007',
          'Error, parámetro "_partial"'
        ).server();
      if (!_data)
        throw new CmmErrorClass(
          __filename,
          'SMAILE008',
          'Error, parámetro "_data"'
        ).server();
      const LAYOUT = Handlebars.compile(_layout);
      const PARTIAL = Handlebars.compile(_partial);

      Handlebars.registerPartial('partial', PARTIAL);
      return LAYOUT(_data);
    } catch (_error) {
      throw new CmmErrorClass(__filename, 'SMAILE009', _error).server();
    }
  }
};