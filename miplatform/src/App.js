import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import UserProfile from './components/userProfile/UserProfile.jsx';
import NavBar from './components/navBar/NavBar.jsx';

function App() {
  return (
    <Router>
      <NavBar />
      <section className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </section>
    </Router>
  );
}

export default App;
