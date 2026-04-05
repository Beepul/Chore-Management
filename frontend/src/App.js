import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './lib/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import HouseholdSetup from './pages/HouseholdSetup';
import Members from './pages/Members';
import InviteMemberPage from './pages/InviteMemberPage';
import Chores from './pages/Chores';
import CreateChorePage from './pages/CreateChorePage';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/setup-household" element={<ProtectedRoute><DashboardLayout><HouseholdSetup /></DashboardLayout></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><DashboardLayout><Members /></DashboardLayout></ProtectedRoute>} />
        <Route path="/members/invite" element={<ProtectedRoute><DashboardLayout><InviteMemberPage /></DashboardLayout></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute><DashboardLayout><Members /></DashboardLayout></ProtectedRoute>} />
        <Route path="/chores" element={<ProtectedRoute><DashboardLayout><Chores /></DashboardLayout></ProtectedRoute>} />
        <Route path="/chores/create" element={<ProtectedRoute><DashboardLayout><CreateChorePage /></DashboardLayout></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
