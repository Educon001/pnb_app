'use strict';

const { CmmErrorClass } = require('../utils');
const EMAIL_TEMPLATE_MODEL = require('../models/email-template.model');

module.exports = {
  /**
   * @description Obtener plantilla de email por código
   * @param {String} _code - Código de la plantilla
   * @returns {Promise} Promise con la plantilla
   */
  async getEmailTemplateByCodeSV(_code) {
    try {
      const TEMPLATE = await EMAIL_TEMPLATE_MODEL.findOne({code: _code.toUpperCase(), active: true
      }).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STMPLE001', _error).database();
      });

      if (!TEMPLATE) throw new CmmErrorClass(__filename, 'CPNB-STMPLE002',`Plantilla de email no encontrada: ${_code}`).frontend();

      return TEMPLATE;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-STMPLE003', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener plantilla de email por tag
   * @param {String} _tag - Tag de la plantilla
   * @returns {Promise} Promise con la plantilla
   */
  async getEmailTemplateByTagSV(_tag) {
    try {
      const TEMPLATE = await EMAIL_TEMPLATE_MODEL.findOne({
        tag: _tag.toUpperCase(),
        active: true
      }).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STMPLE014', _error).database();
      });

      if (!TEMPLATE) throw new CmmErrorClass(__filename, 'CPNB-STMPLE015', `Plantilla de email no encontrada con tag: ${_tag}`).frontend();

      return TEMPLATE;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE016', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener plantillas por categoría
   * @param {String} _category - Categoría de las plantillas
   * @returns {Promise} Promise con las plantillas
   */
  async getEmailTemplatesByCategorySV(_category) {
    try {
      const TEMPLATES = await EMAIL_TEMPLATE_MODEL.find({
        category: _category.toUpperCase(),
        active: true
      })
        .sort({ createdAt: -1 })
        .catch(_error => {
          throw new CmmErrorClass(__filename, 'CPNB-STMPLE004', _error).database();
        });

      return TEMPLATES;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE005', _error).server()
        : _error;
    }
  },

  /**
   * @description Procesar plantilla de email con variables
   * @param {String} _templateCode - Código de la plantilla
   * @param {Object} _variables - Variables para reemplazar en la plantilla
   * @returns {Promise} Promise con la plantilla procesada
   */
  async processEmailTemplateSV(_templateCode, _variables) {
    try {
      const TEMPLATE = await module.exports.getEmailTemplateByCodeSV(_templateCode);
      
      // Procesar contenido del email
      let processedContent = TEMPLATE.designConfig.transports.EMAIL?.content || '';
      let processedSubject = TEMPLATE.designConfig.transports.EMAIL?.subject || '';
      let processedHtmlContent = TEMPLATE.designConfig.transports.EMAIL?.htmlContent || '';

      // Reemplazar variables en el contenido
      Object.keys(_variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        const value = _variables[key] || '';
        
        processedContent = processedContent.replace(regex, value);
        processedSubject = processedSubject.replace(regex, value);
        processedHtmlContent = processedHtmlContent.replace(regex, value);
      });

      // Actualizar contador de uso
      await EMAIL_TEMPLATE_MODEL.findByIdAndUpdate(
        TEMPLATE._id,
        {
          $inc: { usageCount: 1 },
          lastUsed: new Date(),
          updatedAt: new Date()
        }
      ).catch(_error => {
        console.log('Error actualizando contador de uso:', _error);
      });

      return {
        subject: processedSubject,
        content: processedContent,
        htmlContent: processedHtmlContent,
        from: TEMPLATE.emailConfig?.from,
        replyTo: TEMPLATE.emailConfig?.replyTo,
        cc: TEMPLATE.emailConfig?.cc || [],
        bcc: TEMPLATE.emailConfig?.bcc || [],
        priority: TEMPLATE.emailConfig?.priority || 'NORMAL',
        attachments: TEMPLATE.designConfig.transports.EMAIL?.attachments || []
      };
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE006', _error).server()
        : _error;
    }
  },

  /**
   * @description Crear nueva plantilla de email
   * @param {Object} _templateData - Datos de la plantilla
   * @returns {Promise} Promise con la plantilla creada
   */
  async createEmailTemplateSV(_templateData) {
    try {
      const TEMPLATE_RESULT = await EMAIL_TEMPLATE_MODEL.create(_templateData).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STMPLE007', _error).database();
      });

      return TEMPLATE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE008', _error).server()
        : _error;
    }
  },

  /**
   * @description Actualizar plantilla de email
   * @param {String} _id - ID de la plantilla
   * @param {Object} _updateData - Datos a actualizar
   * @returns {Promise} Promise con la plantilla actualizada
   */
  async updateEmailTemplateSV(_id, _updateData) {
    try {
      const TEMPLATE_RESULT = await EMAIL_TEMPLATE_MODEL.findByIdAndUpdate(
        _id,
        { ..._updateData, updatedAt: new Date() },
        { new: true }
      ).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STMPLE009', _error).database();
      });

      if (!TEMPLATE_RESULT) 
          throw new CmmErrorClass(__filename, 'CPNB-STMPLE010', 'Plantilla de email no encontrada').frontend();
      
      

      return TEMPLATE_RESULT;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE011', _error).server()
        : _error;
    }
  },

  /**
   * @description Obtener estadísticas de uso de plantillas
   * @returns {Promise} Promise con las estadísticas
   */
  async getEmailTemplateStatsSV() {
    try {
      const STATS = await EMAIL_TEMPLATE_MODEL.aggregate([
        {
          $group: {
            _id: '$category',
            total: { $sum: 1 },
            active: { $sum: { $cond: ['$active', 1, 0] } },
            totalUsage: { $sum: '$usageCount' },
            avgUsage: { $avg: '$usageCount' }
          }
        },
        {
          $sort: { totalUsage: -1 }
        }
      ]).catch(_error => {
        throw new CmmErrorClass(__filename, 'CPNB-STMPLE012', _error).database();
      });

      return STATS;
    } catch (_error) {
      throw !_error.errorType
        ? new CmmErrorClass(__filename, 'CPNB-STMPLE013', _error).server()
        : _error;
    }
  }
};
