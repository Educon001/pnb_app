'use strict';

const { CmmErrorClass } = require('../../utils');

module.exports = {
  /**
   * @description Validación de datos para login
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async authDataValidation(req, res, next) {
    try {
      const { username, password } = req.body;

      // Validaciones de negocio
      if (!username || !password) {
        throw new CmmErrorClass(__filename, 'CPNB-VAUTHE001', 'Username y password son obligatorios').frontend();
      }

      // Validar formato de email si es email
      if (username.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
          throw new CmmErrorClass(__filename, 'CPNB-VAUTHE002', 'Formato de email inválido').frontend();
        }
      }

      // Validar longitud mínima de contraseña
      if (password.length < 6) {
        throw new CmmErrorClass(__filename, 'CPNB-VAUTHE003', 'La contraseña debe tener al menos 6 caracteres').frontend();
      }

      // Almacenar datos validados
      req.CC = req.CC || {};
      req.CC.VALIDATED_DATA = {
        username: username.toUpperCase(),
        password: password
      };

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación',
        error: error.errorCode || 'AUTHE000'
      });
    }
  },

  /**
   * @description Validación de datos para actualizar perfil
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async updateProfileDataValidation(req, res, next) {
    try {
      const { firstName, lastName, email, phone, address } = req.body;

      // Validar email si se proporciona
      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new CmmErrorClass(__filename, 'CPNB-VAUTHE004', 'Formato de email inválido').frontend();
        }
      }

      // Validar teléfono si se proporciona
      if (phone) {
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(phone)) {
          throw new CmmErrorClass(__filename, 'CPNB-VAUTHE005', 'Formato de teléfono inválido').frontend();
        }
      }

      // Almacenar datos validados
      req.CC = req.CC || {};
      req.CC.VALIDATED_DATA = {
        firstName: firstName ? firstName.toUpperCase() : undefined,
        lastName: lastName ? lastName.toUpperCase() : undefined,
        email: email ? email.toLowerCase() : undefined,
        phone: phone,
        address: address
      };

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación',
        error: error.errorCode || 'AUTHE000'
      });
    }
  },

  /**
   * @description Validación de datos para cambiar contraseña
   * @param {Object} req - Request object
   * @param {Object} res - Response object
   * @param {Function} next - Next function
   */
  async changePasswordDataValidation(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Validar que las contraseñas no sean iguales
      if (currentPassword === newPassword) {
        throw new CmmErrorClass(__filename, 'CPNB-VAUTHE006', 'La nueva contraseña debe ser diferente a la actual').frontend();
      }

      // Validar longitud mínima de nueva contraseña
      if (newPassword.length < 6) {
        throw new CmmErrorClass(__filename, 'CPNB-VAUTHE007', 'La nueva contraseña debe tener al menos 6 caracteres').frontend();
      }

      // Validar complejidad de contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(newPassword)) {
        throw new CmmErrorClass(__filename, 'CPNB-VAUTHE008', 'La nueva contraseña debe contener al menos una letra mayúscula, una minúscula y un número').frontend();
      }

      // Almacenar datos validados
      req.CC = req.CC || {};
      req.CC.VALIDATED_DATA = {
        currentPassword,
        newPassword
      };

      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Error de validación',
        error: error.errorCode || 'AUTHE000'
      });
    }
  }
};
