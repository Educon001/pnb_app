'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { CmmErrorClass } = require('../utils');

/* Models */
const POLICE_MODEL = require('../models/police.model');

module.exports = {
  /**
   * @description Iniciar sesión
   * @param {String} _username - Nombre de usuario
   * @param {String} _password - Contraseña
   * @returns {Promise} Promise with the response
   */
  async loginSV(_username, _password) {
    try {
      // Buscar policía por username
      const POLICE_RESULT = await POLICE_MODEL.findOne({ username: _username }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE001', _error).database();
      });

      if (!POLICE_RESULT) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE002', 'Credenciales inválidas').frontend();
      }

      // Verificar contraseña
      const PASSWORD_VALID = await bcrypt.compare(_password, POLICE_RESULT.password).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE003', _error).server();
      });

      if (!PASSWORD_VALID) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE004', 'Credenciales inválidas').frontend();
      }

      // Verificar que el policía esté activo
      if (!POLICE_RESULT.active) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE005', 'Cuenta desactivada').frontend();
      }

      // Generar token JWT
      const TOKEN_PAYLOAD = {
        id: POLICE_RESULT._id,
        username: POLICE_RESULT.username,
        roles: POLICE_RESULT.roles
      };

      const JWT_TOKEN = jwt.sign(TOKEN_PAYLOAD, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });

      // Actualizar último acceso
      await POLICE_MODEL.findByIdAndUpdate(POLICE_RESULT._id, {
        lastLogin: new Date(),
        updatedAt: new Date()
      }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE006', _error).database();
      });

      return {
        token: JWT_TOKEN,
        police: {
          id: POLICE_RESULT._id,
          username: POLICE_RESULT.username,
          firstName: POLICE_RESULT.firstName,
          lastName: POLICE_RESULT.lastName,
          idCard: POLICE_RESULT.idCard,
          badgeNumber: POLICE_RESULT.badgeNumber,
          roles: POLICE_RESULT.roles,
          email: POLICE_RESULT.email,
          phone: POLICE_RESULT.phone,
          rank: POLICE_RESULT.rank,
          department: POLICE_RESULT.department,
        }
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE007', _error).server() : _error;
    }
  },

  /**
   * @description Cerrar sesión
   * @param {String} _policeId - ID del policía
   * @param {String} _token - Token JWT
   * @returns {Promise} Promise with the response
   */
  async logoutSV(_policeId, _token) {
    try {
      // Aquí se podría implementar una lista negra de tokens
      // Por ahora solo actualizamos el último acceso
      await POLICE_MODEL.findByIdAndUpdate(_policeId, {
        lastLogout: new Date(),
        updatedAt: new Date()
      }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE008', _error).database();
      });

      return { message: 'Sesión cerrada exitosamente' };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE009', _error).server() : _error;
    }
  },

  /**
   * @description Obtener perfil del policía
   * @param {String} _policeId - ID del policía
   * @returns {Promise} Promise with the response
   */
  async getProfileSV(_policeId) {
    try {
      const PROFILE_RESULT = await POLICE_MODEL.findById(_policeId)
        .select('-password')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'CPNB-SAUTHE010', _error).database();
        });

      if (!PROFILE_RESULT) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE011', 'Policía no encontrado').frontend();
      }

      return PROFILE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE012', _error).server() : _error;
    }
  },

  /**
   * @description Actualizar perfil del policía
   * @param {String} _policeId - ID del policía
   * @param {Object} _updateData - Datos a actualizar
   * @returns {Promise} Promise with the response
   */
  async updateProfileSV(_policeId, _updateData) {
    try {
      const POLICE_EXISTS = await POLICE_MODEL.findById(_policeId).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE013', _error).database();
      });

      if (!POLICE_EXISTS) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE014', 'Policía no encontrado').frontend();
      }

      // Verificar si el nuevo email ya existe en otro policía
      if (_updateData.email && _updateData.email !== POLICE_EXISTS.email) {
        const EXISTING_EMAIL = await POLICE_MODEL.findOne({ 
          email: _updateData.email,
          _id: { $ne: _policeId }
        }).catch((_error) => {
          throw new CmmErrorClass(__filename, 'CPNB-SAUTHE015', _error).database();
        });

        if (EXISTING_EMAIL) {
          throw new CmmErrorClass(__filename, 'CPNB-SAUTHE016', 'Ya existe un policía con este email').frontend();
        }
      }

      const UPDATE_DATA = {
        ..._updateData,
        updatedAt: new Date()
      };

      const PROFILE_RESULT = await POLICE_MODEL.findByIdAndUpdate(_policeId, UPDATE_DATA, { new: true })
        .select('-password')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'CPNB-SAUTHE017', _error).database();
        });

      return PROFILE_RESULT;
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE018', _error).server() : _error;
    }
  },

  /**
   * @description Cambiar contraseña
   * @param {String} _policeId - ID del policía
   * @param {String} _currentPassword - Contraseña actual
   * @param {String} _newPassword - Nueva contraseña
   * @returns {Promise} Promise with the response
   */
  async changePasswordSV(_policeId, _currentPassword, _newPassword) {
    try {
      const POLICE_RESULT = await POLICE_MODEL.findById(_policeId).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE019', _error).database();
      });

      if (!POLICE_RESULT) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE020', 'Policía no encontrado').frontend();
      }

      // Verificar contraseña actual
      const CURRENT_PASSWORD_VALID = await bcrypt.compare(_currentPassword, POLICE_RESULT.password).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE021', _error).server();
      });

      if (!CURRENT_PASSWORD_VALID) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE022', 'Contraseña actual incorrecta').frontend();
      }

      // Encriptar nueva contraseña
      const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
      const HASHED_PASSWORD = await bcrypt.hash(_newPassword, SALT_ROUNDS).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE023', _error).server();
      });

      // Actualizar contraseña
      await POLICE_MODEL.findByIdAndUpdate(_policeId, {
        password: HASHED_PASSWORD,
        updatedAt: new Date()
      }).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE024', _error).database();
      });

      return { message: 'Contraseña actualizada exitosamente' };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE025', _error).server() : _error;
    }
  },

  /**
   * @description Renovar token
   * @param {String} _policeId - ID del policía
   * @returns {Promise} Promise with the response
   */
  async renewTokenSV(_policeId) {
    try {
      const POLICE_RESULT = await POLICE_MODEL.findById(_policeId).catch((_error) => {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE026', _error).database();
      });

      if (!POLICE_RESULT) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE027', 'Policía no encontrado').frontend();
      }

      if (!POLICE_RESULT.active) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE028', 'Cuenta desactivada').frontend();
      }

      // Generar nuevo token JWT
      const TOKEN_PAYLOAD = {
        id: POLICE_RESULT._id,
        username: POLICE_RESULT.username,
        roles: POLICE_RESULT.roles
      };

      const JWT_TOKEN = jwt.sign(TOKEN_PAYLOAD, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      });

      return {
        token: JWT_TOKEN,
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
      };
    } catch (_error) {
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE029', _error).server() : _error;
    }
  },

  /**
   * @description Verificar token
   * @param {String} _token - Token JWT
   * @returns {Promise} Promise with the response
   */
  async verifyTokenSV(_token) {
    try {
      const DECODED = jwt.verify(_token, process.env.JWT_SECRET);
      
      const POLICE_RESULT = await POLICE_MODEL.findById(DECODED.id)
        .select('-password')
        .catch((_error) => {
          throw new CmmErrorClass(__filename, 'CPNB-SAUTHE030', _error).database();
        });

      if (!POLICE_RESULT) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE031', 'Policía no encontrado').frontend();
      }

      if (!POLICE_RESULT.active) {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE032', 'Cuenta desactivada').frontend();
      }

      return POLICE_RESULT;
    } catch (_error) {
      if (_error.name === 'JsonWebTokenError' || _error.name === 'TokenExpiredError') {
        throw new CmmErrorClass(__filename, 'CPNB-SAUTHE033', 'Token inválido o expirado').frontend();
      }
      throw !_error.errorType ? new CmmErrorClass(__filename, 'CPNB-SAUTHE034', _error).server() : _error;
    }
  }
};