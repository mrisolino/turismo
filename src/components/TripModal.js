import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { tripService } from '../services/tripService';

const TripModal = ({ trip, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    destination: '',
    date: '',
    price: '',
    maxPassengers: ''
  });

  useEffect(() => {
    if (trip) {
      setFormData({
        destination: trip.Destination,
        date: trip.Date.split('T')[0],
        price: trip.Price,
        maxPassengers: trip.MaxPassengers
      });
    }
  }, [trip]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseFloat(formData.maxPassengers) < 1) {
      alert('La capacidad máxima debe ser al menos 1');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      alert('El precio debe ser mayor que 0');
      return;
    }

    try {
      if (trip) {
        await tripService.updateTrip(trip.TripID, formData);
      } else {
        await tripService.createTrip(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error guardando viaje:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Modal show onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {trip ? 'Editar Viaje' : 'Nuevo Viaje'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Destino <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Capacidad Máxima <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="number"
              name="maxPassengers"
              value={formData.maxPassengers}
              onChange={handleChange}
              min="1"
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Guardar
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default TripModal; 