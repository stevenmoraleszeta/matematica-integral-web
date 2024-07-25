import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx'
import UserProfile from './pages/userProfile/UserProfile.jsx';
import NavBar from './components/navBar/NavBar.jsx';
import PlatformMenu from './pages/platform/platformMenu/PlatformMenu.jsx';

function App() {
  return (
    <Router>
      <NavBar />
      <section className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/platform" element={<PlatformMenu />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </section>
    </Router>
  );
}

export default App;
