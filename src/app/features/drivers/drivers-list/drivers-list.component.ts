import { Component, inject, signal, computed, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DriverService } from '../../../core/services/driver.service';
import type { Driver } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './drivers-list.component.html',
})
export class DriverListComponent implements OnInit {
  private readonly driverService = inject(DriverService);
  private readonly notificationService = inject(NotificationService);

  drivers = signal<Driver[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  statusFilter = signal<string>('all');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 10;

  showDeleteDialog = signal(false);
  driverToDelete = signal<Driver | null>(null);

  statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'suspended', label: 'Suspendidos' },
  ];

  ngOnInit(): void {
    this.loadDrivers();
  }

  loadDrivers(): void {
    this.loading.set(true);
    this.driverService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.drivers.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar conductores');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status);
  }

  filteredDrivers = computed(() => {
    let filtered = this.drivers();
    
    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(term) ||
          d.email.toLowerCase().includes(term) ||
          d.phone.includes(term) ||
          d.license_number.toLowerCase().includes(term),
      );
    }
    
    // Filter by status
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(d => d.status === this.statusFilter());
    }
    
    return filtered;
  });

  activeCount = computed(() => this.drivers().filter(d => d.status === 'active').length);
  inactiveCount = computed(() => this.drivers().filter(d => d.status === 'inactive').length);
  suspendedCount = computed(() => this.drivers().filter(d => d.status === 'suspended').length);

  confirmDelete(driver: Driver): void {
    this.driverToDelete.set(driver);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const driver = this.driverToDelete();
    if (!driver?.id) return;

    this.driverService.delete(driver.id.toString()).subscribe({
      next: () => {
        this.notificationService.success('Conductor eliminado correctamente');
        this.loadDrivers();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar conductor');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.driverToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadDrivers();
    }
  }

  getStatusLabel(status: Driver['status']): string {
    const labels: Record<string, string> = {
      active: 'Activo',
      inactive: 'Inactivo',
      suspended: 'Suspendido',
    };
    return labels[status] || status;
  }

  getStatusColor(status: Driver['status']): string {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getRatingStars(rating: number = 0): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? '★' : '☆');
    }
    return stars;
  }
}