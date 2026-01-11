import { useState, useEffect } from 'react';

export const CoordinatorDashboard = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [newOrg, setNewOrg] = useState('');

  // Cargar datos al inicio
  useEffect(() => { fetchLogs(); fetchAgreements(); }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:3003/audit');
      setLogs(await res.json());
    } catch (e) {}
  };

  const fetchAgreements = async () => {
    try {
      // Conectamos al Agreement Service (3008)
      const res = await fetch('http://localhost:3008/agreements');
      setAgreements(await res.json());
    } catch (e) {}
  };

  const handleCreateAgreement = async () => {
    await fetch('http://localhost:3008/agreements', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        organization: newOrg,
        representative: 'Representante Legal',
        valid_until: '2030-12-31' // Hardcoded por simplicidad
      })
    });
    setNewOrg('');
    fetchAgreements();
    alert('Convenio Creado');
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#d9534f' }}>🕵️ Panel de Coordinación</h1>

      {/* SECCIÓN 1: GESTIÓN DE CONVENIOS (NUEVO) */}
      <div style={{ background: '#fff3cd', padding: '20px', borderRadius: '10px', marginBottom: '40px' }}>
        <h3>🤝 Gestión de Convenios Institucionales</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input 
            placeholder="Nombre Organización (Ej. Cruz Roja)" 
            value={newOrg}
            onChange={e => setNewOrg(e.target.value)}
            style={{ padding: '8px', flex: 1 }}
          />
          <button onClick={handleCreateAgreement} style={{ padding: '8px 20px', background: '#d9534f', color: 'white', border: 'none', cursor: 'pointer' }}>
            + Crear Convenio
          </button>
        </div>
        
        <ul>
          {agreements.map(a => (
            <li key={a.id}>
              <strong>{a.organization}</strong> (Vence: {a.valid_until})
            </li>
          ))}
        </ul>
      </div>

      {/* SECCIÓN 2: AUDITORÍA (LO QUE YA TENÍAS) */}
      <h3>Registro de Auditoría</h3>
      <div style={{ border: '1px solid #ccc', maxHeight: '300px', overflowY: 'scroll' }}>
        <table style={{ width: '100%', fontSize: '0.8em' }}>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{padding:5}}>{log.action}</td>
                <td style={{padding:5}}>{JSON.stringify(log.data)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};