import { Injectable } from '@angular/core';
import { type Observable, of, delay } from 'rxjs';

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    fill?: boolean;
  }[];
}

export interface DashboardStats {
  totalPedidos: number;
  pedidosHoy: number;
  totalClientes: number;
  totalConductores: number;
  ingresosMes: number;
  pedidosCompletados: number;
}

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  getStats(): Observable<DashboardStats> {
    return of({
      totalPedidos: 15847,
      pedidosHoy: 127,
      totalClientes: 3254,
      totalConductores: 48,
      ingresosMes: 4582500,
      pedidosCompletados: 14923,
    }).pipe(delay(500));
  }

  getPedidosPorEstado(): Observable<ChartData> {
    return of({
      labels: [
        'Pendiente',
        'En Preparación',
        'En Camino',
        'Entregado',
        'Cancelado',
      ],
      datasets: [
        {
          label: 'Pedidos por Estado',
          data: [45, 32, 28, 156, 12],
          backgroundColor: [
            '#FCD34D',
            '#60A5FA',
            '#A78BFA',
            '#34D399',
            '#F87171',
          ],
        },
      ],
    }).pipe(delay(300));
  }

  getPedidosPorRestaurante(): Observable<ChartData> {
    return of({
      labels: [
        'Burger King',
        "McDonald's",
        'Subway',
        'Pizza Hut',
        'Dominos',
        'Otros',
      ],
      datasets: [
        {
          label: 'Pedidos por Restaurante',
          data: [89, 76, 54, 67, 45, 42],
          backgroundColor: [
            '#F97316',
            '#EF4444',
            '#22C55E',
            '#3B82F6',
            '#8B5CF6',
            '#6B7280',
          ],
        },
      ],
    }).pipe(delay(300));
  }

  getInconvenientesPorTipo(): Observable<ChartData> {
    return of({
      labels: ['Accidente', 'Falla Mecánica', 'Pinchazo', 'Robo', 'Otro'],
      datasets: [
        {
          label: 'Inconvenientes por Tipo',
          data: [8, 23, 45, 3, 12],
          backgroundColor: [
            '#DC2626',
            '#F59E0B',
            '#FBBF24',
            '#7C3AED',
            '#6B7280',
          ],
        },
      ],
    }).pipe(delay(300));
  }

  getPedidosPorDia(): Observable<ChartData> {
    return of({
      labels: [
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
        'Domingo',
      ],
      datasets: [
        {
          label: 'Pedidos por Día',
          data: [145, 132, 167, 189, 234, 298, 276],
          backgroundColor: '#3B82F6',
        },
      ],
    }).pipe(delay(300));
  }

  getTopProductos(): Observable<ChartData> {
    return of({
      labels: [
        'Hamburguesa Clásica',
        'Pizza Pepperoni',
        'Combo Familiar',
        'Alitas BBQ',
        'Ensalada César',
      ],
      datasets: [
        {
          label: 'Productos Más Vendidos',
          data: [456, 389, 312, 287, 198],
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#F59E0B',
            '#EF4444',
            '#8B5CF6',
          ],
        },
      ],
    }).pipe(delay(300));
  }

  getConductoresActivos(): Observable<ChartData> {
    return of({
      labels: [
        'Juan Pérez',
        'María García',
        'Carlos López',
        'Ana Martínez',
        'Pedro Sánchez',
      ],
      datasets: [
        {
          label: 'Entregas Completadas',
          data: [87, 76, 72, 68, 64],
          backgroundColor: '#6366F1',
        },
      ],
    }).pipe(delay(300));
  }

  getPedidosMensuales(): Observable<ChartData> {
    return of({
      labels: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
      datasets: [
        {
          label: 'Pedidos 2024',
          data: [
            1200, 1350, 1420, 1580, 1750, 1890, 2100, 2250, 2180, 2340, 2450,
            2600,
          ],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
        },
      ],
    }).pipe(delay(300));
  }

  getIngresosMensuales(): Observable<ChartData> {
    return of({
      labels: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
      datasets: [
        {
          label: 'Ingresos 2024 (Miles)',
          data: [
            2800, 3100, 3400, 3750, 4200, 4580, 5100, 5450, 5200, 5680, 5900,
            6200,
          ],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
        },
      ],
    }).pipe(delay(300));
  }

  getNuevosClientes(): Observable<ChartData> {
    return of({
      labels: [
        'Ene',
        'Feb',
        'Mar',
        'Abr',
        'May',
        'Jun',
        'Jul',
        'Ago',
        'Sep',
        'Oct',
        'Nov',
        'Dic',
      ],
      datasets: [
        {
          label: 'Nuevos Clientes 2024',
          data: [120, 145, 168, 198, 234, 267, 312, 345, 298, 378, 412, 456],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
        },
      ],
    }).pipe(delay(300));
  }
}
