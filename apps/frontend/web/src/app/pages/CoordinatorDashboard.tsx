import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Coordinador';
  const [activeTab, setActiveTab] = useState('agreements'); // 'agreements', 'audit'
  
  const [agreement, setAgreement] = useState({ name: '', description: '', quota: 0, organization: '' });

  const logout = () => { localStorage.clear(); navigate('/'); };

  const handleCreateAgreement = () => {
      // Fetch a Agreement Service
      alert(`Convenio "${agreement.name}" creado con ${agreement.quota} cupos.`);
      setAgreement({ name: '', description: '', quota: 0, organization: '' });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="COORDINACIÓN GENERAL" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="🤝 Gestión de Convenios" active={activeTab === 'agreements'} onClick={() => setActiveTab('agreements')} />
        <NavButton label="👁️ Auditoría General" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {/* === CONVENIOS === */}
        {activeTab === 'agreements' && (
          <div>
            <SectionTitle title="Crear Nuevo Convenio / Proyecto Base" />
            <div style={cardStyle}>
               <div style={{display:'grid', gap:'20px'}}>
                  <div>
                      <label style={labelStyle}>Nombre del Proyecto / Convenio</label>
                      <input style={inputStyle} value={agreement.name} onChange={e => setAgreement({...agreement, name: e.target.value})} />
                  </div>
                  <div>
                      <label style={labelStyle}>Entidad Cooperante</label>
                      <input style={inputStyle} value={agreement.organization} onChange={e => setAgreement({...agreement, organization: e.target.value})} placeholder="Ej. GAD Municipal" />
                  </div>
                  <div>
                      <label style={labelStyle}>Descripción del Alcance</label>
                      <textarea style={{...inputStyle, minHeight:'100px'}} value={agreement.description} onChange={e => setAgreement({...agreement, description: e.target.value})} />
                  </div>
                  <div>
                      <label style={labelStyle}>Cupos Disponibles</label>
                      <input type="number" style={{...inputStyle, width:'100px'}} value={agreement.quota} onChange={e => setAgreement({...agreement, quota: parseInt(e.target.value)})} />
                  </div>
               </div>
               <button style={primaryBtnStyle} onClick={handleCreateAgreement}>Guardar Convenio</button>
            </div>
          </div>
        )}

        {/* === AUDITORÍA === */}
        {activeTab === 'audit' && (
          <div>
            <SectionTitle title="Auditoría del Sistema (Audit Service)" />
            <div style={cardStyle}>
                <table style={{width:'100%', fontSize:'14px'}}>
                    <thead><tr style={{borderBottom:'1px solid #ccc', textAlign:'left'}}><th>Timestamp</th><th>Rol</th><th>Acción</th></tr></thead>
                    <tbody>
                        <tr><td>2026-01-12 09:30</td><td>ESTUDIANTE</td><td>Subida Evidencia (PDF)</td></tr>
                        <tr><td>2026-01-12 10:15</td><td>TUTOR</td><td>Aprobación Horas</td></tr>
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

// --- COMPONENTES AUXILIARES (Iguales a los anteriores) ---
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Vinculación UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };
const labelStyle = { display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'13px', color:'#444' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };