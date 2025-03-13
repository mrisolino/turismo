import axios from 'axios';
import { API_URL } from '../config';

export const tripService = {
  getAllTrips: async () => {
    const response = await axios.get(`${API_URL}/trips`);
    return response.data;
  },

  getTrip: async (id) => {
    const response = await axios.get(`${API_URL}/trips/${id}`);
    return response.data;
  },

  createTrip: async (tripData) => {
    const response = await axios.post(`${API_URL}/trips`, tripData);
    return response.data;
  },

  updateTrip: async (id, tripData) => {
    const response = await axios.put(`${API_URL}/trips/${id}`, tripData);
    return response.data;
  },

  deleteTrip: async (id) => {
    await axios.delete(`${API_URL}/trips/${id}`);
  },

  getTripPassengers: async (tripId) => {
    const response = await axios.get(`${API_URL}/trips/${tripId}/passengers`);
    return response.data;
  },

  assignPassenger: async (tripId, passengerId, paid) => {
    const response = await axios.post(`${API_URL}/trips/${tripId}/passengers`, {
      passengerId,
      paid
    });
    return response.data;
  },

  removePassenger: async (tripId, passengerId) => {
    await axios.delete(`${API_URL}/trips/${tripId}/passengers/${passengerId}`);
  },

  updatePaymentStatus: async (tripId, passengerId, paid) => {
    const response = await axios.put(
      `${API_URL}/trips/${tripId}/passengers/${passengerId}/payment`,
      { paid }
    );
    return response.data;
  }
}; 