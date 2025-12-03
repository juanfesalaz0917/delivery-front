import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import type { Product } from '../../../core/models';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ConfirmDialogComponent],
  templateUrl: './products-list.component.html',
})
export class ProductsListComponent implements OnInit {
  private readonly productsService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  products = signal<Product[]>([]);
  loading = signal(true);
  searchTerm = signal('');
  currentPage = signal(1);
  totalPages = signal(1);
  itemsPerPage = 12;

  showDeleteDialog = signal(false);
  productToDelete = signal<Product | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading.set(true);
    this.productsService
      .getAll(this.currentPage(), this.itemsPerPage)
      .subscribe({
        next: (response) => {
          this.products.set(response);
          this.totalPages.set(Math.ceil(response.length / this.itemsPerPage));
          this.loading.set(false);
        },
        error: () => {
          this.notificationService.error('Error al cargar productos');
          this.loading.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  get filteredProducts(): Product[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.products();
    return this.products().filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.description?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term),
    );
  }

  confirmDelete(product: Product): void {
    this.productToDelete.set(product);
    this.showDeleteDialog.set(true);
  }

  onDeleteConfirmed(): void {
    const product = this.productToDelete();
    if (!product?.id) return;

    this.productsService.delete(product.id).subscribe({
      next: () => {
        this.notificationService.success('Producto eliminado correctamente');
        this.loadProducts();
        this.showDeleteDialog.set(false);
      },
      error: () => {
        this.notificationService.error('Error al eliminar producto');
      },
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog.set(false);
    this.productToDelete.set(null);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProducts();
    }
  }
}