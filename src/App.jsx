import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Register from './Pages/Register';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* If someone goes to the base URL, send them to Login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Our three main pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}