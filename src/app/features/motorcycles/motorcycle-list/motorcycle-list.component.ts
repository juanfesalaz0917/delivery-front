import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { Motorcycle } from '../../../core/models';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-motorcycles-list',
  templateUrl: './motorcycle-list.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent]
})
export class MotorcyclesListComponent implements OnInit {

  private service = inject(MotorcycleService);

  motorcycles = signal<Motorcycle[]>([]);
  filteredMotorcycles = computed(() => {
    return this.motorcycles().filter(m =>
      m.license_plate.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  });

  loading = signal(false);
  searchTerm = signal('');

  showDeleteDialog = signal(false);
  motorcycleToDelete = signal<Motorcycle | null>(null);

  ngOnInit() {
    this.loadMotorcycles();
  }

  loadMotorcycles() {
    this.loading.set(true);
    this.service.getAll().subscribe({
      next: (data) => {
        this.motorcycles.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSearch(value: string) {
    this.searchTerm.set(value);
  }

  confirmDelete(motorcycle: Motorcycle) {
    this.motorcycleToDelete.set(motorcycle);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed() {
    const id = this.motorcycleToDelete()?.id;
    if (!id) return;

    this.service.delete(id.toString()).subscribe(() => {
      this.loadMotorcycles();
      this.showDeleteDialog.set(false);
    });
  }

  onDeleteCancelled() {
    this.showDeleteDialog.set(false);
  }

  getStatusLabel(status: string) {
    return {
      active: 'Activa',
      inactive: 'Inactiva',
      maintenance: 'Mantenimiento'
    }[status] || status;
  }

  getStatusColor(status: string) {
    return {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      maintenance: 'bg-yellow-100 text-yellow-800'
    }[status] || 'bg-gray-100';
  }
}
