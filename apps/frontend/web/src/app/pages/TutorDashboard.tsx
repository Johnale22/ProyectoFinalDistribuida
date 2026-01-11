import { useState, useEffect } from 'react';

export const TutorDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', max_quota: 10 });
  const [enrollments, setEnrollments] = useState<any[]>([]); // Lista de inscritos

  // 1. Cargar inscripciones desde Mongo (Puerto 3002)
  const fetchEnrollments = async () => {
    try {
      const res = await fetch('http://localhost:3002/enrollments');
      const data = await res.json();
      setEnrollments(data);
    } catch (error) {
      console.error("Error conectando a Enrollment Service");
    }
  };

  useEffect(() => { fetchEnrollments(); }, []);

  // 2. Crear Proyecto (Igual que antes)
  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // ... (Tu lógica de crear proyecto sigue igual a puerto 3001) ...
    await fetch('http://localhost:3001/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
    });
    alert("✅ Proyecto creado");
    setForm({ title: '', description: '', max_quota: 10 });
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>👨‍🏫 Panel del Tutor</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        
        {/* COLUMNA IZQUIERDA: Crear Proyecto */}
        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
          <h3>🚀 Crear Nuevo Proyecto</h3>
          <form onSubmit={createProject} style={{ display: 'grid', gap: '15px' }}>
            <input 
              type="text" placeholder="Título" required 
              value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              style={{ padding: '10px' }}
            />
            <textarea 
              placeholder="Descripción" required 
              value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              style={{ padding: '10px', minHeight: '80px' }}
            />
            <label>Cupos: <input type="number" value={form.max_quota} onChange={e => setForm({...form, max_quota: Number(e.target.value)})} /></label>
            <button type="submit" disabled={loading} style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none' }}>
              {loading ? 'Guardando...' : 'Publicar'}
            </button>
          </form>
        </div>

        {/* COLUMNA DERECHA: Ver Inscritos (Desde Mongo) */}
        <div>
          <h3>📋 Solicitudes de Estudiantes</h3>
          <button onClick={fetchEnrollments} style={{marginBottom: 10, cursor: 'pointer'}}>🔄 Actualizar</button>
          
          {enrollments.length === 0 ? <p>No hay inscripciones aún.</p> : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9em' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{padding: 8}}>Estudiante</th>
                  <th style={{padding: 8}}>Proyecto</th>
                  <th style={{padding: 8}}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((insc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{padding: 8}}>{insc.studentName}</td>
                    <td style={{padding: 8}}>{insc.projectTitle}</td>
                    <td style={{padding: 8}}>
                      <span style={{ 
                        background: insc.status === 'PENDIENTE' ? '#fff3cd' : '#d4edda', 
                        padding: '2px 6px', borderRadius: '4px' 
                      }}>
                        {insc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};