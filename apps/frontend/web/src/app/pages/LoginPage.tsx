import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    console.log("Intentando conectar con Backend...");

    try {
      // ✅ CAMBIO CRÍTICO: Apuntamos al GATEWAY (8080), no al microservicio directo.
      // El Gateway recibirá '/auth/login', le quitará el '/auth' y lo enviará al puerto 3000 como '/login'.
      const res = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // Verificamos si la respuesta es válida antes de convertir a JSON
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status}`);
      }

      const data = await res.json();
      console.log("Respuesta del servidor:", data);

      if (data.access_token) {
        // Guardar credenciales
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('user', data.username);
        console.log("Rol recibido del backend:", data.role);
        
        // Redirigir según rol
        if (data.role === 'ADMIN') navigate('/admin');
        else if (data.role === 'STUDENT') navigate('/student');
        else if (data.role === 'TUTOR') navigate('/tutor');
        else if (data.role === 'COORDINATOR') navigate('/coordinator');
        else navigate('/student'); 
      } else {
        console.warn("Rol desconocido, enviando a student por defecto");
        navigate('/student'); // Si hay login pero no rol claro, mandamos a student para evitar bucles
      }

    } catch (e) {
      console.error("Error de Red:", e);
      // Mensaje actualizado para reflejar que usamos el puerto 8080
      alert('⚠️ No se pudo conectar con el sistema. Revisa si el API Gateway está encendido en el puerto 8080.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="uce-header">
        <div>
          <h1>Universidad Central del Ecuador</h1>
          <p style={{textAlign: 'center', fontSize: '0.9rem', margin: 0}}>SISTEMA DE VINCULACIÓN</p>
        </div>
        <div className="uce-header-red-line"></div>
      </header>

      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f6f9' }}>
        <div style={{ background: '#e0e0e0', padding: '40px', borderRadius: '8px', width: '400px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#333', textTransform: 'uppercase' }}>Iniciar Sesión</h2>
          
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{fontWeight: 'bold'}}>Usuario:</label>
            <input 
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="Ej. admin"
              value={username} onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{fontWeight: 'bold'}}>Contraseña:</label>
            <input 
              type="password"
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button className="btn-primary" onClick={handleLogin}>Ingresar</button>
        </div>
      </div>
    </div>
  );
};