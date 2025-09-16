// Setup para Jest
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/pnb_multas_test';

// Configuración global para tests
global.console = {
  ...console,
  // Suprimir logs en tests
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
