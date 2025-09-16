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
  async sendFineMailSV( _emails, _data) {
    const CREDENTIALS = {
      credentials: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        username: 'chinchinqa@gmail.com',
        password: 'vuwcorcheflndmyj',
      },
      subject: 'Notificación de Infracción',
      LAYOUT: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
        <meta charset="UTF-8">
        <title>Notificación de Infracción</title>
        <style>
            body {
            font-family: Arial, sans-serif;
            margin: 0;
            background: #f9f9f9;
            }
            .card {
            width: 400px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background: #fff;
            overflow: hidden;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
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
            font-size: 12px;
            }
            .content {
            padding: 16px;
            font-size: 14px;
            color: #333;
            }
            .content p {
            margin: 6px 0;
            }
            .label {
            font-weight: bold;
            }
            .footer {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            padding: 10px 16px;
            border-top: 1px solid #ddd;
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
        </style>
        </head>
        <body>
        <div class="card">
            <!-- Encabezado -->
            <div class="header">
            <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB">
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
            <!-- <div class="pdf">
                PDF <span>📄</span>
            </div> -->
            </div>
        </div>
        </body>
        </html>
        `,
      PARTIAL: `
            <p><span class="label">Multa:</span> {{fineId}}</p>
            <p><span class="label">Fecha:</span> {{date}}</p>
            <br>
            <p><span class="label">Infracción:</span> {{offense}}, Art. {{article}}</p>
            <p><span class="label">Vehículo:</span> {{plate}} - {{model}} - {{color}}</p>
            <p><span class="label">Monto:</span> {{amount}}</p>
            <p><span class="label">Funcionario:</span> {{officer}}<br>
            C.I.: {{officerId}}</p>
            <br>
            <p><span class="label">Plazo de pago:</span> {{paymentDeadline}}</p>
            <p><span class="label">Derecho a Reconsideración:</span> {{reconsiderationDeadline}}</p>
        `,
    };
    try {
      if (!CREDENTIALS) throw new CmmErrorClass(__filename, 'SMAILE001', 'Error, parámetro "_req"').server();
      if (!_emails) throw new CmmErrorClass(__filename, 'SMAILE002', 'Error, parámetro "_emails"').server();
      if (!_data) throw new CmmErrorClass(__filename, 'SMAILE003', 'Error, parámetro "_data"').server();

      const BODY = await module.exports._generateHtmlSV(CREDENTIALS.LAYOUT, CREDENTIALS.PARTIAL, _data);
      
      return await CmmSendMailSV(_emails, CREDENTIALS.subject, BODY, CREDENTIALS.credentials).catch((_error) => {
        throw new CmmErrorClass(__filename, 'SMAILE004', _error).server();
      });
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'SMAILE005', _error).server() : _error;
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
 async  _generateHtmlSV(_layout, _partial, _data = {}) {
    try {
      if (!_layout) throw new CmmErrorClass(__filename, 'SMAILE006', 'Error, parámetro "_layout"').server();
      if (!_partial) throw new CmmErrorClass(__filename, 'SMAILE007', 'Error, parámetro "_partial"').server();
      if (!_data) throw new CmmErrorClass(__filename, 'SMAILE008', 'Error, parámetro "_data"').server();
      const LAYOUT = Handlebars.compile(_layout);
      const PARTIAL = Handlebars.compile(_partial);

      Handlebars.registerPartial('partial', PARTIAL);
      return LAYOUT(_data);
    } catch (_error) {
      throw new CmmErrorClass(__filename, 'SMAILE009', _error).server();
    }
  },
};
