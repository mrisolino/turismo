import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import TripList from './components/TripList';
import PassengerList from './components/PassengerList';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const App = () => {
  return (
    <Router>
      <Navigation />
      <div className="container mt-4">
        <Routes>
          <Route path="/" element={<TripList />} />
          <Route path="/passengers" element={<PassengerList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App; 