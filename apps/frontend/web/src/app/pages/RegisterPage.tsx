import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    phone: '',
    sector: '',
    email: '',   // Esto será el username
    password: ''
  });

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    // Validación simple
    if (!form.nombres || !form.apellidos || !form.email || !form.password || !form.sector) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    // Unimos nombres y apellidos para enviarlo al backend como fullName
    const payload = {
      username: form.email,
      password: form.password,
      fullName: `${form.nombres} ${form.apellidos}`,
      phone: form.phone,
      sector: form.sector,
      role: 'STUDENT' // Por defecto
    };

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Registro Exitoso. Ahora inicia sesión.');
        navigate('/');
      } else {
        alert('❌ Error: ' + (data.message || 'No se pudo registrar'));
      }
    } catch (e) {
      alert('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6f9', display: 'flex', flexDirection: 'column' }}>
       {/* HEADER INSTITUCIONAL */}
       <header className="uce-header">
        <h1>Registro de Nuevo Usuario</h1>
        <div className="uce-header-red-line"></div>
      </header>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', paddingBottom: '40px' }}>
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', width: '600px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          
          <h3 style={{ color: '#004a87', borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
            Información del Postulante
          </h3>
          
          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Nombres *</label>
                <input name="nombres" onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Apellidos *</label>
                <input name="apellidos" onChange={handleChange} style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Correo Electrónico (Usuario) *</label>
              <input name="email" type="email" onChange={handleChange} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Contraseña *</label>
              <input name="password" type="password" onChange={handleChange} style={inputStyle} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <label style={labelStyle}>Teléfono / Celular</label>
                <input name="phone" onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Sector de Domicilio</label>
                <input name="sector" onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
            <button className="btn-primary" onClick={handleRegister}>Registrarse</button>
            <button 
              onClick={() => navigate('/')} 
              style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', color: '#555' }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333', fontWeight: 500 };
const inputStyle = { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', fontSize: '14px' };