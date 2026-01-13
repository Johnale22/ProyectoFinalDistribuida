import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Estudiante';
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'projects', 'my_projects', 'geo'
  const [projects, setProjects] = useState<any[]>([]);

  const logout = () => { localStorage.clear(); navigate('/'); };

  useEffect(() => {
    // Simular carga de proyectos
    setProjects([
        { id: 1, title: 'Vinculación Barrio Obrero', desc: 'Capacitación contable', status: 'Disponible' },
        { id: 2, title: 'Apoyo Escolar Rural', desc: 'Clases de matemáticas', status: 'Inscrito' } // Uno ya inscrito para probar subir archivos
    ]);
  }, []);

  const handleUpload = (type: string, projectId: number) => {
    // Aquí conectarías con Storage Service
    alert(`📂 Subiendo ${type} para el proyecto ID ${projectId} al Storage Service (MinIO)...`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="PORTAL ESTUDIANTIL" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="👤 Mis Datos" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <NavButton label="📋 Oferta Proyectos" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
        <NavButton label="📂 Mis Inscripciones" active={activeTab === 'my_projects'} onClick={() => setActiveTab('my_projects')} />
        <NavButton label="📍 Búsqueda Geográfica" active={activeTab === 'geo'} onClick={() => setActiveTab('geo')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* === PERFIL === */}
        {activeTab === 'profile' && (
           <div>
             <SectionTitle title="Ficha del Estudiante" />
             <div style={cardStyle}>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                    <InfoField label="Nombres:" value="Juan Fernando" />
                    <InfoField label="Apellidos:" value="Pérez Lopez" />
                    <InfoField label="Cédula:" value="1720000001" />
                    <InfoField label="Correo:" value="jperez@uce.edu.ec" />
                    <InfoField label="Facultad:" value="Ingeniería y Ciencias Aplicadas" />
                    <InfoField label="Carrera:" value="Sistemas de Información" />
                    <InfoField label="Barrio:" value="Carcelén" />
                </div>
             </div>
           </div>
        )}

        {/* === OFERTA === */}
        {activeTab === 'projects' && (
          <div>
            <SectionTitle title="Proyectos Disponibles para Postulación" />
            <div style={{display:'grid', gap:'20px'}}>
                {projects.filter(p => p.status === 'Disponible').map(p => (
                    <div key={p.id} style={cardStyle}>
                        <h4>{p.title}</h4>
                        <p>{p.desc}</p>
                        <button style={btnStyle} onClick={() => alert('Enviando solicitud a Enrollment Service...')}>Postularse</button>
                    </div>
                ))}
            </div>
          </div>
        )}

        {/* === MIS INSCRIPCIONES (SUBIDA DE ARCHIVOS) === */}
        {activeTab === 'my_projects' && (
          <div>
            <SectionTitle title="Gestión de Documentación (Storage Service)" />
            {projects.filter(p => p.status === 'Inscrito').map(p => (
                <div key={p.id} style={{...cardStyle, borderLeft: '5px solid #28a745'}}>
                    <h4 style={{marginTop:0}}>{p.title} <span style={{fontSize:'12px', background:'#28a745', color:'white', padding:'2px 8px', borderRadius:'10px'}}>INSCRITO</span></h4>
                    <p style={{fontSize:'13px', color:'#666'}}>Por favor suba la documentación en formato PDF.</p>
                    
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginTop:'20px'}}>
                        <div style={{border:'1px dashed #ccc', padding:'15px', borderRadius:'4px'}}>
                            <label style={{display:'block', fontWeight:'bold', marginBottom:'10px'}}>📄 Hoja de Registro</label>
                            <input type="file" accept=".pdf" onChange={() => handleUpload('Registro', p.id)} />
                        </div>
                        <div style={{border:'1px dashed #ccc', padding:'15px', borderRadius:'4px'}}>
                            <label style={{display:'block', fontWeight:'bold', marginBottom:'10px'}}>Evidence (Fotos/Informe)</label>
                            <input type="file" accept=".pdf" onChange={() => handleUpload('Evidencia', p.id)} />
                        </div>
                    </div>
                </div>
            ))}
          </div>
        )}

        {/* === GEOLOCALIZACIÓN === */}
        {activeTab === 'geo' && (
           <div>
             <SectionTitle title="Mapa de Proyectos (Location Service)" />
             <div style={{background:'#e9ecef', height:'500px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid #ccc'}}>
                 <div style={{textAlign:'center'}}>
                     <div style={{fontSize:'60px'}}>🗺️</div>
                     <h3>Mapa Interactivo</h3>
                     <p>Aquí se cargará la API de Leaflet/Google Maps</p>
                     <button style={btnStyle}>🔍 Buscar Proyectos en mi Zona</button>
                 </div>
             </div>
           </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

// --- COMPONENTES AUXILIARES ---
const InfoField = ({label, value}: any) => ( <div style={{borderBottom:'1px solid #eee', paddingBottom:'5px'}}><span style={{fontWeight:'bold', display:'block', color:'#555'}}>{label}</span><span>{value}</span></div> );
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
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Vinculación UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const btnStyle = { background: '#004a87', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' };