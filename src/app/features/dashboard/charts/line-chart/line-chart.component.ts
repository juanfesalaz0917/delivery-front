import {
  Component,
  Input,
  type OnChanges,
  type ElementRef,
  ViewChild,
  type AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { ChartData as SharedChartData } from '../../mock-data.service';

interface TimeSeriesData {
  date: string;
  value: number;
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
})
export class LineChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: TimeSeriesData[] | SharedChartData | null = [];
  @Input() color = '#f97316';
  @Input() label = 'Valor';

  private ctx!: CanvasRenderingContext2D;

  private formatNumber(n: number): string {
    try {
      return new Intl.NumberFormat().format(Number(n));
    } catch {
      return String(n);
    }
  }

  ngAfterViewInit(): void {
    this.initCanvas();
    this.draw();
  }

  ngOnChanges(): void {
    if (this.ctx) {
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

  private draw(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.resizeCanvas(canvas);
    const rect = canvas.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;

    const normalizedData: TimeSeriesData[] = Array.isArray(this.data)
      ? (this.data as TimeSeriesData[])
      : this.data && (this.data as SharedChartData).labels
        ? (this.data as SharedChartData).labels.map((label, i) => ({
            date: label,
            value: Number(
              (this.data as SharedChartData).datasets?.[0]?.data?.[i] ?? 0,
            ),
          }))
        : [];
    if (!normalizedData.length) {
      this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      this.ctx.fillStyle = '#9ca3af';
      this.ctx.textAlign = 'center';
      this.ctx.font = `${Math.max(12, Math.round(cssWidth * 0.04))}px sans-serif`;
      this.ctx.fillText('No hay datos', cssWidth / 2, cssHeight / 2);
      return;
    }

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    if (cssWidth <= 0 || cssHeight <= 0) return;
    const chartWidth = cssWidth - padding.left - padding.right;
    const chartHeight = cssHeight - padding.top - padding.bottom;

    this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const values = normalizedData.map((d) =>
      Number.isFinite(d.value) ? d.value : 0,
    );
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(cssWidth - padding.right, y);
      this.ctx.stroke();

      const value = Math.round(maxValue - (range / 4) * i);
      this.ctx.fillStyle = '#9ca3af';
      this.ctx.font = `${Math.max(9, Math.round(cssWidth * 0.03))}px sans-serif`;
      this.ctx.textAlign = 'right';
      this.ctx.fillText(this.formatNumber(value), padding.left - 5, y + 3);
    }

    const gradient = this.ctx.createLinearGradient(
      0,
      padding.top,
      0,
      cssHeight - padding.bottom,
    );
    gradient.addColorStop(0, this.hexToRgba(this.color, 0.3));
    gradient.addColorStop(1, this.hexToRgba(this.color, 0));

    this.ctx.beginPath();
    this.ctx.moveTo(padding.left, cssHeight - padding.bottom);

    const displayData =
      normalizedData.length > 30 ? normalizedData.slice(-30) : normalizedData;
    const denom = Math.max(1, displayData.length - 1);

    displayData.forEach((item, index) => {
      const safeValue = Number.isFinite(item.value) ? item.value : 0;
      const x = padding.left + (index / denom) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((safeValue - minValue) / range) * chartHeight;
      if (Number.isFinite(x) && Number.isFinite(y)) {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.lineTo(cssWidth - padding.right, cssHeight - padding.bottom);
    this.ctx.closePath();
    this.ctx.fillStyle = gradient;
    this.ctx.fill();

    this.ctx.beginPath();
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = 2;
    this.ctx.lineJoin = 'round';

    displayData.forEach((item, index) => {
      const safeValue = Number.isFinite(item.value) ? item.value : 0;
      const x = padding.left + (index / denom) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((safeValue - minValue) / range) * chartHeight;
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });

    this.ctx.stroke();

    displayData.forEach((item, index) => {
      const x = padding.left + (index / (displayData.length - 1)) * chartWidth;
      const y =
        padding.top +
        chartHeight -
        ((item.value - minValue) / range) * chartHeight;

      if (
        displayData.length <= 10 ||
        index % Math.ceil(displayData.length / 10) === 0
      ) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fff';
        this.ctx.fill();
        this.ctx.strokeStyle = this.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });

    this.ctx.fillStyle = '#9ca3af';
    this.ctx.font = `${Math.max(9, Math.round(cssWidth * 0.03))}px sans-serif`;
    this.ctx.textAlign = 'center';

    const showDates = [
      0,
      Math.floor(displayData.length / 2),
      displayData.length - 1,
    ];
    showDates.forEach((index) => {
      if (displayData[index]) {
        const x =
          padding.left + (index / (displayData.length - 1 || 1)) * chartWidth;
        const rawLabel = displayData[index].date;
        let labelText = String(rawLabel ?? '');
        const parsed = Date.parse(labelText);
        if (Number.isFinite(parsed)) {
          const dt = new Date(parsed);
          labelText = `${dt.getDate()}/${dt.getMonth() + 1}`;
        }
        if (labelText.length > 12)
          labelText = labelText.substring(0, 10) + '...';
        this.ctx.fillText(labelText, x, cssHeight - padding.bottom + 15);
      }
    });
  }

  private hexToRgba(hex: string, alpha: number): string {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
