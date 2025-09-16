'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Importar modelos
const Police = require('../models/police.model');
const Infraction = require('../models/infraction.model');
const Driver = require('../models/driver.model');
const Vehicle = require('../models/vehicle.model');
const Fine = require('../models/fine.model');

// Datos de ejemplo
const policeData = [
  {
    firstName: 'Juan',
    lastName: 'Rodriguez',
    idCard: '12345678',
    badgeNumber: 'PNB001',
    rank: 'OFICIAL',
    department: 'TRÁNSITO TERRESTRE',
    username: 'jrodriguez',
    password: '123456',
    email: 'jrodriguez@pnb.gob.ve',
    phone: '04121234567',
    address: 'Caracas, Venezuela',
    roles: ['ADMIN'],
    active: true
  },
  {
    firstName: 'María',
    lastName: 'González',
    idCard: '87654321',
    badgeNumber: 'PNB002',
    rank: 'SARGENTO',
    department: 'TRÁNSITO TERRESTRE',
    username: 'mgonzalez',
    password: '123456',
    email: 'mgonzalez@pnb.gob.ve',
    phone: '04129876543',
    address: 'Valencia, Venezuela',
    roles: ['SUPERVISOR'],
    active: true
  },
  {
    firstName: 'Pedro Antonio',
    lastName: 'Pérez',
    idCard: '11223344',
    badgeNumber: 'PNB003',
    rank: 'OFICIAL',
    department: 'TRÁNSITO TERRESTRE',
    username: 'pperez',
    password: '123456',
    email: 'pperez@pnb.gob.ve',
    phone: '04125556677',
    address: 'Maracay, Venezuela',
    roles: ['OFICIAL'],
    active: true
  }
];

const infractionsData = [
  {
    code: 'ART001',
    name: 'Conducir sin licencia',
    description: 'Conducir un vehículo sin portar la licencia de conducir correspondiente',
    article: 'Art. 42',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART002',
    name: 'Desobedecer semáforos',
    description: 'No respetar las indicaciones de los semáforos en rojo',
    article: 'Art. 24',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART003',
    name: 'Licencia vencida',
    description: 'Conducir con licencia de conducir vencida',
    article: 'Art. 47',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: false,
    requiresEvidence: false
  },
  {
    code: 'ART004',
    name: 'Exceso de velocidad',
    description: 'Conducir a velocidad superior a la permitida',
    article: 'Art. 169',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 8,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART005',
    name: 'Estacionar en zona prohibida',
    description: 'Estacionar en lugares donde está prohibido',
    article: 'Art. 156',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 6,
    requiresPhoto: true,
    requiresEvidence: false
  }
];

const driversData = [
  {
    firstName: 'Carlos Alberto',
    lastName: 'Martínez',
    idCard: '12345678',
    licenseNumber: '123456789',
    licenseGrade: 'CLASS_C',
    licenseIssueDate: new Date('2020-01-15'),
    licenseExpiryDate: new Date('2025-01-15'),
    phone: '04121234567',
    email: 'cmartinez@email.com',
    address: 'Av. Principal, Caracas',
    birthDate: new Date('1985-05-20'),
    nationality: 'VENEZOLANA',
    gender: 'MALE'
  },
  {
    firstName: 'Ana María',
    lastName: 'López',
    idCard: '87654321',
    licenseNumber: '987654321',
    licenseGrade: 'CLASS_B',
    licenseIssueDate: new Date('2021-03-10'),
    licenseExpiryDate: new Date('2026-03-10'),
    phone: '04129876543',
    email: 'alopez@email.com',
    address: 'Calle 5, Valencia',
    birthDate: new Date('1990-08-15'),
    nationality: 'VENEZOLANA',
    gender: 'FEMALE'
  }
];

const vehiclesData = [
  {
    plate: 'ABC-1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2018,
    color: 'Blanco',
    vehicleType: 'CAR',
    displacement: 1600,
    fuel: 'GASOLINE',
    transmission: 'AUTOMATIC',
    owner: {
      firstName: 'Carlos Alberto',
      lastName: 'Martínez',
      idCard: '12345678',
      phone: '04121234567',
      email: 'cmartinez@email.com',
      address: 'Av. Principal, Caracas'
    }
  },
  {
    plate: 'XYZ-7890',
    brand: 'Honda',
    model: 'Civic',
    year: 2020,
    color: 'Azul',
    vehicleType: 'CAR',
    displacement: 1800,
    fuel: 'GASOLINE',
    transmission: 'MANUAL',
    owner: {
      firstName: 'Ana María',
      lastName: 'López',
      idCard: '87654321',
      phone: '04129876543',
      email: 'alopez@email.com',
      address: 'Calle 5, Valencia'
    }
  }
];

// Función para poblar la base de datos
async function seedDatabase() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pnb_multas');
    console.log('✅ Conectado a MongoDB');

    // Limpiar colecciones existentes
    await Police.deleteMany({});
    await Infraction.deleteMany({});
    await Driver.deleteMany({});
    await Vehicle.deleteMany({});
    await Fine.deleteMany({});
    console.log('✅ Colecciones limpiadas');

    // Encriptar contraseñas de los policías
    const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const policeDataWithHashedPasswords = await Promise.all(
      policeData.map(async (police) => {
        const hashedPassword = await bcrypt.hash(police.password, SALT_ROUNDS);
        return {
          ...police,
          password: hashedPassword
        };
      })
    );

    // Crear policías
    const createdPolice = await Police.insertMany(policeDataWithHashedPasswords);
    console.log(`✅ ${createdPolice.length} policías creados`);

    // Crear infracciones
    const createdInfractions = await Infraction.insertMany(
      infractionsData.map(infraction => ({
        ...infraction,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdInfractions.length} infracciones creadas`);

    // Crear conductores
    const createdDrivers = await Driver.insertMany(
      driversData.map(driver => ({
        ...driver,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdDrivers.length} conductores creados`);

    // Crear vehículos
    const createdVehicles = await Vehicle.insertMany(
      vehiclesData.map(vehicle => ({
        ...vehicle,
        createdBy: createdPolice[0]._id
      }))
    );
    console.log(`✅ ${createdVehicles.length} vehículos creados`);

    // Crear algunas multas de ejemplo
    const sampleFines = [
      {
        fineNumber: 'MUL-001-2024',
        infraction: createdInfractions[0]._id,
        driver: createdDrivers[0]._id,
        vehicle: createdVehicles[0]._id,
        officer: createdPolice[0]._id,
        location: {
          address: 'Av. Principal, Caracas',
          coordinates: { latitude: 10.4806, longitude: -66.9036 }
        },
        infractionDate: new Date(),
        infractionTime: '14:30',
        notes: 'Conducir sin licencia en zona escolar'
      },
      {
        fineNumber: 'MUL-002-2024',
        infraction: createdInfractions[1]._id,
        driver: createdDrivers[1]._id,
        vehicle: createdVehicles[1]._id,
        officer: createdPolice[1]._id,
        location: {
          address: 'Calle 5, Valencia',
          coordinates: { latitude: 10.1621, longitude: -68.0077 }
        },
        infractionDate: new Date(),
        infractionTime: '16:45',
        notes: 'Desobedecer semáforo en rojo'
      }
    ];

    const createdFines = await Fine.insertMany(sampleFines);
    console.log(`✅ ${createdFines.length} multas creadas`);

    console.log('\n🎉 Base de datos poblada exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Admin: jrodriguez / 123456');
    console.log('👤 Supervisor: mgonzalez / 123456');
    console.log('👤 Oficial: pperez / 123456');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('\n🔌 Conexión a MongoDB cerrada');
    process.exit(0);
  }
}

// Ejecutar script
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };
