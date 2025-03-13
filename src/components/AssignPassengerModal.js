import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Card, Nav } from 'react-bootstrap';
import { tripService } from '../services/tripService';
import { passengerService } from '../services/passengerService';

const AssignPassengerModal = ({ trip, onClose, onAssign }) => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPassenger, setSelectedPassenger] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignedPassengers, setAssignedPassengers] = useState([]);
  const [newPassenger, setNewPassenger] = useState({
    dni: '',
    name: '',
    birthdate: '',
    phone: '',
    paid: false
  });

  // Cargar pasajeros asignados al montar el componente
  useEffect(() => {
    loadAssignedPassengers();
  }, [trip]);

  const loadAssignedPassengers = async () => {
    try {
      const assigned = await tripService.getTripPassengers(trip.TripID);
      setAssignedPassengers(assigned);
    } catch (error) {
      console.error('Error cargando pasajeros asignados:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await passengerService.searchPassengers(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando pasajeros:', error);
      alert('Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPassenger = (passenger) => {
    // No permitir seleccionar pasajeros ya asignados
    const isAssigned = assignedPassengers.some(
      assigned => assigned.PassengerID === passenger.PassengerID || 
                 assigned.DNI === passenger.DNI
    );
    if (!isAssigned) {
      setSelectedPassenger(passenger);
    }
  };

  const isPassengerAssigned = (passenger) => {
    return assignedPassengers.some(
      assigned => assigned.PassengerID === passenger.PassengerID || 
                 assigned.DNI === passenger.DNI
    );
  };

  const handleAssign = async () => {
    try {
      if (activeTab === 'search') {
        if (!selectedPassenger) {
          alert('Selecciona un pasajero primero');
          return;
        }

        // Verificar si el pasajero ya está asignado al viaje
        const isPassengerAssigned = assignedPassengers.some(
          assigned => 
            assigned.PassengerID === selectedPassenger.PassengerID ||
            assigned.DNI === selectedPassenger.DNI
        );

        if (isPassengerAssigned) {
          alert('Este pasajero ya está asignado al viaje');
          return;
        }

        await tripService.assignPassenger(
          trip.TripID,
          selectedPassenger.PassengerID,
          false
        );
      } else {
        if (!validateNewPassenger()) return;
        
        // Verificar si el DNI ya está asignado al viaje
        const isDNIAssigned = assignedPassengers.some(
          passenger => passenger.DNI === newPassenger.dni
        );
        
        if (isDNIAssigned) {
          alert('Este pasajero ya está asignado al viaje');
          return;
        }
        
        await passengerService.createAndAssign(trip.TripID, newPassenger);
      }
      onAssign();
    } catch (error) {
      console.error('Error asignando pasajero:', error);
      alert('Error al asignar pasajero');
    }
  };

  const validateNewPassenger = () => {
    if (!/^\d{7,8}$/.test(newPassenger.dni)) {
      alert('DNI inválido (7-8 números)');
      return false;
    }
    if (newPassenger.name.length < 3) {
      alert('Nombre debe tener al menos 3 caracteres');
      return false;
    }
    if (!newPassenger.birthdate) {
      alert('Fecha de nacimiento requerida');
      return false;
    }
    return true;
  };

  const handleNewPassengerChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewPassenger(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Modal show onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Asignar Pasajero al Viaje</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Nav className="nav-tabs mb-3">
          <Nav.Item>
            <Button
              variant={activeTab === 'search' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveTab('search')}
              className="me-2"
            >
              Buscar Existente
            </Button>
          </Nav.Item>
          <Nav.Item>
            <Button
              variant={activeTab === 'new' ? 'success' : 'outline-success'}
              onClick={() => setActiveTab('new')}
            >
              Crear Nuevo
            </Button>
          </Nav.Item>
        </Nav>

        {activeTab === 'search' ? (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Buscar por DNI o Nombre</Form.Label>
              <Form.Control
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                placeholder="Ingresa DNI o nombre..."
              />
            </Form.Group>

            <div className="search-results" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {loading ? (
                <p className="text-center">Buscando...</p>
              ) : searchResults.length > 0 ? (
                <div className="row g-3">
                  {searchResults.map(passenger => {
                    const assigned = isPassengerAssigned(passenger);
                    return (
                      <div key={passenger.PassengerID} className="col-md-6">
                        <Card
                          className={`h-100 ${
                            assigned ? 'border-success bg-success bg-opacity-10' :
                            selectedPassenger?.PassengerID === passenger.PassengerID ? 'border-primary selected' : ''
                          }`}
                          onClick={() => handleSelectPassenger(passenger)}
                          style={{ cursor: assigned ? 'default' : 'pointer' }}
                        >
                          <Card.Body>
                            <Card.Title>
                              {passenger.Name}
                              {assigned && (
                                <span className="ms-2 text-white">

                                  <i className="fas fa-check-circle"></i> Ya asignado
                                </span>
                              )}
                            </Card.Title>
                            <Card.Text>
                              <strong>DNI:</strong> {passenger.DNI}<br />
                              <strong>Teléfono:</strong> {passenger.Phone}<br />
                              <strong>Nacimiento:</strong> {new Date(passenger.Birthdate).toLocaleDateString('es-AR')}
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery && (
                <p className="text-center text-muted">No se encontraron resultados</p>
              )}
            </div>
          </>
        ) : (
          <Form>
            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="dni"
                    value={newPassenger.dni}
                    onChange={handleNewPassengerChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={newPassenger.name}
                    onChange={handleNewPassengerChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="birthdate"
                    value={newPassenger.birthdate}
                    onChange={handleNewPassengerChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={newPassenger.phone}
                    onChange={handleNewPassengerChange}
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Check
                  type="checkbox"
                  name="paid"
                  label="Pagado"
                  checked={newPassenger.paid}
                  onChange={handleNewPassengerChange}
                />
              </div>
            </div>
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleAssign}>
          Asignar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AssignPassengerModal; 