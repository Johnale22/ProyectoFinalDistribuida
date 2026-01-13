import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const TutorDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Docente';
  const [activeTab, setActiveTab] = useState('hours'); // 'hours', 'validate'

  const logout = () => { localStorage.clear(); navigate('/'); };

  const handleAction = (student: string, action: string) => {
      alert(`${action === 'approve' ? '✅ Horas Aprobadas' : '❌ Horas Rechazadas'} para ${student}`);
  };

  const handleValidate = () => {
      alert("📡 Conectando con Validation Service (gRPC, Puerto 5000)... \n\n✅ Perfiles Validados Correctamente.");
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="GESTIÓN DOCENTE" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="⏱️ Aprobación de Horas" active={activeTab === 'hours'} onClick={() => setActiveTab('hours')} />
        <NavButton label="⚖️ Validación de Perfiles (gRPC)" active={activeTab === 'validate'} onClick={() => setActiveTab('validate')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* === APROBAR HORAS === */}
        {activeTab === 'hours' && (
          <div>
            <SectionTitle title="Registro de Actividades Estudiantiles" />
            <div style={cardStyle}>
                <table style={{width:'100%', fontSize:'14px', borderCollapse:'collapse'}}>
                    <thead>
                        <tr style={{textAlign:'left', borderBottom:'2px solid #ddd'}}>
                            <th style={{padding:'10px'}}>Estudiante</th>
                            <th>Proyecto</th>
                            <th>Horas Reportadas</th>
                            <th>Evidencia</th>
                            <th>Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{borderBottom:'1px solid #eee'}}>
                            <td style={{padding:'15px 10px'}}>Juan Pérez</td>
                            <td>Vinculación Barrio Obrero</td>
                            <td>20 Horas</td>
                            <td><a href="#" style={{color:'#004a87'}}>Ver PDF</a></td>
                            <td>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={() => handleAction('Juan Pérez', 'approve')} style={{background:'#28a745', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer'}}>Aprobar</button>
                                    <button onClick={() => handleAction('Juan Pérez', 'reject')} style={{background:'#dc3545', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', cursor:'pointer'}}>Rechazar</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* === VALIDACIÓN gRPC === */}
        {activeTab === 'validate' && (
          <div>
            <SectionTitle title="Validación de Requisitos Académicos" />
            <div style={cardStyle}>
               <p style={{marginBottom:'20px'}}>Este proceso utiliza <strong>Validation Service (gRPC)</strong> para verificar mallas curriculares y porcentaje de avance en tiempo real.</p>
               <button onClick={handleValidate} style={primaryBtnStyle}>Iniciar Validación Masiva (gRPC)</button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// --- COMPONENTES AUXILIARES (Iguales) ---
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Vinculación UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };