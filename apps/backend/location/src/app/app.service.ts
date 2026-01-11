import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  
  // Base de datos simulada de ubicaciones de proyectos (Quito)
  private projectLocations = [
    { id: '1', name: 'Vinculación Hospital IESS', lat: -0.1923, lng: -78.4950 }, // Cerca UCE
    { id: '2', name: 'Apoyo Escolar Quitumbe', lat: -0.2850, lng: -78.5500 }, // Sur
    { id: '3', name: 'Reforestación Parque Metropolitano', lat: -0.1700, lng: -78.4700 }, // Norte
    { id: '4', name: 'Asesoría Legal Carapungo', lat: -0.1000, lng: -78.4500 } // Extremo Norte
  ];

  // Fórmula Haversine para calcular distancia en KM
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distancia en km
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Función principal: Buscar cercanos
  findNearby(userLat: number, userLng: number) {
    return this.projectLocations.map(project => {
      const distance = this.calculateDistance(userLat, userLng, project.lat, project.lng);
      return { ...project, distance_km: distance.toFixed(2) };
    }).sort((a, b) => Number(a.distance_km) - Number(b.distance_km)); // Ordenar del más cercano al más lejano
  }
}