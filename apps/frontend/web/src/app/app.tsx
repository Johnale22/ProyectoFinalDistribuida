import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { TutorDashboard } from './pages/TutorDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoordinatorDashboard } from './pages/CoordinatorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute'; // <--- Importamos al guardia

// Navbar Auxiliar (Mejorada para mostrar quién eres)
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem('userRole');

  if (location.pathname === '/') return null;

  const handleLogout = () => {
    localStorage.removeItem('userRole'); // Borramos credencial
    navigate('/'); // Mandamos al login
  };

  return (
    <nav style={{ background: '#333', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
      <div style={{ fontWeight: 'bold' }}>UCE Vinculación</div>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Mostramos solo el enlace que le corresponde a su rol */}
        <span style={{color: '#aaa', fontSize: '0.9em'}}>Hola, {role?.toUpperCase()}</span>
        <button onClick={handleLogout} style={{ background: '#ff6b6b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

// Componente Principal
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Ruta Pública */}
        <Route path="/" element={<LoginPage />} />

        {/* --- ZONA PROTEGIDA ESTUDIANTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
        </Route>

        {/* --- ZONA PROTEGIDA TUTORES --- */}
        <Route element={<ProtectedRoute allowedRoles={['tutor']} />}>
          <Route path="/tutor" element={<TutorDashboard />} />
        </Route>

        {/* --- ZONA PROTEGIDA COORDINADORES --- */}
        <Route element={<ProtectedRoute allowedRoles={['coordinator']} />}>
          <Route path="/coordinator" element={<CoordinatorDashboard />} />
        </Route>

        {/* --- ZONA PROTEGIDA ADMIN --- */}
        {/* El admin podría ver todo si quisieras, agregando más roles al array */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
};

export default App;