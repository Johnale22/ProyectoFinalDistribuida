import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';

// Si no tienes creados Tutor/Coordinator Dashboard aún, usa StudentDashboard temporalmente
// o crea archivos vacíos para que no dé error.
import { TutorDashboard } from './pages/TutorDashboard'; 
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN (Página Principal) */}
        <Route path="/" element={<LoginPage />} />

        {/* ADMIN */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        {/* ESTUDIANTE */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* TUTOR */}
        <Route element={<ProtectedRoute allowedRoles={['TUTOR', 'tutor']} />}>
          <Route path="/tutor" element={<TutorDashboard />} />
        </Route>

        {/* COORDINADOR */}
        <Route element={<ProtectedRoute allowedRoles={['COORDINATOR', 'coordinator']} />}>
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;