import { Component, inject, signal, type OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import type { Product } from '../../../core/models';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-products-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './products-form.component.html',
})
export class ProductsFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  productForm!: FormGroup;
  isEditMode = signal(false);
  loading = signal(false);
  productId: string | null = null;
  
  // Categorías predefinidas (puedes ajustarlas según tu necesidad)
  categories = [
    'Comida Rápida',
    'Bebidas',
    'Postres',
    'Ensaladas',
    'Pastas',
    'Carnes',
    'Pescados',
    'Pizzas',
    'Hamburguesas',
    'Sopas',
    'Vegetariano',
    'Vegano',
    'Otro',
  ];

  ngOnInit(): void {
    this.initForm();
    this.productId = this.route.snapshot.paramMap.get('id');
    
    if (this.productId) {
      this.isEditMode.set(true);
      this.loadProduct(this.productId);
    }
  }

  initForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      available: [true],
      imageUrl: [''],
    });
  }

  loadProduct(id: string): void {
    this.loading.set(true);
    this.productsService.getById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
        });
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Error al cargar el producto');
        this.loading.set(false);
        this.router.navigate(['/products']);
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const productData: Product = this.productForm.value;

    const request = this.isEditMode() && this.productId
      ? this.productsService.update(this.productId, productData)
      : this.productsService.create(productData);

    request.subscribe({
      next: () => {
        this.notificationService.success(
          this.isEditMode() 
            ? 'Producto actualizado correctamente'
            : 'Producto creado correctamente'
        );
        this.router.navigate(['/products']);
      },
      error: () => {
        this.notificationService.error(
          this.isEditMode()
            ? 'Error al actualizar el producto'
            : 'Error al crear el producto'
        );
        this.loading.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.hasError('required')) return 'Este campo es requerido';
    if (field?.hasError('minlength')) return 'Mínimo 2 caracteres';
    if (field?.hasError('min')) return 'El valor debe ser mayor o igual a 0';
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }
}
