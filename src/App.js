import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import UserProfile from './pages/userProfile/UserProfile';
import NavBar from './components/navBar/NavBar';
import ProjectStatusBanner from './components/ProjectStatusBanner/ProjectStatusBanner';
import PlatformMenu from './pages/platform/platformMenu/PlatformMenu';
import Students from './pages/platform/students/Students';
import Teachers from './pages/platform/teachers/Teachers';
import Groups from './pages/platform/groups/Groups';
import Sessions from './pages/platform/sessions/Sessions';
import Scores from './pages/platform/scores/Scores';
import Reports from './pages/platform/reports/Reports';
import MockExams from './pages/platform/mockExams/MockExams';
import Homeworks from './pages/platform/homeworks/Homeworks';
import Forms from './pages/platform/forms/Forms';
import EditForm from './pages/platform/editForm/EditForm';
import ResponsesViewer from './pages/platform/responsesViewer/ResponsesViewer';
import FormResponse from './pages/platform/formResponse/FormResponse';

function App() {
    return (
        <Router>
            <ProjectStatusBanner />
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
                    <Route path="/platform/mockExams" element={<MockExams />} />
                    <Route path="/platform/homeworks" element={<Homeworks />} />
                    <Route path="/platform/forms" element={<Forms />} />
                    <Route path="/platform/forms/edit/:formId" element={<EditForm />} />
                    <Route path="/forms/response/:formId" element={<FormResponse />} />
                    <Route path="/platform/forms/responses/:formId" element={<ResponsesViewer />} />
                    <Route path="/platform/reports" element={<Reports />} />
                    <Route path="*" element={<Navigate to="/platform" replace />} />
                </Routes>
            </section>
        </Router>
    );
}

export default App;
