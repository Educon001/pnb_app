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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
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
      padding: 20px;
      font-size: 14px;
      color: #333;
    }

    .content p {
      margin: 6px 0;
    }

    .t-multa {
      font-weight: bold;
      font-size: 20px;
      text-transform: capitalize;
    }
  </style>

          
        </head>
       <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f9f9f9;">
        
                {{> partial}}
        
        </body>
        </html>
        `,
      PARTIAL: `
             <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9f9f9;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table width="400" border="0" cellspacing="0" cellpadding="0"
          style="width: 400px; border: 1px solid #ddd; border-radius: 8px; background-color: #fff; overflow: hidden;">

          <tr>
            <td style="background-color: #004a9f; color: #fff; padding: 12px 16px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="60" valign="middle">
                    <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB"
                      width="50" style="width: 50px; display: block;">
                  </td>
                  <td valign="middle">
                    <h2
                      style="font-size: 16px; margin: 0; font-weight: bold; color: #fff; font-family: Arial, sans-serif;">
                      POLICÍA NACIONAL BOLIVARIANA</h2>
                    <p style="margin: 0; font-size: 12px; color: #fff; font-family: Arial, sans-serif;">Notificación de
                      Infracción de Tránsito</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px; font-size: 14px; color: #333; font-family: Arial, sans-serif;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="font-family: Arial, sans-serif;">
                    <span style="font-weight: bold; font-size: 20px; text-transform: capitalize;">Multa:
                      {{fineId}}</span>
                  </td>
                 
                </tr>
                <tr>
                   <td align="" style="font-family: Arial, sans-serif;">
                    <span>Fecha: {{date}}</span>
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 15px 0;">
                <tr>
                  <td height="1" style="height: 1px; background-color: #ddd; line-height: 1px; font-size: 1px;">&nbsp;
                  </td>
                </tr>
              </table>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; color: #333;">
                <tr>
                  <td width="180" valign="top"
                    style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">Infracción:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">{{offense}}, Art.
                    {{article}}</td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">
                    Vehículo:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">{{plate}} - {{model}} -
                    {{color}}</td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">
                    Monto:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">{{amount}}</td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">
                    Funcionario:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">{{officer}}<br>C.I.:
                    {{officerId}}</td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">
                    Plazo de pago:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">{{paymentDeadline}}
                  </td>
                </tr>
                <tr>
                  <td valign="top" style="padding-bottom: 10px; font-weight: bold; font-family: Arial, sans-serif;">
                    Derecho a Reconsideración:</td>
                  <td valign="top" style="padding-bottom: 10px; font-family: Arial, sans-serif;">
                    {{reconsiderationDeadline}}</td>
                </tr>
              </table>

            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
        `,
    };
    try {
      if (!CREDENTIALS) throw new CmmErrorClass(__filename, 'SMAILE001', 'Error, parámetro "_req"').server();
      if (!_emails) throw new CmmErrorClass(__filename, 'SMAILE002', 'Error, parámetro "_emails"').server();
      if (!_data) throw new CmmErrorClass(__filename, 'SMAILE003', 'Error, parámetro "_data"').server();

      const BODY = await module.exports._generateHtmlSV(CREDENTIALS.LAYOUT, CREDENTIALS.PARTIAL, _data);
      console.log(BODY);
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
