import { Navigate, Outlet } from 'react-router-dom';

interface Props {
  allowedRoles: string[]; // Lista de roles permitidos (ej. ['tutor', 'admin'])
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  // 1. Leemos quién es el usuario actual
  const userRole = localStorage.getItem('userRole');

  // 2. Si no ha iniciado sesión, lo mandamos al Login
  if (!userRole) {
    return <Navigate to="/" replace />;
  }

  // 3. Si tiene un rol, pero NO es el permitido (ej. Estudiante queriendo entrar a Tutor)
  if (!allowedRoles.includes(userRole)) {
    alert('⛔ ACCESO DENEGADO: No tienes permisos para ver esta página.');
    // Lo devolvemos a su panel correspondiente según su rol real
    if (userRole === 'student') return <Navigate to="/student" replace />;
    if (userRole === 'tutor') return <Navigate to="/tutor" replace />;
    return <Navigate to="/" replace />;
  }

  // 4. Si pasa todas las pruebas, ¡Adelante! Renderiza la página hija
  return <Outlet />;
};