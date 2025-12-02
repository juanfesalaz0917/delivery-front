import {
  Component,
  Input,
  type OnChanges,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type { ChartData } from '../../mock-data.service';

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.component.html',
})
export class PieChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: ChartData | null = null;

  private platformId = inject(PLATFORM_ID);
  private ctx!: CanvasRenderingContext2D;
  private isBrowser = false;

  colors: string[] = [
    '#f97316',
    '#10b981',
    '#3b82f6',
    '#8b5cf6',
    '#ec4899',
    '#eab308',
    '#06b6d4',
  ];

  ngAfterViewInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initCanvas();
      this.draw();
    }
  }

  ngOnChanges(): void {
    if (this.ctx && this.isBrowser) {
      this.draw();
    }
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas(canvas);
  }

  private resizeCanvas(canvas: HTMLCanvasElement): void {
    const dpr =
      typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  getColor(index: number): string {
    if (this.data?.datasets?.[0]?.backgroundColor) {
      const bg = this.data.datasets[0].backgroundColor;
      if (Array.isArray(bg)) {
        return bg[index % bg.length];
      }
      return bg;
    }
    return this.colors[index % this.colors.length];
  }

  private draw(): void {
    if (!this.ctx || !this.data?.datasets?.[0]?.data?.length) return;

    const canvas = this.canvasRef.nativeElement;
    this.resizeCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    if (cssWidth <= 0 || cssHeight <= 0) return;
    const centerX = cssWidth / 2;
    const centerY = cssHeight / 2;
    const radius = Math.min(centerX, centerY) - 10;

    this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const values = this.data.datasets[0].data;
    const total = values.reduce(
      (sum, val) => sum + (Number.isFinite(val) ? val : 0),
      0,
    );
    if (!Number.isFinite(total) || total <= 0) {
      this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      this.ctx.fillStyle = '#9ca3af';
      this.ctx.textAlign = 'center';
      this.ctx.font = `${Math.max(12, Math.round(cssWidth * 0.04))}px sans-serif`;
      this.ctx.fillText('No hay datos', cssWidth / 2, cssHeight / 2);
      return;
    }
    let startAngle = -Math.PI / 2;

    values.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;

      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      this.ctx.closePath();
      this.ctx.fillStyle = this.getColor(index);
      this.ctx.fill();

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;
      if (!Number.isFinite(labelX) || !Number.isFinite(labelY)) {
        startAngle = endAngle;
        return;
      }

      const percentage = Math.round(
        ((Number.isFinite(value) ? value : 0) / total) * 100,
      );
      if (percentage > 5) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${Math.max(10, Math.round(cssWidth * 0.05))}px Inter, system-ui, sans-serif`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(`${percentage}%`, labelX, labelY);
      }

      startAngle = endAngle;
    });
  }
}
