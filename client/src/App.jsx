import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import DashboardClub from './pages/DashboardClub';
import DashboardFaculty from './pages/DashboardFaculty';

const DashboardStudent = () => <div className="container mt-5 pt-5"><h2 className="text-center">Student Dashboard</h2></div>;

function App() {
  return (
    <Router>
      <Navbar />
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard-club" element={<DashboardClub />} />
          <Route path="/dashboard-faculty" element={<DashboardFaculty />} />
          <Route path="/dashboard-student" element={<DashboardStudent />} />
          <Route path="/dashboard-admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
