import React, { useState, useEffect } from 'react';
import { Table, Button } from 'react-bootstrap';
import { passengerService } from '../services/passengerService';
import PassengerModal from './PassengerModal';

const PassengerList = () => {
  const [passengers, setPassengers] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPassengers();
  }, []);

  const loadPassengers = async () => {
    try {
      const data = await passengerService.getAllPassengers();
      setPassengers(data);
    } catch (error) {
      console.error('Error cargando pasajeros:', error);
      alert('Error al cargar pasajeros');
    }
  };

  const handleEditPassenger = (passenger) => {
    setSelectedPassenger(passenger);
    setShowModal(true);
  };

  const handleDeletePassenger = async (passengerId) => {
    if (!window.confirm('¿Estás seguro de eliminar este pasajero?')) return;

    try {
      await passengerService.deletePassenger(passengerId);
      await loadPassengers();
    } catch (error) {
      console.error('Error eliminando pasajero:', error);
      alert('Error al eliminar pasajero');
    }
  };

  const handlePassengerSaved = async () => {
    await loadPassengers();
    setShowModal(false);
    setSelectedPassenger(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Todos los Pasajeros</h2>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedPassenger(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i> Nuevo Pasajero
        </Button>
      </div>

      <div className="table-responsive">
        <Table hover>
          <thead className="table-light">
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Nacimiento</th>
              <th>Teléfono</th>
              <th className="text-center">Viajes Realizados</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {passengers.map(passenger => (
              <tr key={passenger.PassengerID}>
                <td>{passenger.Name}</td>
                <td>{passenger.DNI}</td>
                <td>{new Date(passenger.Birthdate).toLocaleDateString('es-AR')}</td>
                <td>{passenger.Phone}</td>
                <td className="text-center">{passenger.TripCount}</td>
                <td className="text-center">
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEditPassenger(passenger)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeletePassenger(passenger.PassengerID)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {showModal && (
        <PassengerModal
          passenger={selectedPassenger}
          onClose={() => {
            setShowModal(false);
            setSelectedPassenger(null);
          }}
          onSave={handlePassengerSaved}
        />
      )}
    </div>
  );
};

export default PassengerList; 