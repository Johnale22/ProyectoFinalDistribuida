import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombres: '', apellidos: '', phone: '', sector: '', email: '', password: '' });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    if (!form.nombres || !form.apellidos || !form.email || !form.password) return alert("Completa los campos");

    const payload = {
      username: form.email,
      password: form.password,
      fullName: `${form.nombres} ${form.apellidos}`,
      phone: form.phone,
      sector: form.sector,
      role: 'STUDENT'
    };

    try {
      // ✅ GATEWAY: 8080/auth/register
      const res = await fetch('http://localhost:8080/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (data.success || res.ok) {
        alert('✅ Registro Exitoso. Inicia sesión.');
        navigate('/');
      } else {
        alert('❌ Error: ' + (data.message || 'Fallo en registro'));
      }
    } catch (e: any) {
      alert('❌ Error de conexión con API Gateway (8080)');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
       <header className="uce-header"><h1>Registro de Nuevo Usuario</h1><div className="uce-header-red-line"></div></header>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '600px' }}>
          <h3 style={{ color: '#004a87', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Información del Postulante</h3>
          <div style={{ display: 'grid', gap: '15px', marginTop:'20px' }}>
             <input name="nombres" placeholder="Nombres" onChange={handleChange} style={inputStyle} />
             <input name="apellidos" placeholder="Apellidos" onChange={handleChange} style={inputStyle} />
             <input name="email" type="email" placeholder="Correo (Usuario)" onChange={handleChange} style={inputStyle} />
             <input name="password" type="password" placeholder="Contraseña" onChange={handleChange} style={inputStyle} />
             <input name="phone" placeholder="Teléfono" onChange={handleChange} style={inputStyle} />
             <input name="sector" placeholder="Sector" onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button className="btn-primary" onClick={handleRegister}>Registrarse</button>
            <button onClick={() => navigate('/')} style={{ padding: '10px', background: 'white', border: '1px solid #ccc' }}>Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
};
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' };