import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../core/services/order.service';
import { CustomersService } from '../../../core/services/customers.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import type { Order, Customer, Restaurant } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './orders-list.component.html',
})
export class OrdersListComponent implements OnInit {
  private readonly ordersService = inject(OrderService);
  private readonly customersService = inject(CustomersService);
  private readonly restaurantsService = inject(RestaurantService);
  private readonly notificationService = inject(NotificationService);

  orders = signal<Order[]>([]);
  customers = signal<Customer[]>([]);
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  statusFilter = signal<string>('all');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 10;

  showDeleteDialog = signal(false);
  orderToDelete = signal<Order | null>(null);

  orderStatuses = [
    { value: 'all', label: 'Todos' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'confirmed', label: 'Confirmada' },
    { value: 'preparing', label: 'En preparación' },
    { value: 'ready', label: 'Lista' },
    { value: 'delivered', label: 'Entregada' },
    { value: 'cancelled', label: 'Cancelada' },
  ];

  ngOnInit(): void {
    this.loadCustomers();
    this.loadRestaurants();
    this.loadOrders();
  }

  loadCustomers(): void {
    this.customersService.getAll(1, 100).subscribe({
      next: (customers) => {
        this.customers.set(customers);
      },
      error: () => {
        this.notificationService.error('Error al cargar clientes');
      },
    });
  }

  loadRestaurants(): void {
    this.restaurantsService.getAll(1, 100).subscribe({
      next: (restaurants) => {
        this.restaurants.set(restaurants);
      },
      error: () => {
        this.notificationService.error('Error al cargar restaurantes');
      },
    });
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.orders.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar órdenes');
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

  get filteredOrders(): Order[] {
    let filtered = this.orders();
    
    // Filter by search term
    const term = this.searchTerm().toLowerCase();
    if (term) {
      filtered = filtered.filter(
        (o) =>
          this.getCustomerName(o.customer_id.toString()).toLowerCase().includes(term) ||
          this.getRestaurantName(o.menu.restaurant.toString()).toLowerCase().includes(term) ||
          o.id?.toString().toLowerCase().includes(term),
      );
    }
    
    // Filter by status
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(o => o.status === this.statusFilter());
    }
    
    return filtered;
  }

  confirmDelete(order: Order): void {
    this.orderToDelete.set(order);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const order = this.orderToDelete();
    if (!order?.id) return;

    this.ordersService.delete(order.id).subscribe({
      next: () => {
        this.notificationService.success('Orden eliminada correctamente');
        this.loadOrders();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar orden');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.orderToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadOrders();
    }
  }

  getCustomerName(customerId: string): string {
    return this.customers().find(c => c.id === Number(customerId))?.name || 'Desconocido';
  }

  getRestaurantName(restaurantId: string): string {
    return this.restaurants().find(r => r.id === Number(restaurantId))?.name || 'Desconocido';
  }

  getStatusLabel(status: string): string {
    return this.orderStatuses.find(s => s.value === status)?.label || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}