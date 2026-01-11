import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();

  const handleLogin = (role: string) => {
    // Aquí guardaríamos el token JWT real en el futuro
    localStorage.setItem('userRole', role);
    
    // Redireccionar según el rol
    if (role === 'student') navigate('/student');
    if (role === 'tutor') navigate('/tutor');
    if (role === 'coordinator') navigate('/coordinator');
    if (role === 'admin') navigate('/admin');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center' }}>
        <h1 style={{ color: '#0056b3' }}>🔐 Acceso UCE</h1>
        <p>Selecciona tu rol para ingresar:</p>
        
        <div style={{ display: 'grid', gap: '15px', marginTop: '20px' }}>
          <button onClick={() => handleLogin('student')} style={btnStyle('#28a745')}>Soy Estudiante</button>
          <button onClick={() => handleLogin('tutor')} style={btnStyle('#007bff')}>Soy Tutor</button>
          <button onClick={() => handleLogin('coordinator')} style={btnStyle('#ffc107', 'black')}>Soy Coordinador</button>
          <button onClick={() => handleLogin('admin')} style={btnStyle('#343a40')}>Soy Administrador</button>
        </div>
      </div>
    </div>
  );
};

const btnStyle = (bg: string, color = 'white') => ({
  padding: '12px 20px', background: bg, color, border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold'
});