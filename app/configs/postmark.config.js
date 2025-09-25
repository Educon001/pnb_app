'use strict';

module.exports = {
  // Configuración Postmark
  POSTMARK_CONFIG: {
    API_KEY: 'bf81c8f1-eadd-40e1-8ed6-c5194b209cf9',
    FROM_EMAIL: 'noreply@pnb-multas.com',
    MESSAGE_STREAM: 'outbound'
  },

  // Configuración de plantillas
  TEMPLATES: {
    FINE_NOTIFICATION: {
      SUBJECT: 'Notificación de Infracción de Tránsito - PNB',
      FROM: 'noreply@pnb-multas.com'
    }
  }
};
