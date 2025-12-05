import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Order, Customer, Restaurant, Menu, Product, Motorcycle } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { OrderService } from '../../../core/services/order.service';
import { CustomersService } from '../../../core/services/customers.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { ProductService } from '../../../core/services/product.service';
import { MotorcycleService } from '../../../core/services/motorcycle.service';
import { MenuService } from '../../../core/services/menu.service';

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
  
  loadingCustomers = signal(false);
  loadingRestaurants = signal(false);
  loadingMenus = signal(false);
  loadingProducts = signal(false);
  loadingMotorcycles = signal(false);
  
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
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      customer_id: ['', Validators.required],
      restaurant_id: ['', Validators.required],
      menu_id: [''],
      product_id: [''],
      motorcycle_id: [''], // Opcional - se asigna automáticamente si no se selecciona
      status: ['pending', Validators.required],
      total: [0, [Validators.required, Validators.min(0)]],
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
      next: (motorcycles) => {
        this.motorcycles.set(motorcycles);
        this.loadingMotorcycles.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar motocicletas');
        this.loadingMotorcycles.set(false);
      },
    });
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.ordersService.getById(id).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          customer_id: order.customer_id,
          restaurant_id: order.menu.restaurant_id,
          menu_id: order.menu_id,
          product_id: order.menu.product_id,
          motorcycle_id: order.motorcycle_id,
          status: order.status,
          total: order.total_price,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar la orden');
        this.loading.set(false);
        this.router.navigate(['/orders']);
      },
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    // Validar que al menos un menú o producto esté seleccionado
    if (!this.orderForm.value.menu_id && !this.orderForm.value.product_id) {
      this.notificationService.error('Debes seleccionar al menos un menú o producto');
      return;
    }

    this.loading.set(true);
    const orderData: Order = this.orderForm.value;

    const request = this.isEditMode() && this.orderId
      ? this.ordersService.update(this.orderId, orderData)
      : this.ordersService.create(orderData);

    request.subscribe({
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
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('min')) return 'El valor debe ser mayor o igual a 0';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getCustomerName(customerId: string): string {
    return this.customers().find(c => c.id?.toString() === customerId)?.name || 'Desconocido';
  }

  getRestaurantName(restaurantId: string): string {
    return this.restaurants().find(r => r.id?.toString() === restaurantId)?.name || 'Desconocido';
  }

  getMenuName(menuId: string): string {
    return this.menus().find(m => m.id?.toString() === menuId)?.id.toString() || 'Ninguno';
  }

  getProductName(productId: string): string {
    return this.products().find(p => p.id?.toString() === productId)?.name || 'Ninguno';
  }

  getMotorcycleName(motorcycle_id: string): string {
    const motorcycle = this.motorcycles().find(m => m.id?.toString() === motorcycle_id);
    return motorcycle ? `${motorcycle.brand} ${motorcycle.id} - ${motorcycle.license_plate}` : 'No asignado';
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

  getAvailableMotorcycles(): Motorcycle[] {
    // Filtrar solo motocicletas disponibles
    return this.motorcycles().filter(m => m.status === 'available');
  }

  // Calcular total automáticamente basado en menú o producto seleccionado
  updateTotal(): void {
    let total = 0;
    const menuId = this.orderForm.get('menu_id')?.value;
    const productId = this.orderForm.get('product_id')?.value;

    if (menuId) {
      const menu = this.menus().find(m => m.id?.toString() === menuId);
      if (menu?.price) total += menu.price;
    }

    if (productId) {
      const product = this.products().find(p => p.id?.toString() === productId);
      if (product?.price) total += product.price;
    }

    this.orderForm.patchValue({ total });
  }
}