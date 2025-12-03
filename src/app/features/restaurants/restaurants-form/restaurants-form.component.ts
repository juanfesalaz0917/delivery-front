import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { Restaurant, Menu } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';
import { RestaurantService } from '../../../core/services/restaurant.service';
import { MenuService } from '../../../core/services/menu.service';

@Component({
  selector: 'app-restaurants-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './restaurants-form.component.html',
})
export class RestaurantsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly restaurantService = inject(RestaurantService);
  private readonly menuService = inject(MenuService);
  private readonly notificationService = inject(NotificationService);

  restaurantForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  restaurantId: string | null = null;
  
  // Menus asociados al restaurante
  restaurantMenus = signal<Menu[]>([]);
  loadingMenus = signal(false);

  ngOnInit(): void {
    this.initForm();
    this.restaurantId = this.route.snapshot.paramMap.get('id');
    
    if (this.restaurantId) {
      this.isEditMode.set(true);
      this.loadRestaurant(this.restaurantId);
      this.loadRestaurantMenus(this.restaurantId);
    }
  }

  initForm(): void {
    this.restaurantForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      description: [''],
    });
  }

  loadRestaurant(id: string): void {
    this.loading.set(true);
    this.restaurantService.getById(id).subscribe({
      next: (restaurant) => {
        this.restaurantForm.patchValue({
          name: restaurant.name,
          address: restaurant.address,
          phone: restaurant.phone,
          email: restaurant.email,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar el restaurante');
        this.loading.set(false);
        this.router.navigate(['/restaurants']);
      },
    });
  }

  loadRestaurantMenus(restaurantId: string): void {
    this.loadingMenus.set(true);
    this.menuService.getByRestaurantId(restaurantId).subscribe({
      next: (menus) => {
        this.restaurantForm.patchValue(menus);
        this.loadingMenus.set(false);
      },
      error: () => {
        this.loadingMenus.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.restaurantForm.invalid) {
      this.restaurantForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const restaurantData: Restaurant = this.restaurantForm.value;

    const request = this.isEditMode() && this.restaurantId
      ? this.restaurantService.update(this.restaurantId, restaurantData)
      : this.restaurantService.create(restaurantData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() 
            ? 'Restaurante actualizado correctamente'
            : 'Restaurante creado correctamente'
        );
        this.router.navigate(['/restaurants']);
      },
      error: () => {
        this.notificationService.error(
          this.isEditMode()
            ? 'Error al actualizar el restaurante'
            : 'Error al crear el restaurante'
        );
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/restaurants']);
  }

  navigateToMenu(menuId: string): void {
    this.router.navigate(['/menus/edit', menuId]);
  }

  createNewMenu(): void {
    this.router.navigate(['/menus/new'], { 
      queryParams: { restaurantId: this.restaurantId } 
    });
  }

  getFieldError(fieldName: string): string {
    const field = this.restaurantForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('email')) return 'Email inválido';
    if (field?.hasError('minlength')) return 'Mínimo 2 caracteres';
    if (field?.hasError('pattern')) return 'Formato inválido (10 dígitos)';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.restaurantForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}