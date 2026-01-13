import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Datos estáticos para listas desplegables
const FACULTADES: any = {
  "Ingeniería y Ciencias Aplicadas": ["Sistemas de Información", "Computación", "Diseño Industrial", "Civil"],
  "Ciencias Administrativas": ["Administración de Empresas", "Contabilidad y Auditoría", "Finanzas"],
  "Filosofía y Letras": ["Pedagogía", "Psicología Educativa", "Idiomas"],
  "Ciencias Médicas": ["Medicina", "Enfermería", "Obstetricia"]
};

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'ADMIN';
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'monitor', 'audit'
  
  // Estado del Formulario
  const [newUser, setNewUser] = useState({
    cedula: '', nombres: '', apellidos: '', email: '', 
    facultad: '', carrera: '', telefono: '', barrio: '', role: 'STUDENT'
  });

  const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);

  // Manejo de cambios en el formulario
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });

    // Lógica para Facultad -> Carrera
    if (name === 'facultad') {
      setCarrerasDisponibles(FACULTADES[value] || []);
      setNewUser(prev => ({ ...prev, facultad: value, carrera: '' })); // Reset carrera
    }
  };

  const handleCreateUser = async () => {
    // Aquí iría la validación de campos vacíos
    if(!newUser.cedula || !newUser.nombres) return alert("Complete los campos obligatorios");

    try {
      const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
           username: newUser.cedula, // Usamos cédula como usuario
           password: newUser.cedula, // Pass temporal = cédula
           fullName: `${newUser.nombres} ${newUser.apellidos}`,
           ...newUser 
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Usuario creado. Credenciales enviadas al correo.');
        setNewUser({ cedula: '', nombres: '', apellidos: '', email: '', facultad: '', carrera: '', telefono: '', barrio: '', role: 'STUDENT' }); 
      } else {
        alert('Error: ' + data.message);
      }
    } catch (e) { alert('Error de conexión'); }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="DIRECCIÓN DE TECNOLOGÍAS (DTIC)" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="👥 Gestión Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <NavButton label="📡 Estado Microservicios" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
        <NavButton label="📜 Registro Eventos" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* === USUARIOS === */}
        {activeTab === 'users' && (
           <div>
             <SectionTitle title="Registro de Nuevo Usuario" />
             <div style={cardStyle}>
                <p style={{color:'#666', marginBottom:'20px'}}>Complete la ficha técnica del usuario.</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <input name="cedula" placeholder="Cédula (Usuario)" value={newUser.cedula} onChange={handleChange} style={inputStyle} />
                    <input name="nombres" placeholder="Nombres" value={newUser.nombres} onChange={handleChange} style={inputStyle} />
                    <input name="apellidos" placeholder="Apellidos" value={newUser.apellidos} onChange={handleChange} style={inputStyle} />
                    
                    <input name="email" type="email" placeholder="Correo Institucional" value={newUser.email} onChange={handleChange} style={inputStyle} />
                    <input name="telefono" placeholder="Teléfono" value={newUser.telefono} onChange={handleChange} style={inputStyle} />
                    <input name="barrio" placeholder="Barrio / Sector Domicilio" value={newUser.barrio} onChange={handleChange} style={inputStyle} />

                    <select name="facultad" value={newUser.facultad} onChange={handleChange} style={inputStyle}>
                        <option value="">-- Seleccione Facultad --</option>
                        {Object.keys(FACULTADES).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <select name="carrera" value={newUser.carrera} onChange={handleChange} style={inputStyle} disabled={!newUser.facultad}>
                        <option value="">-- Seleccione Carrera --</option>
                        {carrerasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select name="role" value={newUser.role} onChange={handleChange} style={inputStyle}>
                        <option value="STUDENT">Rol: Estudiante</option>
                        <option value="TUTOR">Rol: Tutor</option>
                        <option value="COORDINATOR">Rol: Coordinador</option>
                        <option value="ADMIN">Rol: Admin</option>
                    </select>
                </div>
                <button onClick={handleCreateUser} style={primaryBtnStyle}>+ Crear Usuario</button>
             </div>
           </div>
        )}

        {/* === MONITOREO === */}
        {activeTab === 'monitor' && (
          <div>
            <SectionTitle title="Estado de Microservicios (Health Check)" />
            <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:'20px'}}>
                <ServiceStatus name="Auth Service" port="3000" active={true} />
                <ServiceStatus name="Project Service" port="3001" active={true} />
                <ServiceStatus name="Enrollment" port="3002" active={false} />
                <ServiceStatus name="Audit Service" port="3003" active={true} />
                <ServiceStatus name="Reporting" port="3004" active={true} />
                <ServiceStatus name="Notification" port="3005" active={true} />
                <ServiceStatus name="Location" port="3006" active={true} />
                <ServiceStatus name="Validation" port="5000" active={true} type="gRPC" />
                <ServiceStatus name="Agreement" port="3008" active={false} />
                <ServiceStatus name="Storage" port="3009" active={true} />
            </div>
          </div>
        )}

        {/* === EVENTOS === */}
        {activeTab === 'audit' && (
            <div>
                <SectionTitle title="Logs de Eventos (Audit Service)" />
                <div style={cardStyle}>
                    <table style={{width:'100%', fontSize:'14px'}}>
                        <thead><tr style={{textAlign:'left', borderBottom:'1px solid #ddd'}}><th style={{padding:'10px'}}>Fecha</th><th>Servicio</th><th>Evento</th><th>Usuario</th></tr></thead>
                        <tbody>
                            <tr><td style={{padding:'10px'}}>12/01 10:05</td><td>Auth</td><td>LOGIN_SUCCESS</td><td>admin</td></tr>
                            <tr><td style={{padding:'10px'}}>12/01 10:10</td><td>Project</td><td>CREATE_PROJECT</td><td>tutor1</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---
const ServiceStatus = ({name, port, active, type = 'HTTP'}: any) => (
    <div style={{background:'white', padding:'20px', borderRadius:'4px', borderTop: active ? '4px solid #28a745' : '4px solid #dc3545', boxShadow:'0 2px 5px rgba(0,0,0,0.1)'}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
            <strong>{name}</strong>
            <small style={{background:'#eee', padding:'2px 5px', borderRadius:'3px'}}>{type}</small>
        </div>
        <div style={{fontSize:'12px', color:'#666', margin:'5px 0'}}>Puerto: {port}</div>
        <div style={{color: active?'#28a745':'#dc3545', fontWeight:'bold'}}>{active ? 'ONLINE' : 'OFFLINE'}</div>
    </div>
);
const Header = ({ user, logout, subtitle }: any) => (
  <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div>
      <div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}>
        <h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2>
        <small style={{ color: '#666' }}>{subtitle}</small>
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}>
      <span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span>
      <button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
    </div>
  </div>
);
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Administración UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fcfcfc', width: '100%' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };