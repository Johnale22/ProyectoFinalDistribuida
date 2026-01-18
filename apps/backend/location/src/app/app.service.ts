import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Tu base de datos simulada (La dejamos por si la usas luego)
  private projectLocations = [
    { id: '1', name: 'Vinculación Hospital IESS', lat: -0.1923, lng: -78.4950 },
    { id: '2', name: 'Apoyo Escolar Quitumbe', lat: -0.2850, lng: -78.5500 },
    { id: '3', name: 'Reforestación Parque Metropolitano', lat: -0.1700, lng: -78.4700 },
    { id: '4', name: 'Asesoría Legal Carapungo', lat: -0.1000, lng: -78.4500 }
  ];

  // Lógica principal solicitada por gRPC
  calculateDistance(data: { lat1: number; lon1: number; lat2: number; lon2: number }) {
    const dist = this.getDistanceFromLatLonInKm(data.lat1, data.lon1, data.lat2, data.lon2);
    console.log(`🌍 [gRPC] Calculando distancia: ${dist.toFixed(2)} km`);
    return { distance: dist };
  }

  // Tu fórmula Haversine (Privada)
  private getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}