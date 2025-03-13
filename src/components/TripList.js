import React, { useState, useEffect } from 'react';
import { tripService } from '../services/tripService';
import TripModal from './TripModal';
import PassengersModal from './PassengersModal';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showTripModal, setShowTripModal] = useState(false);
  const [showPassengersModal, setShowPassengersModal] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const data = await tripService.getAllTrips();
      setTrips(data);
    } catch (error) {
      console.error('Error cargando viajes:', error);
      alert('Error al cargar viajes');
    }
  };

  const handleEditTrip = (e, trip) => {
    e.stopPropagation();
    setSelectedTrip(trip);
    setShowTripModal(true);
  };

  const handleDeleteTrip = async (e, tripId) => {
    e.stopPropagation();
    if (!window.confirm('¿Estás seguro de eliminar este viaje?')) return;
    
    try {
      await tripService.deleteTrip(tripId);
      loadTrips();
    } catch (error) {
      console.error('Error eliminando viaje:', error);
      alert('Error al eliminar viaje');
    }
  };

  const handleShowPassengers = (trip) => {
    setSelectedTrip(trip);
    setShowPassengersModal(true);
  };

  const handleTripSaved = () => {
    loadTrips();
    setShowTripModal(false);
    setSelectedTrip(null);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Listado de Viajes</h2>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setSelectedTrip(null);
            setShowTripModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i> Nuevo Viaje
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Destino</th>
              <th>Fecha</th>
              <th>Disponibilidad</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {trips.map(trip => {
              const percentage = Math.min(
                (trip.CurrentPassengers / trip.MaxPassengers * 100),
                100
              ).toFixed(1);
              
              const progressColor = percentage >= 90 ? 'bg-danger' :
                                  percentage >= 75 ? 'bg-warning' : 'bg-success';

              return (
                <tr 
                  key={trip.TripID}
                  className="clickable"
                  onClick={() => handleShowPassengers(trip)}
                >
                  <td>{trip.Destination}</td>
                  <td>{new Date(trip.Date).toLocaleDateString('es-AR')}</td>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="progress flex-grow-1" style={{ height: '20px' }}>
                        <div
                          className={`progress-bar ${progressColor}`}
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>
                      <div>{trip.CurrentPassengers}/{trip.MaxPassengers}</div>
                    </div>
                  </td>
                  <td>${parseFloat(trip.Price).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-warning me-2"
                      onClick={(e) => handleEditTrip(e, trip)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => handleDeleteTrip(e, trip.TripID)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showTripModal && (
        <TripModal
          trip={selectedTrip}
          onClose={() => {
            setShowTripModal(false);
            setSelectedTrip(null);
          }}
          onSave={handleTripSaved}
        />
      )}

      {showPassengersModal && selectedTrip && (
        <PassengersModal
          trip={selectedTrip}
          onClose={() => {
            setShowPassengersModal(false);
            setSelectedTrip(null);
          }}
          onUpdate={loadTrips}
        />
      )}
    </div>
  );
};

export default TripList; 