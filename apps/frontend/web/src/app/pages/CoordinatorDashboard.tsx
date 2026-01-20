import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('user') || 'Coordinador';
  const [activeTab, setActiveTab] = useState('agreements');
  
  const [project, setProject] = useState({ 
    title: '', description: '', max_quota: 0, organization: '' 
  });

  const logout = () => { localStorage.clear(); navigate('/'); };

  const handleCreateProject = async () => {
      if(!project.title || !project.description) return alert("Complete los datos");

      try {
        // ✅ GATEWAY: 8080/projects (Redirige a 3001)
        const res = await fetch('http://localhost:8080/projects', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                title: project.title,
                description: `${project.description} (Entidad: ${project.organization})`,
                max_quota: project.max_quota
            })
        });

        if (res.ok) {
            alert("✅ Proyecto publicado exitosamente.");
            setProject({ title: '', description: '', max_quota: 0, organization: '' });
        } else {
            alert("Error al guardar en el servidor.");
        }
      } catch (e) {
        alert("Error de conexión con API Gateway (8080).");
        console.error(e);
      }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={user} logout={logout} subtitle="COORDINACIÓN GENERAL" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="🤝 Gestión de Convenios" active={activeTab === 'agreements'} onClick={() => setActiveTab('agreements')} />
        <NavButton label="👁️ Auditoría General" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {activeTab === 'agreements' && (
          <div>
            <SectionTitle title="Apertura de Nuevos Proyectos" />
            <div style={cardStyle}>
               <p style={{color:'#666', marginBottom:'20px'}}>Publicar oferta para estudiantes.</p>
               <div style={{display:'grid', gap:'20px', maxWidth:'800px'}}>
                  <div><label style={labelStyle}>Proyecto</label><input style={inputStyle} value={project.title} onChange={e => setProject({...project, title: e.target.value})} placeholder="Ej. Vinculación GAD" /></div>
                  <div><label style={labelStyle}>Entidad</label><input style={inputStyle} value={project.organization} onChange={e => setProject({...project, organization: e.target.value})} placeholder="Ej. Cruz Roja" /></div>
                  <div><label style={labelStyle}>Descripción</label><textarea style={{...inputStyle, minHeight:'100px'}} value={project.description} onChange={e => setProject({...project, description: e.target.value})} /></div>
                  <div><label style={labelStyle}>Cupos</label><input type="number" style={{...inputStyle, width:'100px'}} value={project.max_quota} onChange={e => setProject({...project, max_quota: parseInt(e.target.value)})} /></div>
               </div>
               <button style={primaryBtnStyle} onClick={handleCreateProject}>Publicar Proyecto</button>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div>
            <SectionTitle title="Auditoría del Sistema" />
            <div style={cardStyle}><p>Consulta el Dashboard de Admin para ver logs reales.</p></div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

// Componentes Auxiliares (Sin cambios visuales)
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Vinculación UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const inputStyle = { padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' };
const labelStyle = { display:'block', marginBottom:'5px', fontWeight:'bold', fontSize:'13px', color:'#444' };
const primaryBtnStyle = { marginTop: '20px', background: '#004a87', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' };