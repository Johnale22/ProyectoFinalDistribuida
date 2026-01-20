import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Asegúrate de que este axios apunte al puerto 8080

// --- DATOS ESTÁTICOS ---
const FACULTADES: any = {
  "Ingeniería y Ciencias Aplicadas": ["Sistemas de Información", "Computación", "Diseño Industrial"],
  "Ciencias Administrativas": ["Administración de Empresas", "Contabilidad", "Finanzas"],
  "Arquitectura y Urbanismo": ["Arquitectura", "Artes"]
};
const SEMESTRES = ["Cuarto", "Quinto", "Sexto", "Séptimo", "Octavo", "Noveno", "Décimo"];

const MICROSERVICES = [
    { id: 'gateway', name: 'API Gateway', port: 8080, endpoint: '/' },
    { id: 'auth', name: 'Auth Service', port: 8080, endpoint: '/auth' },
    { id: 'projects', name: 'Projects Service', port: 8080, endpoint: '/projects' },
    { id: 'enrollment', name: 'Enrollment Service', port: 8080, endpoint: '/enrollment' },
    { id: 'reports', name: 'Reporting Service', port: 8080, endpoint: '/reports' },
    { id: 'validation', name: 'Validation Service', port: 8080, endpoint: '/validation/check-eligibility' },
    { id: 'audit', name: 'Audit Service', port: 8080, endpoint: '/audit' },
    { id: 'storage', name: 'Storage Service', port: 8080, endpoint: '/storage' },
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'ADMIN';
  
  const [activeTab, setActiveTab] = useState('users');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [reportStats, setReportStats] = useState<any>(null); 
  const [serviceStatus, setServiceStatus] = useState<any>({}); 
  const [loadingHealth, setLoadingHealth] = useState(false);

  const [newUser, setNewUser] = useState({
    cedula: '', nombres: '', apellidos: '', email: '', 
    facultad: '', carrera: '', telefono: '', barrio: '', 
    role: 'STUDENT', semester: ''
  });
  const [carrerasDisponibles, setCarrerasDisponibles] = useState<string[]>([]);

  // 1. CARGAR AUDITORÍA (CON PROTECCIÓN ANTI-CRASH)
  useEffect(() => {
    if (activeTab === 'audit') {
        // Usamos la URL completa al Gateway para evitar dudas
        api.get('http://localhost:8080/audit')
           .then(res => {
               // ✅ SEGURIDAD: Solo guardamos si es un Array real
               if (Array.isArray(res.data)) {
                   setAuditLogs(res.data);
               } else {
                   console.error("Formato inesperado en Audit:", res.data);
                   setAuditLogs([]); // Evita pantalla blanca
               }
           })
           .catch(err => {
               console.error("Error cargando auditoría:", err);
               setAuditLogs([]);
           });
    }
  }, [activeTab]);

  // 2. CARGAR REPORTES
  useEffect(() => {
    if (activeTab === 'reports') {
        fetchReports();
    }
  }, [activeTab]);

  // 3. CARGAR MONITOR
  useEffect(() => {
    if (activeTab === 'monitor') {
        checkSystemHealth();
    }
  }, [activeTab]);

  const fetchReports = async () => {
      try {
          const res = await api.get('http://localhost:8080/reports');
          setReportStats(res.data);
      } catch (error) { console.error("Error reportes:", error); }
  };

  const checkSystemHealth = async () => {
      setLoadingHealth(true);
      const statuses: any = {};
      await Promise.all(MICROSERVICES.map(async (service) => {
          try {
              // Timeout corto para no congelar la UI
              await api.get(`http://localhost:${service.port}${service.endpoint}`, { timeout: 2000 }); 
              statuses[service.id] = 'ONLINE';
          } catch (error: any) {
              if (error.response) statuses[service.id] = 'ONLINE'; 
              else statuses[service.id] = 'OFFLINE';
          }
      }));
      setServiceStatus(statuses);
      setLoadingHealth(false);
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
    if (name === 'facultad') {
      setCarrerasDisponibles(FACULTADES[value] || []);
      setNewUser(prev => ({ ...prev, facultad: value, carrera: '' }));
    }
  };

  const handleCreateUser = async () => {
    if(!newUser.cedula || !newUser.nombres) return alert("Complete campos");
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
      const res = await api.post('http://localhost:8080/auth/register', payload);
      const data = res.data; 
      if (data.success || data.username) {
        alert(`✅ Usuario creado: ${newUser.cedula}`);
        setNewUser({ cedula: '', nombres: '', apellidos: '', email: '', facultad: '', carrera: '', telefono: '', barrio: '', role: 'STUDENT', semester: '' }); 
      } else { alert('Error: ' + (data.message || 'Error al crear')); }
    } catch (e) { alert('Error de conexión con Gateway (8080)'); }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  // Helper para formatear fechas sin romper la app
  const formatDate = (dateString: string) => {
      try {
          return new Date(dateString).toLocaleString();
      } catch (e) {
          return dateString;
      }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="DIRECCIÓN DE TECNOLOGÍAS (DTIC)" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="👥 Gestión Usuarios" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
        <NavButton label="👁️ Auditoría" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
        <NavButton label="📊 Reportes" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
        <NavButton label="📡 Monitor Sistema" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        {/* 1. PESTAÑA: USUARIOS */}
        {activeTab === 'users' && (
           <div>
             <SectionTitle title="Registro de Nuevo Usuario" />
             <div style={cardStyle}>
                <div style={{background:'#e3f2fd', padding:'10px 15px', borderRadius:'4px', marginBottom:'20px', borderLeft:'4px solid #2196f3', color:'#0d47a1'}}>
                    <strong>ℹ️ Nota:</strong> La contraseña será igual a la Cédula.
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <input name="cedula" placeholder="Cédula" value={newUser.cedula} onChange={handleChange} style={inputStyle} />
                    <input name="nombres" placeholder="Nombres" value={newUser.nombres} onChange={handleChange} style={inputStyle} />
                    <input name="apellidos" placeholder="Apellidos" value={newUser.apellidos} onChange={handleChange} style={inputStyle} />
                    <input name="email" type="email" placeholder="Correo" value={newUser.email} onChange={handleChange} style={inputStyle} />
                    <input name="telefono" placeholder="Teléfono" value={newUser.telefono} onChange={handleChange} style={inputStyle} />
                    <input name="barrio" placeholder="Barrio" value={newUser.barrio} onChange={handleChange} style={inputStyle} />
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

        {/* 2. PESTAÑA: AUDITORÍA (CON BLINDAJE) */}
        {activeTab === 'audit' && (
          <div>
            <SectionTitle title="Logs de Auditoría (Redis)" />
            <div style={cardStyle}>
                {/* Doble chequeo: Que sea array Y que tenga elementos */}
                {!Array.isArray(auditLogs) || auditLogs.length === 0 ? (
                    <div style={{textAlign:'center', padding:'20px'}}>
                        <p style={{color:'#666', marginBottom:'10px'}}>⏳ No hay registros disponibles.</p>
                        <small style={{color:'#999'}}>
                           (Si el backend da error, revisa la consola con F12. Asegúrate de que Redis y Audit Service estén corriendo)
                        </small>
                    </div>
                ) : (
                    <table style={{width:'100%', borderCollapse:'collapse', fontSize:'14px'}}>
                        <thead>
                            <tr style={{background:'#f8f9fa', borderBottom:'2px solid #dee2e6', textAlign:'left'}}>
                                <th style={{padding:'12px'}}>Fecha</th>
                                <th style={{padding:'12px'}}>Usuario</th>
                                <th style={{padding:'12px'}}>Acción</th>
                                <th style={{padding:'12px'}}>Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {auditLogs.map((log, index) => (
                                <tr key={index} style={{borderBottom:'1px solid #eee'}}>
                                    <td style={{padding:'12px'}}>{formatDate(log.timestamp)}</td>
                                    <td style={{padding:'12px', fontWeight:'bold', color:'#004a87'}}>{log.user || 'Sistema'}</td>
                                    <td style={{padding:'12px'}}>
                                        <span style={{background:'#e3f2fd', color:'#1565c0', padding:'4px 8px', borderRadius:'4px', fontWeight:'bold', fontSize:'12px'}}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td style={{padding:'12px', color:'#555'}}>
                                        {/* Mostramos JSON de forma segura */}
                                        {log.data ? JSON.stringify(log.data).slice(0, 60) + (JSON.stringify(log.data).length > 60 ? '...' : '') : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        )}

        {/* 3. PESTAÑA: REPORTES */}
        {activeTab === 'reports' && (
            <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <SectionTitle title="Métricas en Tiempo Real" />
                    <button onClick={fetchReports} style={{background:'none', border:'1px solid #ccc', padding:'5px 15px', borderRadius:'4px', cursor:'pointer'}}>🔄 Actualizar</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    <StatCard title="Total Estudiantes" value={reportStats?.totalStudents || 0} color="#2196f3" />
                    <StatCard title="Inscripciones" value={reportStats?.totalEnrollments || 0} color="#4caf50" />
                    <StatCard title="Aprobados" value={reportStats?.approvedEnrollments || 0} color="#ff9800" />
                    <StatCard title="Horas Totales" value={reportStats?.totalHours || 0} color="#9c27b0" />
                </div>
            </div>
        )}

        {/* 4. PESTAÑA: MONITOR */}
        {activeTab === 'monitor' && (
            <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <SectionTitle title="Estado de Salud de Microservicios" />
                    <button onClick={checkSystemHealth} style={{background:'none', border:'1px solid #ccc', padding:'5px 15px', borderRadius:'4px', cursor:'pointer'}}>🔄 Ping</button>
                </div>

                <div style={cardStyle}>
                    {loadingHealth ? <p>Conectando con la malla de servicios...</p> : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            {MICROSERVICES.map((service) => (
                                <div key={service.id} style={{
                                    border: '1px solid #eee', padding: '15px', borderRadius: '8px',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    background: serviceStatus[service.id] === 'ONLINE' ? '#f0fdf4' : '#fef2f2'
                                }}>
                                    <div>
                                        <div style={{fontWeight:'bold', color: '#333'}}>{service.name}</div>
                                        <div style={{fontSize:'12px', color: '#666'}}>Puerto: {service.port}</div>
                                    </div>
                                    <div style={{
                                        padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                        background: serviceStatus[service.id] === 'ONLINE' ? '#dcfce7' : '#fee2e2',
                                        color: serviceStatus[service.id] === 'ONLINE' ? '#166534' : '#991b1b',
                                        border: serviceStatus[service.id] === 'ONLINE' ? '1px solid #bbf7d0' : '1px solid #fecaca'
                                    }}>
                                        {serviceStatus[service.id] === 'ONLINE' ? '🟢 ACTIVO' : '🔴 INACTIVO'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// COMPONENTES AUXILIARES
const StatCard = ({ title, value, color }: any) => (
    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
        <div style={{ color: '#666', fontSize: '12px', textTransform: 'uppercase', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{value}</div>
    </div>
);
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 1, borderBottom: active ? '3px solid white' : '3px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Administración UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: '#fcfcfc', width: '100%' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };