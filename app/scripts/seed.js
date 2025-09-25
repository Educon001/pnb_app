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
  // GRAVES - Art. 169
  {
    code: 'ART169001',
    name: 'CONDUCIR SIN LICENCIA',
    description: 'Conducir sin licencia',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169002',
    name: 'NO OBEDECER SEÑALES DE SEMÁFORO',
    description: 'No obedecer señales de semáforo',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169003',
    name: 'NO APROBAR LA REVISIÓN TÉCNICA DEL VEHÍCULO',
    description: 'No aprobar la revisión técnica del vehículo',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169004',
    name: 'EXCEDER EL LÍMITE DE VELOCIDAD',
    description: 'Exceder el límite de velocidad',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169005',
    name: 'PROVEER DATOS FALSOS AL REGISTRO DE VEHÍCULOS Y CONDUCTORES',
    description: 'Proveer datos falsos al registro de vehículos y conductores',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169006',
    name: 'SOBREPASAR EL TIEMPO MÁXIMO PERMITIDO DE CONDUCCIÓN',
    description: 'Sobrepasar el tiempo máximo permitido de conducción para transporte público o de carga',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169007',
    name: 'NEGLIGENCIA QUE PONGA EN PELIGRO LA SEGURIDAD VIAL',
    description: 'Negligencia que ponga en peligro la seguridad vial',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART169008',
    name: 'CIRCULAR POR CANALES NO PERMITIDOS',
    description: 'Circular por canales no permitidos para determinados vehículos (públicos, privados o de carga)',
    article: 'ART. 169',
    severity: 'SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // MENOS GRAVES - Art. 170
  {
    code: 'ART170001',
    name: 'TRANSITAR CAMBIANDO DE CARRIL FRECUENTEMENTE',
    description: 'Transitar cambiando de carril frecuentemente de forma imprudente',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170002',
    name: 'CIRCULAR ENTRE CANALES O PARALELAMENTE A OTRO VEHÍCULO',
    description: 'Circular entre canales o paralelamente a otro vehículo en movimiento a más de 60 km/h',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170003',
    name: 'TRANSPORTAR MÁS PERSONAS DE LAS PERMITIDAS',
    description: 'Transportar más personas de las permitidas',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170004',
    name: 'CAMBIAR FRECUENTEMENTE DE CANAL DE FORMA IMPRUDENTE',
    description: 'Cambiar frecuentemente de canal o pasar al centro/izquierda/derecha de la vía de forma imprudente',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170005',
    name: 'LLEVAR CARGA PESADA SIN CONDICIONES ADECUADAS',
    description: 'Llevar carga pesada sin condiciones adecuadas',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170006',
    name: 'ESTACIONAR O CIRCULAR EN ZONAS PEATONALES',
    description: 'Estacionar o circular en zonas peatonales o contravías',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART170007',
    name: 'NO USAR CASCOS O PROTECCIÓN CUANDO CORRESPONDE',
    description: 'No usar cascos o protección cuando corresponde',
    article: 'ART. 170',
    severity: 'LESS_SERIOUS',
    vehicleType: 'MOTORCYCLE',
    taxUnits: 5,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // LEVES - Art. 171
  {
    code: 'ART171001',
    name: 'LICENCIA VENCIDA O NO PORTARLA',
    description: 'Licencia vencida, título profesional vencido o no portarlos cuando lo requieran',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },
  {
    code: 'ART171002',
    name: 'CERTIFICADO MÉDICO VENCIDO O NO PORTARLO',
    description: 'Certificado médico de salud vencido o no portarlo cuando lo exijan',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },
  {
    code: 'ART171003',
    name: 'OTRAS INFRACCIONES GENERALES DE CIRCULACIÓN',
    description: 'Otras infracciones generales de circulación de vehículos y peatones que no tengan una sanción específica expresamente establecida',
    article: 'ART. 171',
    severity: 'LIGHT',
    vehicleType: 'ALL',
    taxUnits: 3,
    requiresPhoto: false,
    requiresEvidence: false
  },

  // MUY GRAVES - Art. 173 y 174
  {
    code: 'ART173001',
    name: 'COMPETICIONES DE VELOCIDAD EN VÍAS PÚBLICAS',
    description: 'Para quienes realicen competiciones de velocidad ("piques") en vías públicas',
    article: 'ART. 173',
    severity: 'VERY_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 100,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART174001',
    name: 'EXCESO DE VELOCIDAD MUY GRAVE',
    description: 'Exceso de velocidad',
    article: 'ART. 174',
    severity: 'VERY_SERIOUS',
    vehicleType: 'ALL',
    taxUnits: 100,
    requiresPhoto: true,
    requiresEvidence: true
  },

  // EXCESO DE CARGA - Art. 175
  {
    code: 'ART175001',
    name: 'EXCESO DE CARGA HASTA 10 TONELADAS',
    description: 'Exceso de carga hasta 10 toneladas (10 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 10,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175002',
    name: 'EXCESO DE CARGA DE MÁS DE 10 HASTA 20 TONELADAS',
    description: 'Exceso de carga de más de 10 hasta 20 toneladas (20 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 20,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175003',
    name: 'EXCESO DE CARGA DE MÁS DE 20 HASTA 30 TONELADAS',
    description: 'Exceso de carga de más de 20 hasta 30 toneladas (30 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 30,
    requiresPhoto: true,
    requiresEvidence: true
  },
  {
    code: 'ART175004',
    name: 'EXCESO DE CARGA DE MÁS DE 30 HASTA 40 TONELADAS',
    description: 'Exceso de carga de más de 30 hasta 40 toneladas (40 U.T. por tonelada excedida)',
    article: 'ART. 175',
    severity: 'VERY_SERIOUS',
    vehicleType: 'TRUCK',
    taxUnits: 40,
    requiresPhoto: true,
    requiresEvidence: true
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
