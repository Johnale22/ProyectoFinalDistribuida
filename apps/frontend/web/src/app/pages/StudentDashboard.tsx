import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../api/axios';

// Fix iconos Leaflet (Mapa)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

export const StudentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = localStorage.getItem('user'); 
  
  const [activeTab, setActiveTab] = useState('profile');
  const [projects, setProjects] = useState<any[]>([]); 
  const [myProjects, setMyProjects] = useState<any[]>([]); 
  const [userData, setUserData] = useState<any>(null);

  // Geo
  const [myLocation, setMyLocation] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const UCE_COORDS = { lat: -0.1998, lng: -78.5055 };

  const logout = () => { localStorage.clear(); navigate('/'); };

  // 1. CARGAR PERFIL
  useEffect(() => {
    if (currentUser) {
      // ✅ GATEWAY: 8080
      fetch(`http://localhost:8080/auth/profile/${currentUser}`)
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(console.error);
    }
  }, [currentUser]);

  // 2. CARGAR PROYECTOS
  useEffect(() => {
    // ✅ GATEWAY: 8080
    fetch('http://localhost:8080/projects')
      .then(r => r.json())
      .then(d => { 
          // ✅ BLINDAJE: Solo guardamos si es array
          if(Array.isArray(d)) setProjects(d); 
          else setProjects([]);
      })
      .catch(console.error);
  }, []);

  // 3. CARGAR MIS INSCRIPCIONES (Aquí estaba el fallo)
  useEffect(() => {
    if (currentUser && activeTab === 'my_projects') {
        // ✅ GATEWAY: 8080 + Ruta '/enrollment' (singular)
        fetch(`http://localhost:8080/enrollment/student/${currentUser}`)
            .then(r => r.json())
            .then(data => {
                // ✅ BLINDAJE CRÍTICO ANTI-PANTALLA BLANCA
                // Si el backend devuelve error {message: '...'}, esto evita el crash
                if (Array.isArray(data)) {
                    setMyProjects(data);
                } else {
                    console.warn("Respuesta no válida en inscripciones:", data);
                    setMyProjects([]); // Forzamos lista vacía
                }
            })
            .catch(err => {
                console.error("Error cargando inscripciones:", err);
                setMyProjects([]);
            });
    }
  }, [currentUser, activeTab]);

  const handleEnroll = async (project: any) => {
    if(!window.confirm(`¿Confirmar postulación a: ${project.title}?`)) return;
    
    try {
        // ✅ GATEWAY: 8080/enrollment
        const res = await fetch(`http://localhost:8080/enrollment`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                projectId: project.id,       
                projectTitle: project.title, 
                studentName: currentUser     
            })
        });
        
        const data = await res.json();
        if (data.success) alert("✅ " + data.message);
        else alert("⚠️ " + (data.message || "Error desconocido"));
    } catch(e) { 
        console.error(e);
        alert("Error de conexión con Enrollment Service."); 
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); 
    formData.append('studentId', currentUser || 'anonimo');

    try {
        alert("⏳ Subiendo archivo...");
        // ✅ GATEWAY: 8080/storage
        const res = await fetch('http://localhost:8080/storage/upload', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        if (data.success || data.url) {
            alert(`✅ Archivo subido con éxito.`);
            try {
                // ✅ GATEWAY: 8080/enrollment
                await fetch('http://localhost:8080/enrollment/update-report', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        studentId: currentUser,
                        reportUrl: data.url
                    })
                });
            } catch (dbError) { console.error(dbError); }
        } else {
            alert("❌ Error al subir.");
        }
    } catch (error) {
        console.error(error);
        alert("Error de conexión.");
    }
  };

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setMyLocation(e.latlng);
        calculateDistance(e.latlng);
      },
    });
    return myLocation ? <Marker position={myLocation}><Popup>¡Vives aquí!</Popup></Marker> : null;
  }

  const calculateDistance = async (userCoords: {lat: number, lng: number}) => {
      try {
          const res = await fetch('http://localhost:8080/location/calc', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  lat1: userCoords.lat,
                  lon1: userCoords.lng,
                  lat2: UCE_COORDS.lat,
                  lon2: UCE_COORDS.lng
              })
          });
          const data = await res.json();
          setDistance(data.distance ? data.distance.toFixed(2) : 'Error');
      } catch (error) {
          console.error("Error calculando distancia", error);
      }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
      <Header user={currentUser || 'Estudiante'} logout={logout} subtitle="PORTAL ESTUDIANTIL" />

      <nav style={{ background: '#004a87', padding: '0 40px', display: 'flex', gap: '30px', height: '50px', alignItems: 'center' }}>
        <NavButton label="👤 Mis Datos" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <NavButton label="📋 Oferta Proyectos" active={activeTab === 'projects'} onClick={() => setActiveTab('projects')} />
        <NavButton label="📂 Mis Inscripciones" active={activeTab === 'my_projects'} onClick={() => setActiveTab('my_projects')} />
        <NavButton label="📍 Mapa" active={activeTab === 'geo'} onClick={() => setActiveTab('geo')} />
      </nav>

      <div style={{ flex: 1, padding: '40px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        
        {activeTab === 'profile' && (
           <div style={cardStyle}>
                {userData ? (
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                        <InfoField label="Cédula:" value={userData.username} />
                        <InfoField label="Nombres:" value={userData.fullName} />
                        <InfoField label="Facultad:" value={userData.faculty} />
                        <InfoField label="Carrera:" value={userData.career} />
                    </div>
                ) : <p>Cargando datos...</p>}
           </div>
        )}

        {activeTab === 'projects' && (
          <div style={{display:'grid', gap:'20px'}}>
              {projects.map((p: any) => (
                  <div key={p.id} style={cardStyle}>
                      <h4>{p.title}</h4>
                      <p>{p.description}</p>
                      <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
                          <small>Cupos ocupados: {p.enrolled}</small>
                          <button style={btnStyle} onClick={() => handleEnroll(p)}>Postularse</button>
                      </div>
                  </div>
              ))}
          </div>
        )}

        {activeTab === 'my_projects' && (
          <div>
            <SectionTitle title="Estado de mis Postulaciones" />
            {myProjects.length === 0 ? (
                <div style={cardStyle}><p>No te has postulado a ningún proyecto aún.</p></div>
            ) : (
                myProjects.map((insc: any) => (
                    <div key={insc._id} style={{...cardStyle, borderLeft: insc.status === 'APPROVED' ? '5px solid #28a745' : '5px solid #ffc107', marginBottom:'20px'}}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <h4 style={{margin:0}}>{insc.projectTitle}</h4>
                            {insc.status === 'APPROVED' 
                                ? <span style={badgeSuccess}>APROBADO</span>
                                : <span style={badgeWarning}>PENDIENTE DE TUTOR</span>
                            }
                        </div>
                        {insc.status === 'APPROVED' ? (
                            <div style={{marginTop:'20px'}}>
                                <p style={{fontSize:'13px', color:'#666'}}>✅ Solicitud aceptada. Sube tus documentos.</p>
                                <div style={{border:'1px dashed #ccc', padding:'15px', marginTop:'10px'}}>
                                    <label style={{fontWeight:'bold', display:'block', marginBottom:'5px'}}>📄 Hoja de Registro (PDF/Imagen)</label>
                                    <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileUpload} />
                                </div>
                            </div>
                        ) : (
                            <div style={{marginTop:'20px', padding:'10px', background:'#fff3cd', color:'#856404', borderRadius:'4px'}}>
                                ⏳ Tu solicitud está siendo revisada por el Tutor.
                            </div>
                        )}
                    </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'geo' && (
           <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 3, height: '500px', border: '2px solid #ccc' }}>
                        <MapContainer center={[-0.205, -78.510]} zoom={14} style={{ height: '100%', width: '100%' }}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={UCE_COORDS}><Popup>Universidad Central (UCE)</Popup></Marker>
                            <LocationMarker />
                        </MapContainer>
                </div>
                <div style={{ flex: 1, ...cardStyle, height: 'fit-content' }}>
                    <h3>📍 Distancia a la UCE</h3>
                    <p style={{fontSize: '14px', color: '#666'}}>Haz clic en el mapa para marcar donde vives.</p>
                    
                    {myLocation && (
                        <div style={{marginTop: '20px'}}>
                            <strong>Tus coordenadas:</strong>
                            <div style={{fontSize: '12px'}}>{myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}</div>
                        </div>
                    )}

                    <div style={{marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee'}}>
                        {distance ? (
                            <div>
                                <span style={{display: 'block', fontSize: '12px', color: '#888'}}>Distancia Calculada (gRPC):</span>
                                <span style={{fontSize: '32px', fontWeight: 'bold', color: '#004a87'}}>{distance} km</span>
                            </div>
                        ) : (
                            <span style={{fontStyle: 'italic', color: '#999'}}>- - km</span>
                        )}
                    </div>
                </div>
           </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const badgeSuccess = { background:'#28a745', color:'white', padding:'4px 10px', borderRadius:'15px', fontSize:'12px', fontWeight:'bold' };
const badgeWarning = { background:'#ffc107', color:'black', padding:'4px 10px', borderRadius:'15px', fontSize:'12px', fontWeight:'bold' };
const InfoField = ({label, value}: any) => ( <div style={{borderBottom:'1px solid #eee', paddingBottom:'5px'}}><span style={{fontWeight:'bold', display:'block', color:'#555'}}>{label}</span><span style={{color:'#333'}}>{value || 'Sin asignar'}</span></div> );
const Header = ({ user, logout, subtitle }: any) => ( <div style={{ background: 'white', padding: '10px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ddd' }}><div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}><div style={{ fontSize: '28px', fontWeight: 'bold', color: '#004a87', fontStyle: 'italic', fontFamily: 'serif' }}>UCE</div><div style={{ borderLeft: '1px solid #ccc', paddingLeft: '15px' }}><h2 style={{ fontSize: '18px', margin: 0, color: '#0056b3' }}>Sistema Académico</h2><small style={{ color: '#666' }}>{subtitle}</small></div></div><div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '14px' }}><span style={{ fontWeight: 'bold', color: '#555' }}>{user.toUpperCase()}</span><button onClick={logout} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Salir</button></div></div> );
const NavButton = ({ label, active, onClick }: any) => ( <button onClick={onClick} style={{ background: 'none', border: 'none', color: 'white', opacity: active ? 1 : 0.7, borderBottom: active ? '2px solid white' : '2px solid transparent', fontWeight: active ? 'bold' : 'normal', cursor: 'pointer', padding: '13px 0', fontSize: '14px' }}>{label}</button> );
const SectionTitle = ({ title }: any) => ( <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}><div style={{ width: '4px', height: '24px', background: '#d90000', marginRight: '10px' }}></div><h2 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{title}</h2></div> );
const Footer = () => <footer style={{ background: '#333', color: 'white', textAlign: 'center', padding: '10px', fontSize: '12px' }}>Sistema de Vinculación UCE</footer>;
const cardStyle = { background: 'white', padding: '30px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' };
const btnStyle = { background: '#004a87', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer' };