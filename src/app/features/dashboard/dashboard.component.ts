import { Component, type OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  MockDataService,
  type ChartData,
  type DashboardStats,
} from './mock-data.service';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';

@Component({
  selector: 'app-dashboard',

  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PieChartComponent,
    BarChartComponent,
    LineChartComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private mockDataService = inject(MockDataService);
  private platformId = inject(PLATFORM_ID);

  stats: DashboardStats | null = null;
  loading = true;
  isBrowser = false;

  pedidosPorEstado: ChartData | null = null;
  pedidosPorRestaurante: ChartData | null = null;
  inconvenientesPorTipo: ChartData | null = null;

  pedidosPorDia: ChartData | null = null;
  topProductos: ChartData | null = null;
  conductoresActivos: ChartData | null = null;

  pedidosMensuales: ChartData | null = null;
  ingresosMensuales: ChartData | null = null;
  nuevosClientes: ChartData | null = null;

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadData();
  }

  private loadData(): void {
    this.mockDataService.getStats().subscribe((data) => {
      this.stats = data;
      this.loading = false;
    });

    this.mockDataService
      .getPedidosPorEstado()
      .subscribe((data) => (this.pedidosPorEstado = data));
    this.mockDataService
      .getPedidosPorRestaurante()
      .subscribe((data) => (this.pedidosPorRestaurante = data));
    this.mockDataService
      .getInconvenientesPorTipo()
      .subscribe((data) => (this.inconvenientesPorTipo = data));

    this.mockDataService
      .getPedidosPorDia()
      .subscribe((data) => (this.pedidosPorDia = data));
    this.mockDataService
      .getTopProductos()
      .subscribe((data) => (this.topProductos = data));
    this.mockDataService
      .getConductoresActivos()
      .subscribe((data) => (this.conductoresActivos = data));

    this.mockDataService
      .getPedidosMensuales()
      .subscribe((data) => (this.pedidosMensuales = data));
    this.mockDataService
      .getIngresosMensuales()
      .subscribe((data) => (this.ingresosMensuales = data));
    this.mockDataService
      .getNuevosClientes()
      .subscribe((data) => (this.nuevosClientes = data));
  }
}
