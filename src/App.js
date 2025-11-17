import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login.jsx';
import UserProfile from './pages/userProfile/UserProfile.jsx';
import NavBar from './components/navBar/NavBar.jsx';
import ProjectStatusBanner from './components/projectStatusBanner/ProjectStatusBanner.jsx';
import PlatformMenu from './pages/platform/platformMenu/PlatformMenu.jsx';
import Students from './pages/platform/students/Students.jsx';
import Teachers from './pages/platform/teachers/Teachers.jsx';
import Groups from './pages/platform/groups/Groups.jsx';
import Sessions from './pages/platform/sessions/Sessions.jsx';
import Scores from './pages/platform/scores/Scores.jsx';
import Reports from './pages/platform/reports/Reports.jsx';
import MockExams from './pages/platform/mockExams/MockExams.jsx';
import Homeworks from './pages/platform/homeworks/Homeworks.jsx';
import Forms from './pages/platform/forms/Forms.jsx';
import EditForm from './pages/platform/editForm/EditForm.jsx';
import ResponsesViewer from './pages/platform/responsesViewer/ResponsesViewer.jsx';
import FormResponse from './pages/platform/formResponse/FormResponse.jsx';

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
                    <Route path="*" element={<Navigate to="/platform" />} />
                </Routes>
            </section>
        </Router>
    );
}

export default App;
