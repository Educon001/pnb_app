# PNB Multas Backend


## 📋 Prerrequisitos

- Node.js (v16 o superior)
- MongoDB (v4.4 o superior)
- npm o yarn
- Git

## 🏠 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/pnb-multas-backend.git
cd pnb-multas-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 4. Iniciar MongoDB

```bash
# Con Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O iniciar servicio local
sudo systemctl start mongod
```

### 5. Ejecutar la aplicación

```bash
# Desarrollo
npm run dev

# Producción
npm start

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/register` - Registrarse
- `POST /api/v1/auth/refresh` - Renovar token

### Multas
- `GET /api/v1/fines` - Obtener multas
- `POST /api/v1/fines` - Crear multa
- `PUT /api/v1/fines/:id` - Actualizar multa
- `DELETE /api/v1/fines/:id` - Eliminar multa

### Conductores
- `GET /api/v1/drivers` - Obtener conductores
- `POST /api/v1/drivers` - Crear conductor
- `PUT /api/v1/drivers/:id` - Actualizar conductor

### Vehículos
- `GET /api/v1/vehicles` - Obtener vehículos
- `POST /api/v1/vehicles` - Crear vehículo
- `PUT /api/v1/vehicles/:id` - Actualizar vehículo


## 📁 Estructura del Proyecto

```
pnb-multas-backend/
├── app/
│   ├── controllers/          # Controladores
│   ├── services/            # Lógica de negocio
│   ├── models/              # Modelos de MongoDB
│   ├── routers/             # Rutas
│   ├── middlewares/         # Middlewares
│   ├── validations/         # Validaciones
│   ├── utils/               # Utilidades
│   └── configs/             # Configuraciones
├── tests/                   # Tests
├── server.js               # Punto de entrada
├── package.json            # Dependencias
└── README.md              # Documentación
```
