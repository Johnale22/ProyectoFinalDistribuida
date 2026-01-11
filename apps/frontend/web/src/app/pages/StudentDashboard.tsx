import { useState, useEffect } from 'react';

// Interfaz del Proyecto
interface Project { 
  id: string; 
  title: string; 
  description: string; 
  max_quota: number; 
  enrolled: number; 
}

export const StudentDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  // 1. Cargar Proyectos
  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/projects');
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Error cargando proyectos");
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  // 2. Manejar Inscripción
  const handleEnroll = async (id: string) => {
    if(!confirm('¿Postularse?')) return;
    
    const realName = localStorage.getItem('userName') || 'Anónimo';

    try {
      await fetch(`http://localhost:3001/api/projects/${id}/enroll`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentName: realName }) 
      });
      fetchProjects(); 
      alert('✅ Solicitud enviada correctamente');
    } catch (e) {
      alert('Error al inscribirse');
    }
  };

  // 3. Manejar Subida de Archivos (NUEVO)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Conectamos al Storage Service (Puerto 3005)
      const res = await fetch('http://localhost:3005/storage/upload', {
        method: 'POST',
        body: formData, 
      });
      
      const data = await res.json();
      
      if (data.url) {
        alert('✅ Archivo subido con éxito!\nURL: ' + data.url);
        // Aquí podrías guardar 'data.url' en la base de datos si quisieras
      }
    } catch (error) {
      alert('Error al subir archivo. ¿Está corriendo el Storage Service (3005)?');
    }
  };

  const [geoProjects, setGeoProjects] = useState<any[]>([]);

  const handleGeoSearch = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
    // Simular ubicación UCE si estás muy lejos (opcional, para demo)
    // const lat = -0.1923; const lng = -78.4950;

      try {
        const res = await fetch(`http://localhost:3006/geo/nearby?lat=${latitude}&lng=${longitude}`);
        const data = await res.json();
        setGeoProjects(data);
        alert("📍 ¡Ubicación detectada! Proyectos ordenados por cercanía.");
      } catch (e) {
        console.error(e);
      }
    }, () => {
      alert("No pudimos obtener tu ubicación. Activa el GPS.");
    });
  };
  // --- RENDERIZADO (HTML) ---
  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#28a745' }}>🎓 Panel del Estudiante</h1>
      
      {/* SECCIÓN 1: LISTA DE PROYECTOS */}
      <h3>Proyectos Disponibles</h3>
      <div style={{ display: 'grid', gap: '15px', marginBottom: '40px' }}>
        {projects.map(p => (
          <div key={p.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>{p.title}</h4>
            <p style={{ color: '#666', fontSize: '0.95em' }}>{p.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <span style={{ background: '#e9ecef', padding: '4px 10px', borderRadius: '20px', fontSize: '0.85em', color: '#495057' }}>
                Disponibles: {p.max_quota - p.enrolled}
              </span>
              <button 
                onClick={() => handleEnroll(p.id)} 
                style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Postular
              </button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <p>No hay proyectos cargados.</p>}
      </div>

      {/* SECCIÓN 2: SUBIR EVIDENCIAS (NUEVO) */}
      <div style={{ borderTop: '2px dashed #ccc', paddingTop: '20px', marginTop: '40px' }}>
        <h3 style={{ color: '#17a2b8' }}>📂 Gestión de Evidencias</h3>
        <p style={{ fontSize: '0.9em', color: '#555' }}>
          Sube aquí tu reporte mensual firmado o carta de compromiso (PDF o Imagen).
        </p>
        
        <input 
          type="file" 
          onChange={handleFileUpload}
          style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '5px', background: '#f8f9fa', width: '100%' }} 
        />
      </div>

       {/* SECCIÓN GEOLOCALIZACIÓN (NUEVO) */}
      <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#0d47a1' }}>🌍 Búsqueda por Cercanía</h3>
      <button onClick={handleGeoSearch} style={{ cursor: 'pointer', padding: '8px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px' }}>
        📍 Usar mi GPS para buscar
      </button>

      {geoProjects.length > 0 && (
        <ul style={{ marginTop: '10px', background: 'white', padding: '10px', borderRadius: '5px' }}>
          {geoProjects.map((gp: any) => (
            <li key={gp.id} style={{ listStyle: 'none', borderBottom: '1px solid #eee', padding: '5px' }}>
              <strong>{gp.name}</strong> - a <span style={{ color: 'red' }}>{gp.distance_km} km</span> de ti.
            </li>
          ))}
        </ul>
      )}
    </div>
     
    </div>
  );
};

export default StudentDashboard;