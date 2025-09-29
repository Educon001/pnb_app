'use strict';

const { CmmErrorClass } = require('./CmmErrorClass');
const { createTransport } = require('nodemailer');

/**
 * @module      :EXT_API_MAIL
 * @version     :1.0.0
 * @description :Módulo para el manejo del envío de correos internos.
 */
module.exports = {

  /**
   * @function      :_getTransportNotifyEmailService
   * @version       :2.0.0
   * @description   :Crea el transporter de nodemailer sin plantillas.
   * @returns {Promise<Object>} - Transporter
   */
  _getTransportNotifyEmailService: async (_credentials) => {
    try {
      if (!_credentials) throw new CmmErrorClass(__filename, 'CPNB-USMAIL030', 'Error, parámetro "_credentials" es requerido').server();
      if (!_credentials.host) throw new CmmErrorClass(__filename, 'CPNB-USMAIL031', 'Error, campo de credencial "HOST" es requerido y no puede ser vacío').server();
      if (!_credentials.port) throw new CmmErrorClass(__filename, 'CPNB-USMAIL031', 'Error, campo de credencial "PORT" es requerido y no puede ser vacío').server();
      if (_credentials.secure === undefined || _credentials.secure === null || _credentials.secure === '') throw new CmmErrorClass(__filename, 'CPNB-USMAIL031', 'Error, campo de credencial "SECURE" es requerido y no puede ser vacío').server();
      if (!_credentials.username) throw new CmmErrorClass(__filename, 'CPNB-USMAIL031', 'Error, campo de credencial "USERNAME" es requerido y no puede ser vacío').server();
      if (!_credentials.password) throw new CmmErrorClass(__filename, 'CPNB-USMAIL031', 'Error, campo de credencial "PASSWORD" es requerido y no puede ser vacío').server();
      
      // Creamos el transporter con configuración de timeout y reintentos
      const TRANSPORTER = createTransport({
        host: _credentials.host,
        port: _credentials.port,
        secure: _credentials.secure === true || _credentials.secure === 'true',
        auth: {
          user: _credentials.username,
          pass: _credentials.password,
        },
      });
      // Retornamos el transporter
      return TRANSPORTER;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-USMAIL009', _error).server() : _error;
    }
  },

  

  /**
   * @function      :CmmSendMailSV
   * @version       :3.1.0
   * @description   :Envía un correo con HTML directo (con o sin attachments) con sistema de reintentos.
   * @param {Array} _emails - Array de correos a enviar.
   * @param {String} _subject - Asunto del correo.
   * @param {String} _html - Contenido HTML del correo.
   * @param {Object} _credentials - Credenciales de email
   * @param {Array} _attachments - Archivos adjuntos (opcional).
   * @returns {Promise<Object>} - Resultado del envío
   */
  CmmSendMailSV: async (_emails, _subject, _html, _credentials, _attachments = null) => {
    try {
      // Verificamos si los parámetros son requeridos
      if (!_emails) throw new CmmErrorClass(__filename, 'CPNB-USMAIL013', 'Error, parámetro "_emails"').server();
      if (!_html) throw new CmmErrorClass(__filename, 'CPNB-USMAIL014', 'Error, parámetro "_html"').server();
      if (!_credentials) throw new CmmErrorClass(__filename, 'CPNB-USMAIL014', 'Error, parámetro "_credentials"').server();
      
      // Logging inicial para debugging en Render
      console.log('[SMTP INIT] Iniciando envío de correo:', {
        emails: _emails,
        subject: _subject,
        environment: process.env.NODE_ENV,
        host: _credentials.host,
        port: _credentials.port,
        secure: _credentials.secure,
        timestamp: new Date().toISOString()
      });

      const TRANSPORTER_EMAIL = await module.exports._getTransportNotifyEmailService(_credentials).catch((_error) => {
        console.error('[SMTP ERROR] Error creando transporter:', _error);
        throw new CmmErrorClass(__filename, 'CPNB-USMAIL015').parseCatch(_error);
      });

      // Preparar objeto de email base
      const EMAIL_OPTIONS = {
        to: _emails,
        from: _credentials.username,
        subject: _subject,
        html: _html,
      };

      // Agregar attachments si existen y no están vacíos
      const HAS_ATTACHMENTS = _attachments && Array.isArray(_attachments) && _attachments.length > 0;
      if (HAS_ATTACHMENTS) EMAIL_OPTIONS.attachments = _attachments;

      // Enviamos el correo con reintentos para Render
      let EMAIL_SENT_RESULT;
      const MAX_ATTEMPTS = 3;
      
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          console.log(`[SMTP SEND] Intento ${attempt}/${MAX_ATTEMPTS}...`);
          EMAIL_SENT_RESULT = await TRANSPORTER_EMAIL.sendMail(EMAIL_OPTIONS);
          console.log(`[SMTP SEND] ✅ Correo enviado exitosamente en intento ${attempt}`);
          break;
        } catch (_error) {
          console.error(`[SMTP SEND] ❌ Intento ${attempt} falló:`, {
            error: _error.message,
            code: _error.code,
            command: _error.command
          });
          
          if (attempt === MAX_ATTEMPTS) {
            // Último intento falló
            throw new CmmErrorClass(__filename, 'CPNB-USMAIL016', {
              originalError: _error,
              attempts: MAX_ATTEMPTS,
              message: `Falló después de ${MAX_ATTEMPTS} intentos`
            }).server();
          }
          
          // Esperar antes del siguiente intento
          const delay = attempt * 2000; // 2s, 4s, 6s
          console.log(`[SMTP SEND] Esperando ${delay}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      // Retornamos el resultado
      return { 
        success: true,
        emails: _emails,
        hasAttachments: HAS_ATTACHMENTS,
        attachmentCount: HAS_ATTACHMENTS ? _attachments.length : 0,
        data: EMAIL_SENT_RESULT
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-USMAIL017', _error).server() : _error;
    }
  },

}; 