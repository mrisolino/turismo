import React, { useState, useEffect } from 'react';
import { Modal, Button, Table, Badge } from 'react-bootstrap';
import { tripService } from '../services/tripService';
import AssignPassengerModal from './AssignPassengerModal';

const PassengersModal = ({ trip, onClose, onUpdate }) => {
  const [passengers, setPassengers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    loadPassengers();
  }, [trip]);

  const loadPassengers = async () => {
    try {
      const data = await tripService.getTripPassengers(trip.TripID);
      setPassengers(data);
    } catch (error) {
      console.error('Error cargando pasajeros:', error);
      alert('Error al cargar pasajeros');
    }
  };

  const handleRemovePassenger = async (passengerId) => {
    if (!window.confirm('¿Estás seguro de eliminar este pasajero del viaje?')) return;

    try {
      await tripService.removePassenger(trip.TripID, passengerId);
      await loadPassengers();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error eliminando pasajero:', error);
      alert('Error al eliminar pasajero');
    }
  };

  const handleTogglePayment = async (passengerId, currentPaid) => {
    try {
      await tripService.updatePaymentStatus(trip.TripID, passengerId, !currentPaid);
      await loadPassengers();
    } catch (error) {
      console.error('Error actualizando estado de pago:', error);
      alert('Error al actualizar estado de pago');
    }
  };

  const handlePassengerAssigned = async () => {
    await loadPassengers();
    if (onUpdate) onUpdate();
    setShowAssignModal(false);
  };

  return (
    <>
      <Modal show onHide={onClose} size="xl">
        <Modal.Header closeButton>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title>
              Pasajeros del Viaje: {trip.Destination} ({new Date(trip.Date).toLocaleDateString('es-AR')})
            </Modal.Title>
            <Button
              variant="success"
              size="sm"
              onClick={() => setShowAssignModal(true)}
            >
              Agregar Pasajero
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <Table hover responsive>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Nacimiento</th>
                <th>Teléfono</th>
                <th>Estado Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {passengers.map(passenger => (
                <tr key={passenger.PassengerID}>
                  <td>{passenger.Name}</td>
                  <td>{passenger.DNI}</td>
                  <td>{new Date(passenger.Birthdate).toLocaleDateString('es-AR')}</td>
                  <td>{passenger.Phone}</td>
                  <td>
                    <Badge
                      bg={passenger.Paid ? 'success' : 'danger'}
                      className="clickable"
                      onClick={() => handleTogglePayment(passenger.PassengerID, passenger.Paid)}
                      style={{ cursor: 'pointer' }}
                    >
                      {passenger.Paid ? 'Pagado' : 'Pendiente'}
                    </Badge>
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemovePassenger(passenger.PassengerID)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
      </Modal>

      {showAssignModal && (
        <AssignPassengerModal
          trip={trip}
          onClose={() => setShowAssignModal(false)}
          onAssign={handlePassengerAssigned}
        />
      )}
    </>
  );
};

export default PassengersModal; 