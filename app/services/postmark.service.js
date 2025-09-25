'use strict';

const { ServerClient } = require('postmark');
const { CmmErrorClass } = require('../utils');

module.exports = {
  /**
   * @function      :sendEmailSV
   * @version       :1.0.0
   * @description   :Envía un email usando Postmark API
   * @param {String} _to - Email del destinatario
   * @param {String} _subject - Asunto del email
   * @param {String} _htmlBody - Contenido HTML del email
   * @param {String} _textBody - Contenido texto del email (opcional)
   * @param {String} _from - Email del remitente (opcional)
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendEmailSV(_to, _subject, _htmlBody, _textBody = null, _from = null) {
    try {
      // Validaciones
      if (!_to) {
        throw new CmmErrorClass(__filename, 'SPOSTE001', 'Email destinatario es requerido').server();
      }
      if (!_subject) {
        throw new CmmErrorClass(__filename, 'SPOSTE002', 'Asunto es requerido').server();
      }
      if (!_htmlBody) {
        throw new CmmErrorClass(__filename, 'SPOSTE003', 'Contenido HTML es requerido').server();
      }

      // Configuración Postmark
      const POSTMARK_CLIENT = new ServerClient('bf81c8f1-eadd-40e1-8ed6-c5194b209cf9');
      
      // Email del remitente por defecto
      const FROM_EMAIL = _from || 'noreply@pnb-multas.com';

      // Configuración del email
      const EMAIL_CONFIG = {
        From: FROM_EMAIL,
        To: _to,
        Subject: _subject,
        HtmlBody: _htmlBody,
        MessageStream: 'outbound'
      };

      // Agregar texto plano si se proporciona
      if (_textBody) {
        EMAIL_CONFIG.TextBody = _textBody;
      }

      // Enviar email
      const RESULT = await POSTMARK_CLIENT.sendEmail(EMAIL_CONFIG).catch((_error) => {
        throw new CmmErrorClass(__filename, 'SPOSTE004', _error).api();
      });

      console.log('[POSTMARK SERVICE] Email enviado exitosamente:', RESULT.MessageID);
      
      return {
        success: true,
        messageId: RESULT.MessageID,
        to: RESULT.To,
        submittedAt: RESULT.SubmittedAt,
        message: 'Email enviado exitosamente'
      };

    } catch (_error) {
      throw !_error.errorType 
        ? new CmmErrorClass(__filename, 'SPOSTE005', _error).server() 
        : _error;
    }
  },

  /**
   * @function      :sendBulkEmailSV
   * @version       :1.0.0
   * @description   :Envía emails en lote usando Postmark API
   * @param {Array} _emails - Array de objetos email
   * @returns {Promise<Object>} - Resultado del envío en lote
   */
  async sendBulkEmailSV(_emails) {
    try {
      // Validaciones
      if (!_emails || !Array.isArray(_emails)) {
        throw new CmmErrorClass(__filename, 'SPOSTE006', 'Array de emails es requerido').server();
      }
      if (_emails.length === 0) {
        throw new CmmErrorClass(__filename, 'SPOSTE007', 'Array de emails no puede estar vacío').server();
      }

      // Configuración Postmark
      const POSTMARK_CLIENT = new ServerClient('bf81c8f1-eadd-40e1-8ed6-c5194b209cf9');

      // Preparar emails para envío en lote
      const EMAILS_TO_SEND = _emails.map((_email) => {
        if (!_email.to || !_email.subject || !_email.htmlBody) {
          throw new CmmErrorClass(__filename, 'SPOSTE008', 'Cada email debe tener to, subject y htmlBody').server();
        }

        return {
          From: _email.from || 'noreply@pnb-multas.com',
          To: _email.to,
          Subject: _email.subject,
          HtmlBody: _email.htmlBody,
          TextBody: _email.textBody || null,
          MessageStream: 'outbound'
        };
      });

      // Enviar emails en lote
      const RESULT = await POSTMARK_CLIENT.sendEmailBatch(EMAILS_TO_SEND).catch((_error) => {
        throw new CmmErrorClass(__filename, 'SPOSTE009', _error).api();
      });

      console.log('[POSTMARK SERVICE] Emails en lote enviados:', RESULT.length);
      
      return {
        success: true,
        totalSent: RESULT.length,
        results: RESULT.map((_result) => ({
          messageId: _result.MessageID,
          to: _result.To,
          submittedAt: _result.SubmittedAt,
          errorCode: _result.ErrorCode,
          message: _result.Message
        })),
        message: `${RESULT.length} emails enviados exitosamente`
      };

    } catch (_error) {
      throw !_error.errorType 
        ? new CmmErrorClass(__filename, 'SPOSTE010', _error).server() 
        : _error;
    }
  },

  /**
   * @function      :sendFineNotificationSV
   * @version       :1.0.0
   * @description   :Envía notificación de multa usando Postmark
   * @param {Array} _emails - Array de emails destinatarios
   * @param {Object} _data - Datos de la multa
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendFineNotificationSV(_emails, _data) {
    try {
      // Validaciones
      if (!_emails || !Array.isArray(_emails)) {
        throw new CmmErrorClass(__filename, 'SPOSTE011', 'Array de emails es requerido').server();
      }
      if (!_data) {
        throw new CmmErrorClass(__filename, 'SPOSTE012', 'Datos de la multa son requeridos').server();
      }

      // Plantilla HTML para la notificación de multa
      const HTML_TEMPLATE = `
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
                margin: -18px -18px 18px -18px;
                border-top-left-radius: 8px;
                border-top-right-radius: 8px;
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
              <div class="header">
                <img src="https://www.cpnb.com.ve/_next/static/media/PNBLOGOV2.248d6ec8.png" alt="Escudo PNB" />
                <div>
                  <h2>POLICÍA NACIONAL BOLIVARIANA</h2>
                  <p>Notificación de Infracción de Tránsito</p>
                </div>
              </div>

              <!-- Contenido -->
              <div class="content">
                <p class="multa-fecha">
                  <span class="multa-label">Multa </span>
                  <span class="multa-value">${_data.fineId || 'N/A'}</span>
                </p>
                <p class="multa-fecha">
                  <span class="label-fecha">Fecha: </span>
                  <span class="fecha-value">${_data.date || 'N/A'}</span>
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 32px 8px 0; width: 100%" />
                <div class="content-row">
                  <table style="width: 100%; border-collapse: collapse">
                    <tr>
                      <td class="label">Infracción</td>
                      <td class="value" style="text-align: right">${_data.offense || 'N/A'}, Art. ${_data.article || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Vehículo</td>
                      <td class="value" style="text-align: right">${_data.plate || 'N/A'} - ${_data.model || 'N/A'} - ${_data.color || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Monto</td>
                      <td class="value" style="text-align: right">${_data.amount || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Funcionario</td>
                      <td class="value" style="text-align: right">${_data.officer || 'N/A'}<br />C.I.: ${_data.officerId || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Plazo de pago</td>
                      <td class="value" style="text-align: right">${_data.paymentDeadline || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td class="label">Derecho a Reconsideración</td>
                      <td class="value" style="text-align: right">${_data.reconsiderationDeadline || 'N/A'}</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <a href="${_data.paymentGatewayUrl || '#'}" class="footer-btn">REALIZAR PAGO</a>
              </div>
            </div>
          </body>
        </html>
      `;

      // Configuración Postmark
      const POSTMARK_CLIENT = new ServerClient('bf81c8f1-eadd-40e1-8ed6-c5194b209cf9');

      // Preparar emails para envío
      const EMAILS_TO_SEND = _emails.map((_email) => ({
        From: 'noreply@pnb-multas.com',
        To: _email,
        Subject: 'Notificación de Infracción de Tránsito - PNB',
        HtmlBody: HTML_TEMPLATE,
        MessageStream: 'outbound'
      }));

      // Enviar emails
      const RESULT = await POSTMARK_CLIENT.sendEmailBatch(EMAILS_TO_SEND).catch((_error) => {
        throw new CmmErrorClass(__filename, 'SPOSTE013', _error).api();
      });

      console.log('[POSTMARK SERVICE] Notificaciones de multa enviadas:', RESULT.length);
      
      return {
        success: true,
        totalSent: RESULT.length,
        results: RESULT.map((_result) => ({
          messageId: _result.MessageID,
          to: _result.To,
          submittedAt: _result.SubmittedAt,
          errorCode: _result.ErrorCode,
          message: _result.Message
        })),
        message: `${RESULT.length} notificaciones de multa enviadas exitosamente`
      };

    } catch (_error) {
      throw !_error.errorType 
        ? new CmmErrorClass(__filename, 'SPOSTE014', _error).server() 
        : _error;
    }
  },

  /**
   * @function      :getDeliveryStatusSV
   * @version       :1.0.0
   * @description   :Obtiene el estado de entrega de un email
   * @param {String} _messageId - ID del mensaje
   * @returns {Promise<Object>} - Estado de entrega
   */
  async getDeliveryStatusSV(_messageId) {
    try {
      if (!_messageId) {
        throw new CmmErrorClass(__filename, 'SPOSTE015', 'ID del mensaje es requerido').server();
      }

      const POSTMARK_CLIENT = new ServerClient('bf81c8f1-eadd-40e1-8ed6-c5194b209cf9');

      const RESULT = await POSTMARK_CLIENT.getOutboundMessageDetails(_messageId).catch((_error) => {
        throw new CmmErrorClass(__filename, 'SPOSTE016', _error).api();
      });

      return {
        messageId: RESULT.MessageID,
        to: RESULT.To,
        status: RESULT.Status,
        submittedAt: RESULT.SubmittedAt,
        deliveredAt: RESULT.DeliveredAt,
        bouncedAt: RESULT.BouncedAt,
        openedAt: RESULT.OpenedAt,
        clickedAt: RESULT.ClickedAt
      };

    } catch (_error) {
      throw !_error.errorType 
        ? new CmmErrorClass(__filename, 'SPOSTE017', _error).server() 
        : _error;
    }
  }
};
