require('dotenv').config({ path: './server/.env' });
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 5000;
const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Configuración de la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, '../build')));

// Rutas para Viajes
app.get('/api/trips', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        COUNT(tp.PassengerID) AS CurrentPassengers
      FROM Trips t
      LEFT JOIN TripPassengers tp ON t.TripID = tp.TripID
      GROUP BY t.TripID
      ORDER BY t.Date DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips', async (req, res) => {
  const { destination, date, price, maxPassengers } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Trips (Destination, Date, Price) VALUES (?, ?, ?)',
      [destination, date, price]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trips/:id', async (req, res) => {
    const { destination, date, price, maxPassengers } = req.body;
    try {
        // Actualizar datos del viaje
        await pool.query(
            `UPDATE Trips 
             SET Destination = ?, 
                 Date = ?, 
                 Price = ?, 
                 MaxPassengers = ?
             WHERE TripID = ?`,
            [destination, date, price, maxPassengers, req.params.id]
        );

        // Obtener datos actualizados
        const [updatedTrip] = await pool.query(
            `SELECT t.*, COUNT(tp.PassengerID) AS CurrentPassengers
             FROM Trips t
             LEFT JOIN TripPassengers tp ON t.TripID = tp.TripID
             WHERE t.TripID = ?
             GROUP BY t.TripID`,
            [req.params.id]
        );

        res.json(updatedTrip[0]);
    } catch (err) {
        console.error('Error en PUT /api/trips/:id:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: err.message
        });
    }
});
app.delete('/api/trips/:tripId/passengers/:passengerId', async (req, res) => {
  const { tripId, passengerId } = req.params;

  try {
    const result = await pool.query(
      'DELETE FROM TripPassengers WHERE TripID = ? AND PassengerID = ?',
      [tripId, passengerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Pasajero no encontrado en este viaje." });
    }

    res.json({ success: true, message: "Pasajero eliminado del viaje correctamente." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// esta funcion no anda

app.delete('/api/passengers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Passengers WHERE PassengerID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/trips/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM Trips WHERE TripID = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas para Pasajeros
app.get('/api/passengers', async (req, res) => {
  const { dni, search } = req.query;
  let query = `
    SELECT 
      p.*,
      COUNT(tp.TripID) AS TripCount
    FROM Passengers p
    LEFT JOIN TripPassengers tp ON p.PassengerID = tp.PassengerID
  `;
  let params = [];

  if (dni) {
    query += ' WHERE p.DNI = ?';
    params.push(dni);
  } else if (search) {
    query += ' WHERE p.DNI LIKE ? OR p.Name LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' GROUP BY p.PassengerID'; // Asegura que traiga todos los pasajeros

  try {
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post('/api/passengers', async (req, res) => {
  const { DNI, Name, Birthdate, Phone } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO Passengers (DNI, Name, Birthdate, Phone) VALUES (?, ?, ?, ?)',
      [DNI, Name, Birthdate, Phone]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rutas para relación Viaje-Pasajero
app.get('/api/trips/:id/passengers', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, tp.Paid 
       FROM TripPassengers tp
       JOIN Passengers p ON tp.PassengerID = p.PassengerID
       WHERE tp.TripID = ?`,
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trips/:id/passengers', async (req, res) => {
    const { action, DNI, Name, Birthdate, Phone, paid } = req.body;
    
    try {
        let passengerId;
        
        if (action === 'create-and-assign') {
            // Verificar si el pasajero ya existe
            const [existing] = await pool.query(
                'SELECT PassengerID FROM Passengers WHERE DNI = ?',
                [DNI]
            );
            
            if (existing.length > 0) {
                throw new Error('El pasajero ya existe en la base de datos');
            }

            // Crear nuevo pasajero
            const [result] = await pool.query(
                'INSERT INTO Passengers (DNI, Name, Birthdate, Phone) VALUES (?, ?, ?, ?)',
                [DNI, Name, Birthdate, Phone]
            );
            
            passengerId = result.insertId;
        } else {
            passengerId = req.body.passengerId;
        }

        // Asignar al viaje
        await pool.query(
            'INSERT INTO TripPassengers (TripID, PassengerID, Paid) VALUES (?, ?, ?)',
            [req.params.id, passengerId, paid || false]
        );

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/trips/:id', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                t.*,
                COUNT(tp.PassengerID) AS CurrentPassengers
            FROM Trips t
            LEFT JOIN TripPassengers tp ON t.TripID = tp.TripID
            WHERE t.TripID = ?
            GROUP BY t.TripID
        `, [req.params.id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Viaje no encontrado' });
        }
        
        res.json(rows[0]);
    } catch (err) {
        console.error('Error en GET /api/trips/:id:', err);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: err.message
        });
    }
});

// Ruta para actualizar el estado de pago de un pasajero
app.put('/api/trips/:tripId/passengers/:passengerId/payment', async (req, res) => {
    try {
        const { paid } = req.body;
        const { tripId, passengerId } = req.params;

        await pool.query(
            'UPDATE TripPassengers SET Paid = ? WHERE TripID = ? AND PassengerID = ?',
            [paid, tripId, passengerId]
        );

        res.json({ success: true });
    } catch (err) {
        console.error('Error actualizando estado de pago:', err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/passengers/:id', async (req, res) => {
  const { DNI, Name, Birthdate, Phone } = req.body;
  try {
    // Primero verificamos si el DNI ya existe en otro pasajero
    const [existing] = await pool.query(
      'SELECT PassengerID FROM Passengers WHERE DNI = ? AND PassengerID != ?',
      [DNI, req.params.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Ya existe otro pasajero con este DNI' });
    }

    // Si no existe, actualizamos los datos
    await pool.query(
      `UPDATE Passengers 
       SET DNI = ?, 
           Name = ?, 
           Birthdate = ?, 
           Phone = ?
       WHERE PassengerID = ?`,
      [DNI, Name, Birthdate, Phone, req.params.id]
    );

    // Obtenemos los datos actualizados
    const [updated] = await pool.query(
      'SELECT * FROM Passengers WHERE PassengerID = ?',
      [req.params.id]
    );

    if (updated.length === 0) {
      return res.status(404).json({ error: 'Pasajero no encontrado' });
    }

    res.json(updated[0]);
  } catch (err) {
    console.error('Error actualizando pasajero:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ruta para manejar todas las demás solicitudes y servir la aplicación React
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  const localIP = getLocalIP();
  console.log(`Servidor corriendo en:`);
  console.log(`- Local: http://localhost:${port}`);
  console.log(`- Red local: http://${localIP}:${port}`);
});