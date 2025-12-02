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

interface BarChartItem {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.css'],
})
export class BarChartComponent implements OnChanges, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  @Input() data: BarChartItem[] | SharedChartData | null = [];
  @Input() horizontal = false;
  @Input() color = '#f97316';

  private ctx!: CanvasRenderingContext2D;

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

    const normalizedData: BarChartItem[] = Array.isArray(this.data)
      ? (this.data as BarChartItem[])
      : this.data && (this.data as SharedChartData).labels
        ? (this.data as SharedChartData).labels.map((label, i) => ({
            label,
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

    const padding = { top: 20, right: 10, bottom: 60, left: 30 };
    if (cssWidth <= 0 || cssHeight <= 0) return;
    const chartWidth = cssWidth - padding.left - padding.right;
    const chartHeight = cssHeight - padding.top - padding.bottom;

    this.ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const values = normalizedData.map((d) =>
      Number.isFinite(d.value) ? d.value : 0,
    );
    const maxValue = Math.max(...values, 1);
    const estimatedBar = chartWidth / Math.max(1, normalizedData.length) - 10;
    const maxBar = Math.max(6, chartWidth * 0.8);
    const barWidth = Math.max(6, Math.min(estimatedBar, maxBar));

    let labelArea = 0;
    let valueLabelWidth = 0;
    if (this.horizontal) {
      this.ctx.font = `${Math.max(9, Math.round(cssWidth * 0.03))}px sans-serif`;
      labelArea = normalizedData.reduce((max, item) => {
        const w = this.ctx.measureText(String(item.label ?? '')).width;
        return Math.max(max, w);
      }, 0);

      const nf = new Intl.NumberFormat();
      valueLabelWidth = this.ctx.measureText(nf.format(maxValue)).width + 8;

      labelArea = Math.min(labelArea, chartWidth * 0.4);
    }

    const barStartXGlobal = this.horizontal
      ? padding.left + labelArea + 12
      : padding.left;
    const availableWidthGlobal = this.horizontal
      ? Math.max(
          0,
          cssWidth - padding.right - barStartXGlobal - valueLabelWidth - 8,
        )
      : chartWidth;

    normalizedData.forEach((item, index) => {
      const val = Number.isFinite(item.value) ? item.value : 0;
      let barLength = Math.max(
        0,
        (val / maxValue) * (this.horizontal ? chartWidth : chartHeight),
      );
      let x = padding.left + index * (barWidth + 10) + 5;
      let y = padding.top + chartHeight - barLength;
      if (this.horizontal) {
        x = barStartXGlobal;
        y = padding.top + index * (barWidth + 10) + 5;
        const available = availableWidthGlobal;
        const clampedBarLength = Math.max(0, (val / maxValue) * available);
        barLength = clampedBarLength;
      }

      if (
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        Number.isFinite(barLength) &&
        barLength > 0
      ) {
        try {
          const gradient = this.horizontal
            ? this.ctx.createLinearGradient(x, y, x + barLength, y)
            : this.ctx.createLinearGradient(x, y, x, y + barLength);
          gradient.addColorStop(0, this.color);
          gradient.addColorStop(1, this.adjustColor(this.color, -30));
          this.ctx.fillStyle = gradient;
        } catch (e) {
          this.ctx.fillStyle = this.color;
        }
      } else {
        this.ctx.fillStyle = this.color;
      }
      this.ctx.beginPath();
      const drawW = this.horizontal
        ? Math.min(barLength, availableWidthGlobal)
        : barWidth;
      const drawH = this.horizontal ? barWidth : barLength;
      if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(drawW) ||
        !Number.isFinite(drawH)
      )
        return;
      if (typeof this.ctx.roundRect === 'function') {
        this.ctx.roundRect(x, y, drawW, drawH, [4, 4, 0, 0]);
      } else {
        this.ctx.fillRect(x, y, drawW, drawH);
      }
      this.ctx.fill();

      this.ctx.fillStyle = '#374151';
      this.ctx.font = `bold ${Math.max(10, Math.round(cssWidth * 0.03))}px sans-serif`;
      this.ctx.textAlign = 'center';
      if (this.horizontal) {
        this.ctx.fillText(
          item.value.toString(),
          x + drawW + 12,
          y + drawH / 2 + 3,
        );
      } else {
        this.ctx.fillText(item.value.toString(), x + drawW / 2, y - 5);
      }

      this.ctx.fillStyle = '#6b7280';
      this.ctx.font = `${Math.max(9, Math.round(cssWidth * 0.03))}px sans-serif`;
      let label = String(item.label ?? '');
      this.ctx.font = `${Math.max(9, Math.round(cssWidth * 0.03))}px sans-serif`;
      if (this.horizontal) {
        if (this.ctx.measureText(label).width > labelArea) {
          let low = 0;
          let high = label.length;
          let fit = '';
          while (low < high) {
            const mid = Math.ceil((low + high) / 2);
            const attempt = label.substring(0, mid);
            if (this.ctx.measureText(attempt + '...').width <= labelArea) {
              low = mid;
              fit = attempt;
            } else {
              high = mid - 1;
            }
          }
          if (!fit && label.length > 0)
            fit = label.substring(0, Math.max(0, low - 1));
          if (fit && fit.length < label.length) label = fit + '...';
        }
      } else {
        if (label.length > 12) label = label.substring(0, 10) + '...';
      }
      this.ctx.save();
      const labTranslateX = this.horizontal
        ? padding.left + labelArea
        : x + drawW / 2;
      const labTranslateY = this.horizontal
        ? y + drawH / 2
        : cssHeight - padding.bottom + 10;
      this.ctx.translate(labTranslateX, labTranslateY);
      if (this.horizontal) {
        this.ctx.textAlign = 'right';
        this.ctx.fillText(label, 0, 0);
      } else {
        this.ctx.rotate(-Math.PI / 4);
        this.ctx.textAlign = 'right';
        this.ctx.fillText(label, 0, 0);
      }
      this.ctx.restore();
    });

    this.ctx.strokeStyle = '#e5e7eb';
    this.ctx.lineWidth = 1;
    const nf = new Intl.NumberFormat();
    if (this.horizontal) {
      const barStartXGlobal = padding.left + labelArea + 12;
      const availableWidthGlobal = Math.max(
        0,
        cssWidth - padding.right - barStartXGlobal - valueLabelWidth - 8,
      );
      for (let i = 0; i <= 4; i++) {
        const x = barStartXGlobal + (availableWidthGlobal / 4) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(x, padding.top);
        this.ctx.lineTo(x, cssHeight - padding.bottom);
        this.ctx.stroke();
        const value = Math.round((maxValue / 4) * i);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(nf.format(value), x, cssHeight - padding.bottom + 14);
      }
    } else {
      for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        this.ctx.beginPath();
        this.ctx.moveTo(padding.left, y);
        this.ctx.lineTo(cssWidth - padding.right, y);
        this.ctx.stroke();

        const value = Math.round(maxValue - (maxValue / 4) * i);
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.font = '10px sans-serif';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(nf.format(value), padding.left - 5, y + 3);
      }
    }
  }

  private adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(
      0,
      Math.min(255, Number.parseInt(hex.substr(0, 2), 16) + amount),
    );
    const g = Math.max(
      0,
      Math.min(255, Number.parseInt(hex.substr(2, 2), 16) + amount),
    );
    const b = Math.max(
      0,
      Math.min(255, Number.parseInt(hex.substr(4, 2), 16) + amount),
    );
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}
