'use strict';

const { CmmErrorClass, CmmSendMailSV } = require('../utils');
const { MailerSend } = require('mailersend');
const Handlebars = require('handlebars');

/* Services */
const { getEmailTemplateByTagSV, processEmailTemplateSV } = require('./email-template.service');

module.exports = {
  /**
   * @function      :sendFineMailSV
   * @version       :2.0.0
   * @description   :Envía un correo con la notificación de multa usando plantillas dinámicas.
   * @param {Array} _emails - Array de correos a enviar.
   * @param {Object} _data - Data para el correo (puede incluir plantilla procesada o datos para procesar).
   * @param {String} _templateTag - Tag de la plantilla a usar (opcional, por defecto 'FINE_NOTIFICATION_HTML').
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendFineMailSV(_emails, _data, _templateTag = 'FINE_NOTIFICATION_HTML') {
    try {
      // Validaciones
      if (!_emails) throw new CmmErrorClass(__filename, 'CPNB-SMAILE002','Error, parámetro "_emails"').server();
      if (!_data) throw new CmmErrorClass(__filename, 'CPNB-SMAILE003','Error, parámetro "_data"').server();

      let PROCESSED_EMAIL;

        const TEMPLATE = await getEmailTemplateByTagSV(_templateTag).catch(_error => {throw new CmmErrorClass(__filename, 'CPNB-SMAILE004', _error).server()});
      console.log('[MAIL SERVICE] Template:', TEMPLATE);
        if (TEMPLATE) {
          // Procesar plantilla con los datos
          PROCESSED_EMAIL = await processEmailTemplateSV(TEMPLATE.code, _data).catch(_error => {throw new CmmErrorClass(__filename, 'CPNB-SMAILE005', _error).server()});
          // Agregar layout del modelo si está disponible
          if (TEMPLATE.layout) PROCESSED_EMAIL.layout = TEMPLATE.layout;
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
        }
      };

      // Generar HTML usando Handlebars
      let HTML_BODY = PROCESSED_EMAIL.htmlContent || PROCESSED_EMAIL.content;

      // Si el contenido HTML es un template completo, procesarlo directamente
      if (PROCESSED_EMAIL.htmlContent && PROCESSED_EMAIL.htmlContent.includes('<!DOCTYPE html>')) {
        HTML_BODY = await module.exports._processHtmlTemplate(PROCESSED_EMAIL.htmlContent, _data);
      } else if (PROCESSED_EMAIL.htmlContent) {
        // Si es un partial, usar el layout del modelo o el por defecto
        const LAYOUT_TO_USE = PROCESSED_EMAIL.layout || module.exports._getLayoutTemplate();
        HTML_BODY = await module.exports._generateHtmlSV(
          LAYOUT_TO_USE,
          PROCESSED_EMAIL.htmlContent,
          _data
        );
      }

      console.log('[MAIL SERVICE] Usando Gmail SMTP para desarrollo...');
      return await CmmSendMailSV(
        _emails,
        PROCESSED_EMAIL.subject,
        HTML_BODY,
        CREDENTIALS.credentials
      ).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-SMAILE004', _error).server();
      });
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SMAILE005', _error).server()
        : _error;
    }
  },

  /**
   * @function      :sendGenericMailSV
   * @version       :2.0.0
   * @description   :Envía un correo genérico usando plantillas dinámicas.
   * @param {Array} _emails - Array de correos a enviar.
   * @param {String} _templateTag - Tag de la plantilla a usar.
   * @param {Object} _variables - Variables para la plantilla.
   * @returns {Promise<Object>} - Resultado del envío
   */
  async sendGenericMailSV(_emails, _templateTag, _variables) {
    try {
      // Validaciones
      if (!_emails)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE010',
          'Error, parámetro "_emails"'
        ).server();
      if (!_templateTag)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE011',
          'Error, parámetro "_templateTag"'
        ).server();
      if (!_variables)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE012',
          'Error, parámetro "_variables"'
        ).server();

      // Obtener plantilla por tag
      const TEMPLATE = await getEmailTemplateByTagSV(_templateTag).catch(_error => {
        console.log('Error obteniendo plantilla genérica por tag, usando plantilla por defecto:', _error);
        return null;
      });

      let PROCESSED_EMAIL;
      if (TEMPLATE) {
        // Procesar plantilla con los datos
        PROCESSED_EMAIL = await processEmailTemplateSV(TEMPLATE.code, _variables).catch(_error => {
          console.log('Error procesando plantilla genérica, usando plantilla por defecto:', _error);
          return this._getDefaultEmailTemplate(_variables);
        });

        // Agregar layout del modelo si está disponible
        if (TEMPLATE.layout) {
          PROCESSED_EMAIL.layout = TEMPLATE.layout;
        }
      } else {
        // Fallback a plantilla por defecto
        PROCESSED_EMAIL = this._getDefaultEmailTemplate(_variables);
      }

      // Configuración SMTP para desarrollo
      const CREDENTIALS = {
        credentials: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          username: 'chinchinqa@gmail.com',
          password: 'vuwcorcheflndmyj'
        }
      };

      // Generar HTML usando Handlebars
      let HTML_BODY = PROCESSED_EMAIL.htmlContent || PROCESSED_EMAIL.content;

      // Si el contenido HTML es un template completo, procesarlo directamente
      if (PROCESSED_EMAIL.htmlContent && PROCESSED_EMAIL.htmlContent.includes('<!DOCTYPE html>')) {
        HTML_BODY = await module.exports._processHtmlTemplate(PROCESSED_EMAIL.htmlContent, _variables);
      } else if (PROCESSED_EMAIL.htmlContent) {
        // Si es un partial, usar el layout del modelo o el por defecto
        const LAYOUT_TO_USE = PROCESSED_EMAIL.layout;
        HTML_BODY = await module.exports._generateHtmlSV(
          LAYOUT_TO_USE,
          PROCESSED_EMAIL.htmlContent,
          _variables
        );
      }

      console.log(`[MAIL SERVICE] Enviando correo con plantilla: ${_templateTag}`);
      return await CmmSendMailSV(
        _emails,
        PROCESSED_EMAIL.subject,
        HTML_BODY,
        CREDENTIALS.credentials
      ).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-SMAILE013', _error).server();
      });
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-SMAILE014', _error).server()
        : _error;
    }
  },


  /**
   * @private
   * @version        :2.0.0
   * @description    :Procesa un template HTML completo con variables
   * @param {String} _htmlTemplate - Template HTML completo
   * @param {Object} _data - data a compilar
   * @returns {String} - html generado
   */
  async _processHtmlTemplate(_htmlTemplate, _data = {}) {
    try {
      if (!_htmlTemplate)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE015',
          'Error, parámetro "_htmlTemplate"'
        ).server();
      if (!_data)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE016',
          'Error, parámetro "_data"'
        ).server();

      const TEMPLATE = Handlebars.compile(_htmlTemplate);
      return TEMPLATE(_data);
    } catch (_error) {
      throw new CmmErrorClass(__filename, 'CPNB-SMAILE017', _error).server();
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
          'CPNB-SMAILE006',
          'Error, parámetro "_layout"'
        ).server();
      if (!_partial)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE007',
          'Error, parámetro "_partial"'
        ).server();
      if (!_data)
        throw new CmmErrorClass(
          __filename,
          'CPNB-SMAILE008',
          'Error, parámetro "_data"'
        ).server();
      const LAYOUT = Handlebars.compile(_layout);
      const PARTIAL = Handlebars.compile(_partial);

      Handlebars.registerPartial('partial', PARTIAL);
      return LAYOUT(_data);
    } catch (_error) {
      throw new CmmErrorClass(__filename, 'CPNB-SMAILE009', _error).server();
    }
  }
};