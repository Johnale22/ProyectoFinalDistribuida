import { Navigate, Outlet } from 'react-router-dom';

interface Props {
  allowedRoles: string[]; // Ejemplo: ['admin', 'student']
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // Ojo: Esto viene del backend (ej: 'ADMIN')

  console.log(`🛡️ GUARDIA: Revisando acceso. Rol actual: '${userRole}'. Roles permitidos:`, allowedRoles);

  // 1. Si no hay token, fuera.
  if (!token || !userRole) {
    console.warn("⛔ No hay token o rol. Redirigiendo a Login.");
    return <Navigate to="/" replace />;
  }

  // 2. Normalizar a mayúsculas para evitar errores (admin vs ADMIN)
  const currentRoleUpper = userRole.toUpperCase();
  const allowedRolesUpper = allowedRoles.map(r => r.toUpperCase());

  // 3. Verificar si el rol está permitido
  if (!allowedRolesUpper.includes(currentRoleUpper)) {
    console.warn(`⛔ Acceso Denegado. El rol '${currentRoleUpper}' no está en la lista permitida.`);
    return <Navigate to="/" replace />; // O podrías mandarlo a una página "403 Unauthorized"
  }

  // 4. Si pasa, renderizar la página hija
  return <Outlet />;
};