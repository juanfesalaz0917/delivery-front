import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../../core/services/restaurant.service';
import type { Restaurant } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-restaurants-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './restaurants-list.component.html',
})
export class RestaurantsListComponent implements OnInit {
  private readonly restaurantService = inject(RestaurantService);
  private readonly notificationService = inject(NotificationService);

  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 10;

  showDeleteDialog = signal(false);
  restaurantToDelete = signal<Restaurant | null>(null);

  ngOnInit(): void {
    this.loadRestaurants();
  }

  loadRestaurants(): void {
    this.loading.set(true);
    this.restaurantService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.restaurants.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar restaurantes');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  get filteredRestaurants(): Restaurant[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.restaurants();
    return this.restaurants().filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term) ||
        r.phone?.includes(term),
    );
  }

  confirmDelete(restaurant: Restaurant): void {
    this.restaurantToDelete.set(restaurant);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const restaurant = this.restaurantToDelete();
    if (!restaurant?.id) return;

    this.restaurantService.delete(restaurant.id).subscribe({
      next: () => {
        this.notificationService.success('Restaurante eliminado correctamente');
        this.loadRestaurants();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar restaurante');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.restaurantToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadRestaurants();
    }
  }
}