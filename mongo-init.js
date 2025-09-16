// Script de inicialización de MongoDB
db = db.getSiblingDB('pnb_multas');

// Crear usuario para la aplicación
db.createUser({
  user: 'pnb_user',
  pwd: 'pnb_password',
  roles: [
    {
      role: 'readWrite',
      db: 'pnb_multas'
    }
  ]
});

// Crear índices para optimizar consultas
db.policias.createIndex({ "cedula": 1 });
db.policias.createIndex({ "codigo_policia": 1 });
db.policias.createIndex({ "username": 1 });
db.policias.createIndex({ "email": 1 });

db.multas.createIndex({ "numero": 1 });
db.multas.createIndex({ "estado": 1 });
db.multas.createIndex({ "funcionario": 1 });
db.multas.createIndex({ "fecha_infraccion": 1 });

db.conductores.createIndex({ "cedula": 1 });
db.conductores.createIndex({ "numero_licencia": 1 });

db.vehiculos.createIndex({ "placa": 1 });
db.vehiculos.createIndex({ "propietario.cedula": 1 });

db.infracciones.createIndex({ "codigo": 1 });
db.infracciones.createIndex({ "gravedad": 1 });

print('✅ Base de datos PNB Multas inicializada correctamente');
