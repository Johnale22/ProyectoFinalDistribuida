import { useState, useEffect } from 'react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    try {
      // Conectamos al Reporting Service (3004)
      const res = await fetch('http://localhost:3004/reports/dashboard');
      const data = await res.json();
      setStats(data);
    } catch (e) { console.error("Error reporting"); }
  };

  useEffect(() => { fetchStats(); }, []);

  if (!stats) return <div style={{padding: 40}}>Cargando estadísticas...</div>;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial' }}>
      <h1>📊 Tablero de Control Administrativo</h1>
      
      {/* Tarjeta Principal */}
      <div style={{ background: '#007bff', color: 'white', padding: '20px', borderRadius: '10px', display: 'inline-block', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '3em' }}>{stats.total_inscripciones}</h2>
        <span>Inscripciones Totales</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* Tabla por Proyecto */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>🔥 Popularidad de Proyectos</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {stats.por_proyecto.map((p: any) => (
              <li key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                <span>{p._id}</span>
                <strong>{p.count} alumnos</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Tabla por Estado */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
          <h3>🚦 Estado de Solicitudes</h3>
          {stats.estados.map((s: any) => (
            <div key={s._id} style={{ marginBottom: '10px' }}>
              <strong>{s._id}: </strong> {s.count}
              <div style={{ background: '#eee', height: '10px', borderRadius: '5px', marginTop: '5px' }}>
                <div style={{ 
                  width: `${(s.count / stats.total_inscripciones) * 100}%`, 
                  background: s._id === 'PENDIENTE' ? '#ffc107' : '#28a745',
                  height: '100%', borderRadius: '5px' 
                }}></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};