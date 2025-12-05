import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import type { Motorcycle } from '../../../core/models';
import { MotorcycleService } from '../../../core/services/motorcycle.service';


@Component({
  selector: 'app-motorcycles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './motorcycle-form.component.html'
})

export class MotorcyclesFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private service = inject(MotorcycleService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  motorcycleId = signal<number | null>(null);

  motorcycleForm = this.fb.group({
    license_plate: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    year: [2024, [Validators.required, Validators.min(1990)]],
    status: ['active', [Validators.required]]
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.motorcycleId.set(+id);
      this.loadMotorcycle(+id);
    }
  }

  isEditMode = computed(() => this.motorcycleId() !== null);

  loadMotorcycle(id: number) {
    this.loading.set(true);
    this.service.getById(id.toString()).subscribe({
      next: (motorcycle) => {
        this.motorcycleForm.patchValue(motorcycle);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onSubmit() {
    if (this.motorcycleForm.invalid) {
      this.motorcycleForm.markAllAsTouched();
      return;
    }

    const payload: Motorcycle = this.motorcycleForm.value as Motorcycle;
    this.loading.set(true);

    const request = this.isEditMode()
      ? this.service.update(this.motorcycleId()!.toString(), payload)
      : this.service.create(payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/motorcycles']);
      },
      error: () => this.loading.set(false)
    });
  }

  onCancel() {
    this.router.navigate(['/motorcycles']);
  }

  isFieldInvalid(field: string) {
    const control = this.motorcycleForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getFieldError(field: string): string {
    const control = this.motorcycleForm.get(field);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'Este campo es obligatorio';
    if (control.errors['min']) return 'Año inválido';

    return 'Campo inválido';
  }

  getStatusLabel(status: string) {
    return {
      active: 'Activa',
      inactive: 'Inactiva',
      maintenance: 'En Mantenimiento'
    }[status] || status;
  }
}

