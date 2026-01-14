import axios from 'axios';

// ¡AQUÍ ESTÁ LA MAGIA! 
// Todo apunta ahora al Gateway (8080), no a los microservicios individuales.
const api = axios.create({
  baseURL: 'http://localhost:8080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;