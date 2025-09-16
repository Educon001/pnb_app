'use strict';

module.exports = {
  // Configuración de la aplicación
  APP: {
    NAME: 'PNB Multas Electrónicas',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de gestión de multas electrónicas de la Policía Nacional Bolivariana'
  },

  // Configuración de multas
  MULTA: {
    PREFIX: 'M',
    EXPIRY_DAYS: 30,
    RECONSIDERACION_DAYS: 15,
    ESTADOS: {
      BORRADOR: 'BORRADOR',
      ENVIADA: 'ENVIADA',
      PAGADA: 'PAGADA',
      ANULADA: 'ANULADA',
      RECONSIDERACION: 'RECONSIDERACION'
    }
  },

  // Configuración de infracciones
  INFRACCION: {
    GRAVEDAD: {
      LEVE: 'LEVE',
      MENOS_GRAVE: 'MENOS_GRAVE',
      GRAVE: 'GRAVE',
      MUY_GRAVE: 'MUY_GRAVE'
    },
    TIPOS_VEHICULO: {
      AUTOMOVIL: 'AUTOMOVIL',
      MOTOCICLETA: 'MOTOCICLETA',
      CAMION: 'CAMION',
      BUS: 'BUS',
      PICKUP: 'PICKUP',
      VAN: 'VAN',
      OTRO: 'OTRO',
      TODOS: 'TODOS'
    }
  },

  // Configuración de conductores
  CONDUCTOR: {
    GRADOS_LICENCIA: {
      PROFESIONAL: 'PROFESIONAL',
      NO_PROFESIONAL: 'NO_PROFESIONAL',
      MOTOCICLETA: 'MOTOCICLETA',
      PESADO: 'PESADO',
      ESPECIAL: 'ESPECIAL'
    },
    SEXOS: {
      M: 'M',
      F: 'F',
      OTRO: 'OTRO'
    },
    PUNTOS_MAXIMOS: 20
  },

  // Configuración de vehículos
  VEHICULO: {
    TIPOS: {
      AUTOMOVIL: 'AUTOMOVIL',
      MOTOCICLETA: 'MOTOCICLETA',
      CAMION: 'CAMION',
      BUS: 'BUS',
      PICKUP: 'PICKUP',
      VAN: 'VAN',
      OTRO: 'OTRO'
    },
    COMBUSTIBLES: {
      GASOLINA: 'GASOLINA',
      DIESEL: 'DIESEL',
      GAS: 'GAS',
      ELECTRICO: 'ELECTRICO',
      HIBRIDO: 'HIBRIDO'
    },
    TRANSMISIONES: {
      MANUAL: 'MANUAL',
      AUTOMATICA: 'AUTOMATICA',
      CVT: 'CVT'
    }
  },

  // Configuración de policías
  POLICIA: {
    GRADOS: {
      OFICIAL: 'Oficial',
      SARGENTO: 'Sargento',
      CABO: 'Cabo',
      GUARDIA: 'Guardia',
      COMISARIO: 'Comisario',
      SUPERINTENDENTE: 'Superintendente'
    },
    ROLES: {
      ADMIN: 'admin',
      OFICIAL: 'oficial',
      SUPERVISOR: 'supervisor',
      COMISARIO: 'comisario'
    }
  },

  // Configuración de colores para gravedad
  COLORS: {
    GRAVEDAD: {
      LEVE: '#4CAF50',
      MENOS_GRAVE: '#FF9800',
      GRAVE: '#FF5722',
      MUY_GRAVE: '#F44336'
    },
    ESTADO: {
      BORRADOR: '#FFC107',
      ENVIADA: '#2196F3',
      PAGADA: '#4CAF50',
      ANULADA: '#F44336',
      RECONSIDERACION: '#9C27B0'
    }
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    DEFAULT_PAGE: 1
  },

  // Configuración de archivos
  FILES: {
    MAX_SIZE: 10485760, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    UPLOAD_PATH: 'uploads/'
  },

  // Configuración de validación
  VALIDATION: {
    PASSWORD_MIN_LENGTH: 6,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 50,
    NOMBRES_MIN_LENGTH: 2,
    NOMBRES_MAX_LENGTH: 100,
    CEDULA_PATTERN: /^[VE]\d{7,8}$/,
    PLACA_PATTERN: /^[A-Z]{3}-\d{4}$/,
    TELEFONO_PATTERN: /^(\+58|0)?[0-9]{10}$/,
    EMAIL_PATTERN: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },

  // Configuración de JWT
  JWT: {
    EXPIRES_IN: '24h',
    ALGORITHM: 'HS256'
  },

  // Configuración de email
  EMAIL: {
    FROM: 'PNB Multas Electrónicas <noreply@pnb.gob.ve>',
    SUPPORT: 'soporte@pnb.gob.ve'
  },

  // Configuración de la PNB
  PNB: {
    NAME: 'Policía Nacional Bolivariana',
    LOGO_URL: 'https://pnb.gob.ve/logo.png',
    EMAIL_SUPPORT: 'soporte@pnb.gob.ve'
  },

  // Configuración de respuestas HTTP
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
  },

  // Configuración de códigos de error
  ERROR_CODES: {
    // Autenticación
    AUTH001: 'Token de acceso requerido',
    AUTH002: 'Credenciales inválidas',
    AUTH003: 'Token inválido',
    AUTH004: 'No tiene permisos para acceder a este recurso',
    AUTH005: 'No tiene permisos para gestionar multas',
    AUTH006: 'No tiene permisos para ver estadísticas',
    AUTH007: 'No tiene permisos para gestionar usuarios',
    AUTH008: 'No tiene permisos para gestionar infracciones',
    AUTH009: 'Token renovado exitosamente',
    AUTH010: 'Token válido',

    // Multas
    MULTA001: 'Infracción, conductor y vehículo son obligatorios',
    MULTA002: 'Ubicación, fecha y hora son obligatorios',
    MULTA003: 'Error al crear multa',
    MULTA004: 'Error al obtener multas',
    MULTA005: 'No tiene permisos para ver esta multa',
    MULTA006: 'Multa no encontrada',
    MULTA007: 'Error al actualizar multa',
    MULTA008: 'Error al enviar multa',
    MULTA009: 'El motivo de anulación es obligatorio',
    MULTA010: 'Error al anular multa',
    MULTA011: 'Error al obtener estadísticas',
    MULTA012: 'Error al obtener resumen del dashboard',

    // Infracciones
    INFRA001: 'Código, nombre, descripción, artículo y gravedad son obligatorios',
    INFRA002: 'Unidades tributarias y valor en bolívares son obligatorios',
    INFRA003: 'Error al crear infracción',
    INFRA004: 'Error al obtener infracciones',
    INFRA005: 'Infracción no encontrada',
    INFRA006: 'Error al actualizar infracción',
    INFRA007: 'Error al eliminar infracción',
    INFRA008: 'Error al obtener infracciones por gravedad',
    INFRA009: 'Error al obtener infracciones por tipo de vehículo',
    INFRA010: 'Error al obtener estadísticas',
    INFRA011: 'El término de búsqueda debe tener al menos 2 caracteres',
    INFRA012: 'Error al buscar infracciones',

    // Conductores
    COND001: 'Nombres, apellidos, cédula, número de licencia y grado son obligatorios',
    COND002: 'Fechas de emisión y vencimiento de licencia son obligatorias',
    COND003: 'Dirección, fecha de nacimiento y sexo son obligatorios',
    COND004: 'Error al crear conductor',
    COND005: 'Error al obtener conductores',
    COND006: 'Conductor no encontrado',
    COND007: 'Conductor no encontrado por cédula',
    COND008: 'Error al actualizar conductor',
    COND009: 'El motivo de suspensión es obligatorio',
    COND010: 'Error al suspender conductor',
    COND011: 'Error al reactivar conductor',
    COND012: 'Error al eliminar conductor',
    COND013: 'Error al obtener estadísticas',
    COND014: 'El término de búsqueda debe tener al menos 2 caracteres',
    COND015: 'Error al buscar conductores',
    COND016: 'Error al verificar licencia vencida',

    // Vehículos
    VEH001: 'Placa, marca, modelo, año, color y tipo de vehículo son obligatorios',
    VEH002: 'Datos del propietario (nombres, apellidos, cédula y dirección) son obligatorios',
    VEH003: 'Error al crear vehículo',
    VEH004: 'Error al obtener vehículos',
    VEH005: 'Vehículo no encontrado',
    VEH006: 'Vehículo no encontrado por placa',
    VEH007: 'Error al actualizar vehículo',
    VEH008: 'El número de denuncia es obligatorio',
    VEH009: 'Error al reportar vehículo como robado',
    VEH010: 'Error al quitar reporte de robo',
    VEH011: 'Error al eliminar vehículo',
    VEH012: 'Error al obtener estadísticas',
    VEH013: 'El término de búsqueda debe tener al menos 2 caracteres',
    VEH014: 'Error al buscar vehículos',
    VEH015: 'Error al verificar estado de robo',
    VEH016: 'Error al obtener vehículos robados',

    // Estadísticas
    EST001: 'Error al obtener estadísticas generales',
    EST002: 'Error al obtener estadísticas por período',
    EST003: 'Error al obtener estadísticas de rendimiento',
    EST004: 'Error al obtener infracciones más comunes',
    EST005: 'Error al obtener ubicaciones más frecuentes',
    EST006: 'Error al obtener vehículos más multados',
    EST007: 'Error al obtener resumen del dashboard',
    EST008: 'Error al obtener estadísticas por estado',
    EST009: 'Error al obtener estadísticas de recaudación'
  }
};
