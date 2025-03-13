# Aplicación de Gestión de Viajes y Pasajeros 🚍

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/mrisolino/turismo
cd turismo
```

2. Instalar dependencias del proyecto principal
```bash
npm install
```

3. Instalar dependencias del servidor
```bash
cd server
npm install
```
4. Crea la DB y las tablas con init.sql

   ## Creacion de DB y Tablas
   - `init.sql`: ejecutalo en tu servidor mysql

   ## Estructura de la Base de Datos


   ### Tabla: Trips
   - `TripID`: Identificador único del viaje
   - `Destination`: Destino del viaje
   - `Date`: Fecha del viaje
   - `Price`: Precio por pasajero
   - `MaxPassengers`: Capacidad máxima (default: 40)
   
   ### Tabla: Passengers
   - `PassengerID`: Identificador único del pasajero
   - `DNI`: Documento de identidad (único)
   - `Name`: Nombre completo
   - `Birthdate`: Fecha de nacimiento
   - `Phone`: Teléfono de contacto
   
   ### Tabla: TripPassengers
   - Relación entre viajes y pasajeros
   - Control de estado de pago por pasajero
   - Eliminación en cascada al eliminar viajes o pasajeros

5. Configurar variables de entorno:
   - Crear archivo `.env` en el directorio raíz:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   - Crear archivo `.env` en la carpeta `server/`:
   ```
   DB_HOST=localhost
   DB_USER=tu_usuario
   DB_PASSWORD=tu_contraseña
   DB_NAME=nombre_base_datos
   PORT=5000
   ```


6. Iniciar la aplicación
```bash
npm start
```

## Scripts Disponibles

- `npm start` - Inicia tanto el frontend como el backend
- `npm run server` - Inicia solo el servidor backend
- `npm run client` - Inicia solo el cliente React
- `npm run build` - Compila la aplicación para producción
