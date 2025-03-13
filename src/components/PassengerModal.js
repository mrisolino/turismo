import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { passengerService } from '../services/passengerService';

const PassengerModal = ({ passenger, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    dni: '',
    name: '',
    birthdate: '',
    phone: ''
  });

  useEffect(() => {
    if (passenger) {
      setFormData({
        dni: passenger.DNI,
        name: passenger.Name,
        birthdate: passenger.Birthdate.split('T')[0],
        phone: passenger.Phone
      });
    }
  }, [passenger]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{7,8}$/.test(formData.dni)) {
      alert('DNI inválido (7-8 números)');
      return;
    }

    if (formData.name.length < 3) {
      alert('Nombre debe tener al menos 3 caracteres');
      return;
    }

    try {
      if (passenger) {
        await passengerService.updatePassenger(passenger.PassengerID, formData);
      } else {
        await passengerService.createPassenger(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error guardando pasajero:', error);
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

  const handleDNISearch = async () => {
    if (formData.dni.length < 7) return;

    try {
      const existingPassenger = await passengerService.searchByDNI(formData.dni);
      if (existingPassenger) {
        setFormData({
          dni: existingPassenger.DNI,
          name: existingPassenger.Name,
          birthdate: existingPassenger.Birthdate.split('T')[0],
          phone: existingPassenger.Phone
        });
      }
    } catch (error) {
      console.error('Error buscando pasajero:', error);
    }
  };

  return (
    <Modal show onHide={onClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          {passenger ? 'Editar Pasajero' : 'Nuevo Pasajero'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>DNI <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              onBlur={handleDNISearch}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha de Nacimiento <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Teléfono <span className="text-danger">*</span></Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
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

export default PassengerModal; 