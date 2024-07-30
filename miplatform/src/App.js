import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx'
import UserProfile from './pages/userProfile/UserProfile.jsx';
import NavBar from './components/navBar/NavBar.jsx';
import PlatformMenu from './pages/platform/platformMenu/PlatformMenu.jsx';
import Students from './pages/platform/students/Students.jsx';
import Teachers from './pages/platform/teachers/Teachers.jsx';
import Groups from './pages/platform/groups/Groups.jsx';
import Sessions from './pages/platform/sessions/Sessions.jsx';
import Scores from './pages/platform/scores/Scores.jsx';
import Reports from './pages/platform/reports/Reports.jsx';

function App() {
  //TODO Añadir la comprobación de inicio de sesión en todos los componentes
  return (
    <Router>
      <NavBar />
      <section className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/platform" element={<PlatformMenu />} />
          <Route path="/platform/students" element={<Students />} />
          <Route path="/platform/teachers" element={<Teachers />} />
          <Route path="/platform/groups" element={<Groups />} />
          <Route path="/platform/sessions" element={<Sessions />} />
          <Route path="/platform/scores" element={<Scores />} />
          <Route path="/platform/reports" element={<Reports />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </section>
    </Router>
  );
}

export default App;
