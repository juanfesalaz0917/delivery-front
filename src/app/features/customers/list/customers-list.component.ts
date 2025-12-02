import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomersService } from '../../../core/services/customers.service';
import type { Customer } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-customers-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './customers-list.component.html',
})
export class CustomersListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly notificationService = inject(NotificationService);

  customers = signal<Customer[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 10;

  showDeleteDialog = signal(false);
  customerToDelete = signal<Customer | null>(null);

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading.set(true);
    this.customersService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.customers.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar customers');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  get filteredCustomers(): Customer[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.customers();
    return this.customers().filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term) ||
        c.phone.includes(term),
    );
  }

  confirmDelete(customer: Customer): void {
    this.customerToDelete.set(customer);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const customer = this.customerToDelete();
    if (!customer?.id) return;

    this.customersService.delete(customer.id).subscribe({
      next: () => {
        this.notificationService.success('Customer eliminado correctamente');
        this.loadCustomers();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar cliente');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.customerToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCustomers();
    }
  }
}
