import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import type { Menu, Restaurant } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-menus-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './menus-list.component.html',
})
export class MenusListComponent implements OnInit {
  private readonly menusService = inject(MenuService);
  private readonly restaurantsService = inject(RestaurantService);
  private readonly notificationService = inject(NotificationService);

  menus = signal<Menu[]>([]);
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 10;

  showDeleteDialog = signal(false);
  menuToDelete = signal<Menu | null>(null);

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadMenus();
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

  loadMenus(): void {
    this.loading.set(true);
    this.menusService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.menus.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar menús');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  get filteredMenus(): Menu[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.menus();
    return this.menus().filter(
      (m) =>
        this.getRestaurantName(m.restaurant_id.toString()).toLowerCase().includes(term),
    );
  }

  confirmDelete(menu: Menu): void {
    this.menuToDelete.set(menu);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const menu = this.menuToDelete();
    if (!menu?.id) return;

    this.menusService.delete(menu.id).subscribe({
      next: () => {
        this.notificationService.success('Menú eliminado correctamente');
        this.loadMenus();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar menú');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.menuToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadMenus();
    }
  }

  getRestaurantName(restaurantId: string): string {
    return this.restaurants().find(r => r.id === Number(restaurantId))?.name || 'Desconocido';
  }
}