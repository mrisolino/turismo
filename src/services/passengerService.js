import axios from 'axios';
import { API_URL } from '../config';

export const passengerService = {
  getAllPassengers: async () => {
    const response = await axios.get(`${API_URL}/passengers`);
    return response.data;
  },

  getPassenger: async (id) => {
    const response = await axios.get(`${API_URL}/passengers/${id}`);
    return response.data;
  },

  searchPassengers: async (query) => {
    const response = await axios.get(`${API_URL}/passengers?search=${encodeURIComponent(query)}`);
    return response.data;
  },

  searchByDNI: async (dni) => {
    const response = await axios.get(`${API_URL}/passengers?dni=${dni}`);
    return response.data;
  },

  createPassenger: async (passengerData) => {
    const formattedData = {
      DNI: passengerData.dni,
      Name: passengerData.name,
      Birthdate: passengerData.birthdate,
      Phone: passengerData.phone
    };
    const response = await axios.post(`${API_URL}/passengers`, formattedData);
    return response.data;
  },

  updatePassenger: async (id, passengerData) => {
    const formattedData = {
      DNI: passengerData.dni,
      Name: passengerData.name,
      Birthdate: passengerData.birthdate,
      Phone: passengerData.phone
    };
    const response = await axios.put(`${API_URL}/passengers/${id}`, formattedData);
    return response.data;
  },

  deletePassenger: async (id) => {
    await axios.delete(`${API_URL}/passengers/${id}`);
  },

  createAndAssign: async (tripId, passengerData) => {
    const formattedData = {
      action: 'create-and-assign',
      DNI: passengerData.dni,
      Name: passengerData.name,
      Birthdate: passengerData.birthdate,
      Phone: passengerData.phone,
      paid: passengerData.paid
    };
    const response = await axios.post(`${API_URL}/trips/${tripId}/passengers`, formattedData);
    return response.data;
  }
}; 