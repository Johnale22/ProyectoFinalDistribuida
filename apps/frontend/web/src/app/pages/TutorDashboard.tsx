import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export const TutorDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Docente';
  
  // Estados para pestañas y datos
  const [activeTab, setActiveTab] = useState('requests'); 
  const [requests, setRequests] = useState<any[]>([]);

  const logout = () => { localStorage.clear(); navigate('/'); };

  // 1. CARGAR SOLICITUDES (Enrollment Service - 3002)
  useEffect(() => {
    if (activeTab === 'requests') {
        fetch('http://localhost:3002/enrollments/pending')
          .then(res => res.json())
          .then(data => setRequests(data))
          .catch(err => console.error("Error conectando a Enrollment 3002:", err));
    }
  }, [activeTab]);

  // 2. GESTIONAR (Aprobar/Rechazar)
  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
      if(!window.confirm(`¿Estás seguro de ${status === 'APPROVED' ? 'APROBAR' : 'RECHAZAR'} esta solicitud?`)) return;

      try {
          const res = await fetch('http://localhost:3002/enrollments/manage', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ id, status })
          });
          const data = await res.json();
          
          if(data.success) {
              alert(`✅ Solicitud ${status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA'}`);
              setRequests(prev => prev.filter(r => r._id !== id)); // Actualizar lista visualmente
          } else {
              alert("Error: " + data.message);
          }
      } catch(e) { alert("Error al conectar con Enrollment Service"); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      
      {/* 1. HEADER (Igual al del Estudiante) */}
      <Header user={user.toUpperCase()} logout={logout} subtitle="GESTIÓN DOCENTE" />

      {/* 2. BARRA DE NAVEGACIÓN */}
      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="📩 Solicitudes Pendientes" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
        <NavButton label="⏱️ Aprobación de Horas" active={activeTab === 'hours'} onClick={() => setActiveTab('hours')} />
      </nav>

      {/* 3. CONTENIDO PRINCIPAL */}
      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* PESTAÑA: SOLICITUDES */}
        {activeTab === 'requests' && (
          <div>
            <SectionTitle title="Solicitudes de Inscripción" />
            
            <div style={cardStyle}>
                {requests.length === 0 ? (
                    <div style={{textAlign:'center', padding:'20px'}}>
                        <p style={{color:'#666', fontSize:'16px'}}>📭 No tienes solicitudes pendientes por revisar.</p>
                    </div>
                ) : (
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{borderBottom:'2px solid #eee', textAlign:'left'}}>
                                <th style={{padding:'15px', color:'#004a87'}}>Estudiante</th>
                                <th style={{padding:'15px', color:'#004a87'}}>Proyecto Solicitado</th>
                                <th style={{padding:'15px', color:'#004a87'}}>Fecha</th>
                                <th style={{padding:'15px', color:'#004a87'}}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r: any) => (
                                <tr key={r._id} style={{borderBottom:'1px solid #f0f0f0'}}>
                                    <td style={{padding:'15px', fontWeight:'bold'}}>{r.studentName}</td>
                                    <td style={{padding:'15px'}}>{r.projectTitle}</td>
                                    <td style={{padding:'15px', color:'#666'}}>{new Date(r.date).toLocaleDateString()}</td>
                                    <td style={{padding:'15px'}}>
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <button onClick={() => handleDecision(r._id, 'APPROVED')} style={{...actionBtn, background:'#28a745'}}>Aprobar</button>
                                            <button onClick={() => handleDecision(r._id, 'REJECTED')} style={{...actionBtn, background:'#dc3545'}}>Rechazar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        )}

        {/* PESTAÑA: HORAS (Placeholder) */}
        {activeTab === 'hours' && (
           <div>
               <SectionTitle title="Validación de Horas" />
               <div style={cardStyle}>
                   <p style={{color:'#666'}}>Selecciona un proyecto para ver los reportes de horas cargados por los estudiantes.</p>
               </div>
           </div>
        )}

      </div>

      {/* 4. FOOTER */}
      <Footer />
    </div>
  );
};

// --- COMPONENTES DE ESTILO (Copiados del Estudiante) ---
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
            <span style={{ fontWeight: 'bold', color: '#555' }}>{user}</span>
            <button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button>
        </div>
    </div> 
);

const NavButton = ({ label, active, onClick }: any) => ( 
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>
        {label}
    </button> 
);

const SectionTitle = ({ title }: any) => ( 
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div>
        <h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2>
    </div> 
);

const Footer = () => (
    <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>
        Sistema de Vinculación UCE
    </footer>
);

// Estilos CSS-in-JS
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const actionBtn = { color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize:'13px', fontWeight:'bold' };