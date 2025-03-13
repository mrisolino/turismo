# Aplicación de Gestión de Viajes

## Instalación

1. Clonar el repositorio
```bash
git clone https://github.com/USER/REPO.git
cd REPO
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

4. Configurar variables de entorno:
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

5. Iniciar la aplicación
```bash
npm start
```

## Scripts Disponibles

- `npm start` - Inicia tanto el frontend como el backend
- `npm run server` - Inicia solo el servidor backend
- `npm run client` - Inicia solo el cliente React
- `npm run build` - Compila la aplicación para producción
