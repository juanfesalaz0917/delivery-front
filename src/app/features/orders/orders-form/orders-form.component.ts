import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { CustomersService } from '../../../core/services/customers.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';
import { ProductService } from '../../../core/services/product.service';
import type { Order, Customer, Restaurant, Menu, Product, Motorcycle } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { MotorcycleService } from '../../../core/services/motorcycle.service';

@Component({
  selector: 'app-orders-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './orders-form.component.html',
})
export class OrdersFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrderService);
  private readonly customersService = inject(CustomersService);
  private readonly restaurantsService = inject(RestaurantService);
  private readonly menusService = inject(MenuService);
  private readonly productsService = inject(ProductService);
  private readonly motorcyclesService = inject(MotorcycleService);
  private readonly notificationService = inject(NotificationService);

  orderForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  orderId: string | null = null;
  
  // Datos para selects
  customers = signal<Customer[]>([]);
  restaurants = signal<Restaurant[]>([]);
  menus = signal<Menu[]>([]);
  products = signal<Product[]>([]);
  motorcycles = signal<Motorcycle[]>([]);
  filteredMenus = signal<Menu[]>([]);
  
  loadingCustomers = signal(false);
  loadingRestaurants = signal(false);
  loadingMenus = signal(false);
  loadingProducts = signal(false);
  loadingMotorcycles = signal(false);
  
  // Productos/Menús seleccionados
  selectedItems = signal<Array<{ type: 'menu' | 'product', item: Menu | Product, quantity: number }>>([]);
  
  orderStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
    this.loadRestaurants();
    this.loadMenus();
    this.loadProducts();
    this.loadMotorcycles();
    
    this.orderId = this.route.snapshot.paramMap.get('id');
    
    if (this.orderId) {
      this.isEditMode.set(true);
      this.loadOrder(this.orderId);
    }
    
    // Escuchar cambios en el restaurante seleccionado
    this.orderForm.get('restaurant_id')?.valueChanges.subscribe(restaurant_id=> {
      this.filterMenusByRestaurant(restaurant_id);
    });
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      customer_id: ['', Validators.required],
      restaurant_id: ['', Validators.required],
      motorcycle_id: [''], // El motociclista se asigna automáticamente, pero se incluye la referencia
      status: ['pending', Validators.required],
      notes: [''],
    });
  }

  loadCustomers(): void {
    this.loadingCustomers.set(true);
    this.customersService.getAll(1, 100).subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.loadingCustomers.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar clientes');
        this.loadingCustomers.set(false);
      },
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

  loadMenus(): void {
    this.loadingMenus.set(true);
    this.menusService.getAll(1, 100).subscribe({
      next: (menus) => {
        this.menus.set(menus);
        this.loadingMenus.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar menús');
        this.loadingMenus.set(false);
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

  loadMotorcycles(): void {
    this.loadingMotorcycles.set(true);
    this.motorcyclesService.getAll(1, 100).subscribe({
      next: (motorcycle) => {
        this.motorcycles.set(motorcycle);
        this.loadingMotorcycles.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar motociclistas');
        this.loadingMotorcycles.set(false);
      },
    });
  }

  filterMenusByRestaurant(restaurant_id: string): void {
    if (!restaurant_id) {
      this.filteredMenus.set([]);
      return;
    }
    const filtered = this.menus().filter(m => m.restaurant_id === +restaurant_id);
    this.filteredMenus.set(filtered);
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.ordersService.getById(id).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          customer_id: order.customer_id,
          restaurant_id: order.menu.restaurant,
          motorcycle_id: order.motorcycle_id,
          status: order.status,
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar la orden');
        this.router.navigate(['/orders']);
      },
    });
  }

  addMenu(menuId: string): void {
    const menu = this.filteredMenus().find(m => String(m.id) === menuId);
    if (!menu) return;
    
    const exists = this.selectedItems().find(
      item => item.type === 'menu' && item.item.id === +menuId
    );
    
    if (exists) {
      this.notificationService.error('Este menú ya está agregado');
      return;
    }
    
    this.selectedItems.set([
      ...this.selectedItems(),
      { type: 'menu', item: menu, quantity: 1 }
    ]);
  }

  addProduct(productId: string): void {
    const product = this.products().find(p => p.id === +productId);
    if (!product) return;
    
    const exists = this.selectedItems().find(
      item => item.type === 'product' && item.item.id === +productId
    );
    
    if (exists) {
      this.notificationService.error('Este producto ya está agregado');
      return;
    }
    
    this.selectedItems.set([
      ...this.selectedItems(),
      { type: 'product', item: product, quantity: 1 }
    ]);
  }

  removeItem(index: number): void {
    this.selectedItems.set(this.selectedItems().filter((_, i) => i !== index));
  }

  updateQuantity(index: number, quantity: number): void {
    if (quantity < 1) return;
    const items = [...this.selectedItems()];
    items[index].quantity = quantity;
    this.selectedItems.set(items);
  }

  calculateTotal(): number {
    return this.selectedItems().reduce((total, item) => {
      return total + (item.item.price * item.quantity);
    }, 0);
  }

  getTotalQuantity(): number {
    return this.selectedItems().reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    if (this.selectedItems().length === 0) {
      this.notificationService.error('Debes agregar al menos un producto o menú');
      return;
    }

    this.loading.set(true);
    const orderData: Order = {
      ...this.orderForm.value,
      items: this.selectedItems(),
      total: this.calculateTotal(),
    };

    const request = this.isEditMode() && this.orderId
      ? this.ordersService.update(this.orderId, orderData)
      : this.ordersService.create(orderData);

    request.pipe(
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() 
            ? 'Orden actualizada correctamente'
            : 'Orden creada correctamente'
        );
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.notificationService.error(
          this.isEditMode()
            ? 'Error al actualizar la orden'
            : 'Error al crear la orden'
        );
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getCustomerName(customer_id: string): string {
    return this.customers().find(c => c.id === Number(customer_id))?.name || 'Desconocido';
  }

  getRestaurantName(restaurant_id: string): string {
    return this.restaurants().find(r => r.id === Number(restaurant_id))?.name || 'Desconocido';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      preparing: 'En preparación',
      ready: 'Lista',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
    };
    return labels[status] || status;
  }

  getMotorcycleName(motorcycle_id: string): string {
    const motorcycle = this.motorcycles().find(m => m.id === Number(motorcycle_id));
    return motorcycle ? `${motorcycle.id} - ${motorcycle.license_plate}` : 'No asignado';
  }

  getAvailableMotorcycles(): Motorcycle[] {
    // Aquí podrías filtrar solo los motociclistas disponibles
    return this.motorcycles();
  }
}
