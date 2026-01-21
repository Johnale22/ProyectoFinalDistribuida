import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const TutorDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Docente';
  const [activeTab, setActiveTab] = useState('requests'); 
  const [requests, setRequests] = useState<any[]>([]); 
  const [approvedStudents, setApprovedStudents] = useState<any[]>([]); 

  const logout = () => { localStorage.clear(); navigate('/'); };

  // CARGAR SOLICITUDES (Corregido a Puerto 8080 y con Array Check)
  useEffect(() => {
    if (activeTab === 'requests') {
        // ✅ USAR GATEWAY (8080)
        fetch('http://localhost:8080/enrollment/pending')
          .then(res => res.json())
          .then(data => {
              // ✅ PROTECCIÓN PANTALLA BLANCA
              if(Array.isArray(data)) setRequests(data);
              else { console.error("Error formato:", data); setRequests([]); }
          })
          .catch(err => { console.error("Error:", err); setRequests([]); });
    }
  }, [activeTab]);

  // CARGAR APROBADOS
  useEffect(() => {
    if (activeTab === 'hours') {
        fetch('http://localhost:8080/enrollment/approved') 
          .then(res => res.json())
          .then(data => {
              if(Array.isArray(data)) setApprovedStudents(data);
              else setApprovedStudents([]);
          })
          .catch(err => setApprovedStudents([]));
    }
  }, [activeTab]);

  const handleDecision = async (id: string, status: 'APPROVED' | 'REJECTED') => {
      if(!window.confirm(`¿${status === 'APPROVED' ? 'APROBAR' : 'RECHAZAR'}?`)) return;

      try {
          const res = await fetch('http://localhost:8080/enrollment/manage', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ id, status })
          });
          const data = await res.json();
          if(data.success) {
              alert(`✅ Solicitud ${status}`);
              setRequests(prev => prev.filter(r => r._id !== id));
          } else {
              alert("Error: " + data.message);
          }
      } catch(e) { alert("Error de conexión"); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user.toUpperCase()} logout={logout} subtitle="GESTIÓN DOCENTE" />
      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="📩 Solicitudes Pendientes" active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} />
        <NavButton label="📄 Revisión de Documentos" active={activeTab === 'hours'} onClick={() => setActiveTab('hours')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {activeTab === 'requests' && (
          <div>
            <SectionTitle title="Solicitudes de Inscripción" />
            <div style={cardStyle}>
                {requests.length === 0 ? (
                    <EmptyState message="📭 No tienes solicitudes o hubo un error de conexión." />
                ) : (
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{borderBottom:'2px solid #eee', textAlign:'left'}}>
                                <th style={thStyle}>Estudiante</th><th style={thStyle}>Proyecto</th><th style={thStyle}>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((r: any) => (
                                <tr key={r._id} style={{borderBottom:'1px solid #f0f0f0'}}>
                                    <td style={{padding:'15px'}}>{r.studentName}</td>
                                    <td style={{padding:'15px'}}>{r.projectTitle}</td>
                                    <td style={{padding:'15px'}}>
                                        <button onClick={() => handleDecision(r._id, 'APPROVED')} style={{...actionBtn, background:'#28a745', marginRight:'5px'}}>Aprobar</button>
                                        <button onClick={() => handleDecision(r._id, 'REJECTED')} style={{...actionBtn, background:'#dc3545'}}>Rechazar</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Componentes auxiliares (Header, NavButton, etc...) se mantienen igual que tu archivo original
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const EmptyState = ({message}: {message: string}) => (<div style={{textAlign:'center', padding:'20px'}}><p style={{color:'#666', fontSize:'16px'}}>{message}</p></div>);
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const actionBtn = { color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize:'13px', fontWeight:'bold' };
const thStyle = { padding:'15px', color:'#004a87' };