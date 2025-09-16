'use strict';

const { CmmErrorClass, CmmSendMailSV } = require('../utils');
const Handlebars = require('handlebars');

module.exports = {
  /**
   * @function      :sendFineMailSV
   * @version       :1.0.0
   * @description   :Envía un correo con la notificación de multa.
   * @param {Object} _req - Request object
   * @param {Array} _emails - Array de correos a enviar.
   * @param {Object} _data - Data para el correo.
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendFineMailSV(_emails, _data) {
    const CREDENTIALS = {
      credentials: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        username: 'chinchinqa@gmail.com',
        password: 'vuwcorcheflndmyj'
      },
      subject: 'Notificación de Infracción de Tránsito',
      LAYOUT: `
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
              .content-row {
                /* No flex layout, spacing reduced */
              }
              .content-row p {
                /* Removed flex styles, not used for table */
                margin-bottom: 0;
              }
              .label {
                font-weight: bold;
                text-align: left;
                /* Remove display: inline-block */
              }
              .value {
                text-align: right;
                /* Remove display: inline-block and flex */
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
              .label {
                font-weight: bold;
              }
              .label-fecha {
                font-weight: normal;
                display: inline-block;
              }
              .value {
                text-align: right;
              }
              .content-row p {
                width: 100%;
              }
              .multa-fecha {
                margin-left: 0;
                padding: 0;
                margin-bottom: 0;
              }
              .multa-fecha + .multa-fecha {
                margin-top: 0;
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
              .pdf {
                display: flex;
                align-items: center;
                color: #c00;
                font-size: 14px;
                font-weight: bold;
              }
              .pdf span {
                border: 1px solid #c00;
                border-radius: 6px;
                padding: 4px 6px;
                margin-left: 6px;
              }
              .content-row td.label,
              .content-row td.value {
                vertical-align: middle;
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
      PARTIAL: `
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
      `
    };
    try {
      if (!CREDENTIALS)
        throw new CmmErrorClass(
          __filename,
          'SMAILE001',
          'Error, parámetro "_req"'
        ).server();
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

      const BODY = await module.exports._generateHtmlSV(
        CREDENTIALS.LAYOUT,
        CREDENTIALS.PARTIAL,
        _data
      );
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
