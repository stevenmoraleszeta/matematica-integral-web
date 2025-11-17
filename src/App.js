import './App.css';
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/navBar/NavBar.jsx';

// Lazy load pages for better performance
const Login = lazy(() => import('./pages/auth/Login.jsx'));
const UserProfile = lazy(() => import('./pages/userProfile/UserProfile.jsx'));
const PlatformMenu = lazy(() => import('./pages/platform/platformMenu/PlatformMenu.jsx'));
const Students = lazy(() => import('./pages/platform/students/Students.jsx'));
const Teachers = lazy(() => import('./pages/platform/teachers/Teachers.jsx'));
const Groups = lazy(() => import('./pages/platform/groups/Groups.jsx'));
const Sessions = lazy(() => import('./pages/platform/sessions/Sessions.jsx'));
const Scores = lazy(() => import('./pages/platform/scores/Scores.jsx'));
const Reports = lazy(() => import('./pages/platform/reports/Reports.jsx'));
const MockExams = lazy(() => import('./pages/platform/mockExams/MockExams.jsx'));
const Homeworks = lazy(() => import('./pages/platform/homeworks/Homeworks.jsx'));
const Forms = lazy(() => import('./pages/platform/forms/Forms.jsx'));
const EditForm = lazy(() => import('./pages/platform/editForm/EditForm.jsx'));
const ResponsesViewer = lazy(() => import('./pages/platform/responsesViewer/ResponsesViewer.jsx'));
const FormResponse = lazy(() => import('./pages/platform/formResponse/FormResponse.jsx'));
const DataManagement = lazy(() => import('./pages/platform/dataManagement/DataManagement.jsx'));

const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
    }}>
        Cargando...
    </div>
);

function App() {
    return (
        <Router>
            <NavBar />
            <section className="app">
                <Suspense fallback={<LoadingFallback />}>
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
                        <Route path="/platform/data-management" element={<DataManagement />} />
                        <Route path="*" element={<Navigate to="/platform" replace />} />
                    </Routes>
                </Suspense>
            </section>
        </Router>
    );
}

export default App;
