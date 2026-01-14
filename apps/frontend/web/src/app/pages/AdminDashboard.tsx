import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Asegúrate que esta ruta sea correcta

// Datos estáticos
const FACULTADES: any = {
  "Ingeniería y Ciencias Aplicadas": ["Sistemas de Información", "Computación", "Diseño Industrial"],
  "Ciencias Administrativas": ["Administración de Empresas", "Contabilidad", "Finanzas"],
  "Arquitectura y Urbanismo": ["Arquitectura", "Artes"]
};

const SEMESTRES = ["Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'ADMIN';
  
  // Agregamos 'audit' a las pestañas disponibles
  const [activeTab, setActiveTab] = useState('users');
  
  // Estado para guardar los logs de auditoría
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const [newUser, setNewUser] = useState({
    cedula: '', nombres: '', apellidos: '', email: '', 
    facultad: '', carrera: '', telefono: '', barrio: '', 
    role: 'STUDENT', semester: ''
  });

  const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);

  // --- NUEVO: Cargar logs cuando se entra a la pestaña 'audit' ---
  useEffect(() => {
    if (activeTab === 'audit') {
        // Llama al Gateway (8080) -> Audit Service (3005) -> Redis
        api.get('/audit')
           .then(res => setAuditLogs(res.data))
           .catch(err => console.error("Error cargando auditoría:", err));
    }
  }, [activeTab]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });

    if (name === 'facultad') {
      setCarrerasDisponibles(FACULTADES[value] || []);
      setNewUser(prev => ({ ...prev, facultad: value, carrera: '' }));
    }
  };

  const handleCreateUser = async () => {
    if(!newUser.cedula || !newUser.nombres) return alert("Complete los campos obligatorios");

    const payload = {
        username: newUser.cedula,
        fullName: `${newUser.nombres} ${newUser.apellidos}`,
        email: newUser.email,
        phone: newUser.telefono,
        address: newUser.barrio,
        role: newUser.role,
        semester: newUser.semester,
        faculty: newUser.facultad, 
        career: newUser.carrera    
    };

    try {
      // Usamos api del Gateway
      const res = await api.post('/auth/register', payload);
      
      // Nota: Axios devuelve la respuesta en .data, fetch en .json()
      // Si usas tu instancia 'api' (axios), usa res.data.success
      // Si el api/axios.js devuelve response.data directamente, ajusta aquí.
      const data = res.data; 

      if (data.success || data.username) { // Ajuste por si el backend devuelve el objeto creado
        alert(`✅ Usuario creado: ${newUser.cedula}\n🔑 Contraseña por defecto: ${newUser.cedula}`);
        setNewUser({ cedula: '', nombres: '', apellidos: '', email: '', facultad: '', carrera: '', telefono: '', barrio: '', role: 'STUDENT', semester: '' }); 
      } else {
        alert('Error: ' + (data.message || 'No se pudo crear'));
      }
    } catch (e) { alert('Error de conexión'); }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="DIRECCIÓN DE TECNOLOGÍAS (DTIC)" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="👥 Gestión Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <NavButton label="👁️ Auditoría del Sistema" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
        <NavButton label="📡 Estado Microservicios" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* PESTAÑA: USUARIOS */}
        {activeTab === 'users' && (
           <div>
             <SectionTitle title="Registro de Nuevo Usuario" />
             <div style={cardStyle}>
                <div style={{background:'#e3f2fd', padding:'10px 15px', borderRadius:'4px', marginBottom:'20px', borderLeft:'4px solid #2196f3', color:'#0d47a1'}}>
                    <strong>ℹ️ Nota:</strong> La contraseña se generará automáticamente igual al número de <strong>Cédula</strong>.
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <input name="cedula" placeholder="Cédula (Usuario)" value={newUser.cedula} onChange={handleChange} style={inputStyle} />
                    <input name="nombres" placeholder="Nombres" value={newUser.nombres} onChange={handleChange} style={inputStyle} />
                    <input name="apellidos" placeholder="Apellidos" value={newUser.apellidos} onChange={handleChange} style={inputStyle} />
                    
                    <input name="email" type="email" placeholder="Correo Institucional" value={newUser.email} onChange={handleChange} style={inputStyle} />
                    <input name="telefono" placeholder="Teléfono" value={newUser.telefono} onChange={handleChange} style={inputStyle} />
                    <input name="barrio" placeholder="Barrio / Sector" value={newUser.barrio} onChange={handleChange} style={inputStyle} />

                    <select name="facultad" value={newUser.facultad} onChange={handleChange} style={inputStyle}>
                        <option value="">-- Facultad --</option>
                        {Object.keys(FACULTADES).map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <select name="carrera" value={newUser.carrera} onChange={handleChange} style={inputStyle} disabled={!newUser.facultad}>
                        <option value="">-- Carrera --</option>
                        {carrerasDisponibles.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>

                    <select name="semester" value={newUser.semester} onChange={handleChange} style={inputStyle}>
                        <option value="">-- Semestre --</option>
                        {SEMESTRES.map(s => <option key={s} value={s}>{s}</option>)}
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

        {/* PESTAÑA: AUDITORÍA (NUEVA) */}
        {activeTab === 'audit' && (
          <div>
            <SectionTitle title="Registro de Eventos (Base de Datos Redis)" />
            <div style={cardStyle}>
                {auditLogs.length === 0 ? (
                    <div style={{textAlign:'center', padding:'20px', color:'#666'}}>
                        <p>⏳ No hay registros de auditoría o no se ha conectado a Redis.</p>
                    </div>
                ) : (
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                        <thead>
                            <tr style={{background:'#f8f9fa', borderBottom:'2px solid #dee2e6', textAlign:'left'}}>
                                <th style={{padding:'12px', color:'#444'}}>Fecha / Hora</th>
                                <th style={{padding:'12px', color:'#444'}}>Usuario</th>
                                <th style={{padding:'12px', color:'#444'}}>Acción</th>
                                <th style={{padding:'12px', color:'#444'}}>Detalle</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, index) => (
                                <tr key={index} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'12px', color:'#666'}}>
                                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '---'}
                                    </td>
                                    <td style={{padding:'12px', fontWeight:'bold', color:'#004a87'}}>
                                        {log.user || 'Sistema'}
                                    </td>
                                    <td style={{padding:'12px'}}>
                                        <span style={{
                                            background: '#e3f2fd', color: '#1565c0',
                                            padding: '4px 8px', borderRadius: '4px', fontWeight:'bold', fontSize:'12px'
                                        }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{padding:'12px', color:'#444'}}>
                                        {/* Mostramos solo información relevante para no saturar */}
                                        {log.projectTitle || log.studentName || '---'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        )}

        {/* PESTAÑA: MONITOR */}
        {activeTab === 'monitor' && <div><SectionTitle title="Estado de Servicios" /><div style={cardStyle}>Panel de monitoreo...</div></div>}
      </div>
      <Footer />
    </div>
  );
};

// COMPONENTES AUXILIARES (Estilos intactos)
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Administración UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fcfcfc', width: '100%' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };