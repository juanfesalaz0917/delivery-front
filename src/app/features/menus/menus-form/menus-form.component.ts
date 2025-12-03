import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuService } from '../../../core/services/menu.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { ProductService } from '../../../core/services/product.service';
import type { Menu, Restaurant, Product } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-menus-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './menus-form.component.html',
})
export class MenusFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly menusService = inject(MenuService);
  private readonly restaurantsService = inject(RestaurantService);
  private readonly productsService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  menuForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  menuId: string | null = null;
  
  // Datos para selects
  restaurants = signal<Restaurant[]>([]);
  products = signal<Product[]>([]);
  loadingRestaurants = signal(false);
  loadingProducts = signal(false);
  
  // Productos seleccionados para el menú
  selectedProducts = signal<Product[]>([]);

  ngOnInit(): void {
    this.initForm();
    this.loadRestaurants();
    this.loadProducts();
    
    this.menuId = this.route.snapshot.paramMap.get('id');
    const preselectedRestaurantId = this.route.snapshot.queryParamMap.get('restaurantId');
    
    if (this.menuId) {
      this.isEditMode.set(true);
      this.loadMenu(this.menuId);
    } else if (preselectedRestaurantId) {
      this.menuForm.patchValue({ restaurantId: preselectedRestaurantId });
    }
  }

  initForm(): void {
    this.menuForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      restaurantId: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      available: [true],
    });
  }

  loadRestaurants(): void {
    this.loadingRestaurants.set(true);
    this.restaurantsService.getAll(1, 100).subscribe({
      next: (restaurants) => {
        this.restaurants.set(restaurants);
        this.loadingRestaurants.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar restaurantes');
        this.loadingRestaurants.set(false);
      },
    });
  }

  loadProducts(): void {
    this.loadingProducts.set(true);
    this.productsService.getAll(1, 100).subscribe({
      next: (products) => {
        this.products.set(products);
        this.loadingProducts.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar productos');
        this.loadingProducts.set(false);
      },
    });
  }

  loadMenu(id: string): void {
    this.loading.set(true);
    this.menusService.getByRestaurantId(id).subscribe({
      next: (menu) => {
        this.menuForm.patchValue({
          id: menu.id,
          restaurantId: menu.restaurant_id,
          productIds: menu.product_id,
          price: menu.price,
          available: menu.availiability,
          products : menu.product,
          restaurant : menu.restaurant,
        });
        if (menu.product) {
          this.selectedProducts.set(Array.isArray(menu.product) ? menu.product : [menu.product]);
        }
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar el menú');
        this.loading.set(false);
        this.router.navigate(['/menus']);
      },
    });
  }

  toggleProduct(product: Product): void {
    const current = this.selectedProducts();
    const index = current.findIndex(p => p.id === product.id);
    
    if (index > -1) {
      this.selectedProducts.set(current.filter(p => p.id !== product.id));
    } else {
      this.selectedProducts.set([...current, product]);
    }
  }

  isProductSelected(productId: string): boolean {
    return this.selectedProducts().some(p => p.id.toString() === productId);
  }

  onSubmit(): void {
    if (this.menuForm.invalid) {
      this.menuForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const menuData: Menu = {
      ...this.menuForm.value,
      productIds: this.selectedProducts().map(p => p.id),
    };

    const request = this.isEditMode() && this.menuId
      ? this.menusService.update(this.menuId, menuData)
      : this.menusService.create(menuData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() 
            ? 'Menú actualizado correctamente'
            : 'Menú creado correctamente'
        );
        this.router.navigate(['/menus']);
      },
      error: () => {
        this.notificationService.error(
          this.isEditMode()
            ? 'Error al actualizar el menú'
            : 'Error al crear el menú'
        );
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/menus']);
  }

  getFieldError(fieldName: string): string {
    const field = this.menuForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('minlength')) return 'Mínimo 2 caracteres';
    if (field?.hasError('min')) return 'El precio debe ser mayor a 0';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.menuForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getRestaurantName(restaurantId: string): string {
    return this.restaurants().find(r => r.id.toString() === restaurantId)?.name || 'Desconocido';
  }
}